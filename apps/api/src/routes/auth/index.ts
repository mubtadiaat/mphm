import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { eq, and, gt } from "drizzle-orm";
import { createDb, userAccounts, userSessions, people, teacherProfiles, guardianProfiles, academicClasses, academicYears } from "@mphm/db";
import type { AppEnv } from "../../types";
import { requireAuth } from "../../middlewares/authMiddleware";

const auth = new Hono<AppEnv>();

// ============================================================
// Helper: Generate secure session token
// ============================================================
function generateSessionToken(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================
// Helper: Hash password dengan Web Crypto API (PBKDF2)
// Compatible with Cloudflare Workers (no Node.js crypto)
// ============================================================
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(hashArray, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, expectedHashHex] = storedHash.split(":");
  if (!saltHex || !expectedHashHex) return false;

  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  );
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const hashHex = Array.from(hashArray, (b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex === expectedHashHex;
}

// ============================================================
// POST /api/auth/login
// ============================================================
const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

auth.post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    const { username, password } = c.req.valid("json");
    const db = createDb(c.env.DB);

    // 1. Cari user account
    const account = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.username, username))
      .get();

    if (!account) {
      return c.json(
        { status: "Error", message: "Username atau password salah." },
        401
      );
    }

    // 2. Cek status aktif
    if (!account.isActive) {
      return c.json(
        { status: "Error", message: "Akun dinonaktifkan. Hubungi Administrator." },
        403
      );
    }

    // 3. Verifikasi password
    const isValidPassword = await verifyPassword(password, account.passwordHash);
    if (!isValidPassword) {
      return c.json(
        { status: "Error", message: "Username atau password salah." },
        401
      );
    }

    // 4. Ambil data person
    const person = await db
      .select()
      .from(people)
      .where(eq(people.id, account.personId))
      .get();

    // 5. Generate session token
    const sessionToken = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3600000); // 1 jam

    // 6. Simpan session ke D1
    await db.insert(userSessions).values({
      userId: account.id,
      sessionToken,
      ipAddress: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
      expiresAt,
    });

    // 7. Update lastLoginAt
    await db
      .update(userAccounts)
      .set({ lastLoginAt: now })
      .where(eq(userAccounts.id, account.id));

    // 8. Set HttpOnly Secure Cookie
    const isProd = c.env.ENVIRONMENT === "production" || c.env.ENVIRONMENT === "development"; // Allow domain setting even if wrangler has 'development' by mistake for now
    setCookie(c, "session_token", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 3600, // 1 jam
      domain: "m.p3hm.my.id",
    });

    return c.json({
      status: "Success",
      message: "Login berhasil",
      data: {
        userId: account.id,
        personId: account.personId,
        fullName: person?.fullName || "",
        role: account.role,
        avatarUrl: person?.avatarUrl || null,
      },
    });
  }
);

// ============================================================
// POST /api/auth/logout
// ============================================================
auth.post("/logout", async (c) => {
  const sessionToken = getCookie(c, "session_token");

  if (sessionToken) {
    const db = createDb(c.env.DB);

    // Hapus session dari D1
    await db
      .delete(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
  }

  // Clear cookie
  deleteCookie(c, "session_token", {
    path: "/",
    domain: "m.p3hm.my.id",
  });

  return c.json({ status: "Success", message: "Logout berhasil" });
});

// ============================================================
// GET /api/auth/me — Return current user info
// ============================================================
auth.get("/me", async (c) => {
  const sessionToken = getCookie(c, "session_token");
  if (!sessionToken) {
    return c.json({ status: "Success", data: null });
  }

  const db = createDb(c.env.DB);
  const now = new Date();

  const session = await db
    .select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.sessionToken, sessionToken),
        gt(userSessions.expiresAt, now)
      )
    )
    .get();

  if (!session) {
    return c.json({ status: "Success", data: null });
  }

  const account = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, session.userId))
    .get();

  if (!account || !account.isActive) {
    return c.json({ status: "Success", data: null });
  }

  // Session Rotation Logic (if older than 30 mins)
  const sessionAge = now.getTime() - (session.createdAt?.getTime() || 0);
  const THIRTY_MINUTES = 30 * 60 * 1000;
  if (sessionAge > THIRTY_MINUTES) {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    const newToken = Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
    const newExpiry = new Date(now.getTime() + 3600000);
    
    await db.update(userSessions).set({ sessionToken: newToken, expiresAt: newExpiry }).where(eq(userSessions.id, session.id));
    setCookie(c, "session_token", newToken, {
      httpOnly: true, secure: true, sameSite: "None", path: "/", maxAge: 3600,
      domain: c.env.ENVIRONMENT === "production" ? "m.p3hm.my.id" : undefined,
    });
  }

  // Get full person data
  const person = await db
    .select()
    .from(people)
    .where(eq(people.id, account.personId))
    .get();

  let assignedClassId = null;
  let familyCardNumber = null;

  if (account.role === "Mustahiq") {
    const teacher = await db.select({ id: teacherProfiles.id }).from(teacherProfiles).where(eq(teacherProfiles.personId, account.personId)).get();
    if (teacher) {
      const assignedClass = await db.select({ id: academicClasses.id }).from(academicClasses).innerJoin(academicYears, eq(academicClasses.academicYearId, academicYears.id)).where(and(eq(academicClasses.mustahiqId, teacher.id), eq(academicYears.isActive, true))).get();
      if (assignedClass) {
        assignedClassId = assignedClass.id;
      }
    }
  }

  if (account.role === "Wali Santri") {
    const guardian = await db.select({ familyCardNumber: guardianProfiles.familyCardNumber }).from(guardianProfiles).where(eq(guardianProfiles.personId, account.personId)).get();
    if (guardian) {
      familyCardNumber = guardian.familyCardNumber;
    }
  }

  return c.json({
    status: "Success",
    data: {
      userId: account.id,
      accountId: account.id,
      personId: account.personId,
      username: account.username,
      role: account.role,
      fullName: person?.fullName || "",
      avatarUrl: person?.avatarUrl || null,
      assignedClassId,
      familyCardNumber,
    },
  });
});

// ============================================================
// PUT /api/auth/profile — Update user profile & password
// ============================================================
const profileUpdateSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  avatarUrl: z.string().nullable().optional(),
  oldPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password minimal 6 karakter").optional(),
});

auth.put("/profile", requireAuth, zValidator("json", profileUpdateSchema), async (c) => {
  const user = c.get("user");
  const { fullName, avatarUrl, oldPassword, newPassword } = c.req.valid("json");
  const db = createDb(c.env.DB);

  // 1. Dapatkan akun pengguna
  const account = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, user.userId))
    .get();

  if (!account) {
    return c.json({ status: "Error", message: "Akun tidak ditemukan." }, 404);
  }

  // 2. Jika mengganti password, verifikasi password lama
  if (oldPassword && newPassword) {
    const isValidPassword = await verifyPassword(oldPassword, account.passwordHash);
    if (!isValidPassword) {
      return c.json({ status: "Error", message: "Password lama tidak sesuai." }, 400);
    }
    const newPasswordHash = await hashPassword(newPassword);
    
    await db.update(userAccounts)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(userAccounts.id, user.userId));
  }

  // 3. Update nama lengkap dan foto profil (Avatar) di tabel people
  await db.update(people)
    .set({ 
      fullName, 
      avatarUrl: avatarUrl !== undefined ? avatarUrl : null,
      updatedAt: new Date() 
    })
    .where(eq(people.id, user.personId));

  return c.json({
    status: "Success",
    message: "Profil berhasil diperbarui."
  });
});

export default auth;
