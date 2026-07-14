import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, userAccounts, people } from "@mphm/db";
import { eq, like, or, sql, desc } from "drizzle-orm";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";

const usersAdmin = new Hono<AppEnv>();

// ============================================================
// LIST ALL USER ACCOUNTS (dengan data orang terkait)
// ============================================================
usersAdmin.get("/", requireRole(["Sekretariat"]), async (c) => {
  const db = createDb(c.env.DB);
  const query = c.req.query("query") || "";
  const limit = Number(c.req.query("limit") || 50);
  const offset = Number(c.req.query("offset") || 0);

  const searchPattern = query ? `%${query}%` : null;

  const result = await db.run(sql`
    SELECT 
      ua.id as id,
      ua.username as username,
      ua.role as role,
      ua.is_active as isActive,
      ua.last_login_at as lastLoginAt,
      ua.created_at as createdAt,
      p.id as personId,
      p.full_name as fullName,
      p.avatar_url as avatarUrl,
      p.gender as gender
    FROM user_accounts ua
    INNER JOIN people p ON ua.person_id = p.id
    ${searchPattern 
      ? sql`WHERE (ua.username LIKE ${searchPattern} OR p.full_name LIKE ${searchPattern} OR ua.role LIKE ${searchPattern})` 
      : sql``
    }
    ORDER BY ua.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return c.json({ status: "Success", data: result.results || [] });
});

// ============================================================
// CREATE USER ACCOUNT
// ============================================================
const createUserSchema = z.object({
  personId: z.string().uuid("Person ID tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["Sekretariat", "Mustahiq", "Mufattisy", "Mundzir", "Petugas Keamanan", "Wali Santri"]),
});

usersAdmin.post("/", requireRole(["Sekretariat"]), zValidator("json", createUserSchema), async (c) => {
  const db = createDb(c.env.DB);
  const data = c.req.valid("json");

  // Cek apakah username sudah ada
  const existing = await db
    .select({ id: userAccounts.id })
    .from(userAccounts)
    .where(eq(userAccounts.username, data.username))
    .get();

  if (existing) {
    return c.json({ status: "Error", message: "Username sudah digunakan." }, 400);
  }

  // Cek apakah person sudah punya akun
  const existingPerson = await db
    .select({ id: userAccounts.id })
    .from(userAccounts)
    .where(eq(userAccounts.personId, data.personId))
    .get();

  if (existingPerson) {
    return c.json({ status: "Error", message: "Orang ini sudah memiliki akun. Gunakan fitur update." }, 400);
  }

  // Hash password menggunakan Web Crypto API (Cloudflare Workers compatible)
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(data.password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const newUser = await db
    .insert(userAccounts)
    .values({
      personId: data.personId,
      username: data.username,
      passwordHash,
      role: data.role,
      isActive: true,
      updatedAt: new Date(),
    })
    .returning()
    .get();

  return c.json({
    status: "Success",
    message: "Akun berhasil dibuat.",
    data: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    },
  }, 201);
});

// ============================================================
// UPDATE USER ACCOUNT (Role / Active Status)
// ============================================================
const updateUserSchema = z.object({
  role: z.enum(["Sekretariat", "Mustahiq", "Mufattisy", "Mundzir", "Petugas Keamanan", "Wali Santri"]).optional(),
  isActive: z.boolean().optional(),
  username: z.string().min(3).max(50).optional(),
});

usersAdmin.put("/:id", requireRole(["Sekretariat"]), zValidator("json", updateUserSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.req.param("id");
  const data = c.req.valid("json");

  const existing = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, userId))
    .get();

  if (!existing) {
    return c.json({ status: "Error", message: "Akun tidak ditemukan." }, 404);
  }

  // Jika mengubah username, cek keunikan
  if (data.username && data.username !== existing.username) {
    const duplicate = await db
      .select({ id: userAccounts.id })
      .from(userAccounts)
      .where(eq(userAccounts.username, data.username))
      .get();

    if (duplicate) {
      return c.json({ status: "Error", message: "Username sudah digunakan." }, 400);
    }
  }

  // Simpan state sebelum diupdate untuk audit
  c.set("auditBeforeData", JSON.stringify(existing));

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.username !== undefined) updateData.username = data.username;

  const updated = await db
    .update(userAccounts)
    .set(updateData)
    .where(eq(userAccounts.id, userId))
    .returning()
    .get();

  return c.json({
    status: "Success",
    message: "Akun berhasil diperbarui.",
    data: {
      id: updated.id,
      username: updated.username,
      role: updated.role,
      isActive: updated.isActive,
    },
  });
});

// ============================================================
// RESET PASSWORD
// ============================================================
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

usersAdmin.post("/:id/reset-password", requireRole(["Sekretariat"]), zValidator("json", resetPasswordSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.req.param("id");
  const data = c.req.valid("json");

  const existing = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, userId))
    .get();

  if (!existing) {
    return c.json({ status: "Error", message: "Akun tidak ditemukan." }, 404);
  }

  // Simpan state sebelum diupdate untuk audit
  c.set("auditBeforeData", JSON.stringify(existing));

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(data.newPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  await db
    .update(userAccounts)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(userAccounts.id, userId));

  return c.json({ status: "Success", message: "Password berhasil direset." });
});

export { usersAdmin };
