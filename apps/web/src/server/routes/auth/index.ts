import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { eq, and, gt } from "drizzle-orm";
import { createDb, userAccounts, userSessions, people, teacherProfiles, guardianProfiles, academicClasses, academicYears } from "@mphm/db";
import type { AppEnv } from "../../types";
import { requireAuth } from "../../middlewares/authMiddleware";
import { deleteFromCloudinary } from "../../utils/cloudinary";
import { rotateSessionIfStale } from "../../utils/session";

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
// POST /api/auth/register-wali
// ============================================================
const registerWaliSchema = z.object({
  whatsapp: z.string().min(5, "Nomor WhatsApp tidak valid"),
  kk: z.string().min(10, "Nomor KK minimal 10 digit"),
});

auth.post(
  "/register-wali",
  zValidator("json", registerWaliSchema),
  async (c) => {
    const { whatsapp, kk } = c.req.valid("json");
    const db = createDb();

    // 1. Cari semua guardianProfiles yang cocok dengan Nomor KK beserta data HP-nya
    const guardians = await db
      .select({
        id: guardianProfiles.id,
        personId: guardianProfiles.personId,
        relation: guardianProfiles.relation,
        phoneNumber: people.phoneNumber,
      })
      .from(guardianProfiles)
      .innerJoin(people, eq(guardianProfiles.personId, people.id))
      .where(eq(guardianProfiles.familyCardNumber, kk))
      ;

    if (guardians.length === 0) {
      return c.json(
        { status: "Error", message: "Data Wali Santri tidak ditemukan. Pastikan Nomor KK sesuai dengan yang didaftarkan ke Sekretariat." },
        404
      );
    }

    // Cari guardian yang nomor HP-nya sama dengan whatsapp
    let guardian = guardians.find(g => g.phoneNumber === whatsapp);

    // Jika tidak ada yang cocok dengan nomor HP, cari guardian yang belum memiliki akun
    if (!guardian) {
      for (const g of guardians) {
        const existingAccount = await db
          .select()
          .from(userAccounts)
          .where(eq(userAccounts.personId, g.personId))
          .then((res: any) => res[0]);
        if (!existingAccount) {
          guardian = g;
          break;
        }
      }
    }

    if (!guardian) {
      return c.json(
        { status: "Error", message: "Semua Wali Santri dengan Nomor KK ini sudah terdaftar." },
        400
      );
    }

    // 2. Cek apakah userAccount sudah ada untuk person terpilih
    const existingAccount = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.personId, guardian.personId))
      .then((res: any) => res[0]);

    if (existingAccount) {
      return c.json(
        { status: "Error", message: `Akun Wali Santri (${guardian.relation}) untuk Nomor KK tersebut sudah terdaftar. Silakan langsung login.` },
        409
      );
    }

    // 3. Perbarui nomor telepon pada entitas person
    await db
      .update(people)
      .set({ phoneNumber: whatsapp, updatedAt: new Date() })
      .where(eq(people.id, guardian.personId));

    // 4. Buat akun baru dengan default password "mphm123"
    const defaultPasswordHash = await hashPassword("mphm123");
    
    await db.insert(userAccounts).values({
      personId: guardian.personId,
      username: whatsapp, // Username menggunakan nomor whatsapp
      passwordHash: defaultPasswordHash,
      role: "Wali Santri",
    });

    return c.json({
      status: "Success",
      message: "Pendaftaran berhasil. Silakan login menggunakan kredensial default.",
      data: {
        username: whatsapp,
      }
    });
  }
);

// ============================================================
// POST /api/auth/login
const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

auth.post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    const { username, password } = c.req.valid("json");
    const db = createDb();

    // 1. Cari user account
    const account = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.username, username))
      .then((res: any) => res[0]);

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
      .then((res: any) => res[0]);

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
    setCookie(c, "session_token", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 3600, // 1 jam
      domain: c.env.ENVIRONMENT === "production" ? "m.p3hm.my.id" : undefined,
    });

    const isDefaultPassword = password === "mphm123";

    try {
      await c.env.SESSION_KV.put(`session_must_change_pwd:${sessionToken}`, String(isDefaultPassword), {
        expirationTtl: 3600
      });
    } catch (e) {
      console.error("Failed to write password status to KV", e);
    }

    return c.json({
      status: "Success",
      message: "Login berhasil",
      data: {
        userId: account.id,
        personId: account.personId,
        fullName: person?.fullName || "",
        role: account.role,
        avatarUrl: person?.avatarUrl || (person as any)?.avatar_url || null,
        avatar_url: person?.avatarUrl || (person as any)?.avatar_url || null,
        mustChangePassword: isDefaultPassword,
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
    const db = createDb();

    // Hapus session dari D1
    await db
      .delete(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));

    // Clear KV cache
    try {
      await c.env.SESSION_KV.delete(`session_must_change_pwd:${sessionToken}`);
    } catch (e) {
      console.error("Failed to delete password status from KV", e);
    }
  }

  // Clear cookie
  deleteCookie(c, "session_token", {
    path: "/",
    domain: c.env.ENVIRONMENT === "production" ? "m.p3hm.my.id" : undefined,
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

  const db = createDb();
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
    .then((res: any) => res[0]);

  if (!session) {
    return c.json({ status: "Success", data: null });
  }

  const account = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, session.userId))
    .then((res: any) => res[0]);

  if (!account || !account.isActive) {
    return c.json({ status: "Success", data: null });
  }

  // Session Rotation Logic (if older than 30 mins)
  const rotationResult = await rotateSessionIfStale(db, session, c);
  const activeToken = rotationResult.newToken;

  // Get full person data
  const person = await db
    .select()
    .from(people)
    .where(eq(people.id, account.personId))
    .then((res: any) => res[0]);

  let assignedClassId = null;
  let familyCardNumber = null;

  if (account.role === "Mustahiq") {
    const teacher = await db.select({ id: teacherProfiles.id }).from(teacherProfiles).where(eq(teacherProfiles.personId, account.personId)).then((res: any) => res[0]);
    if (teacher) {
      const assignedClass = await db.select({ id: academicClasses.id }).from(academicClasses).innerJoin(academicYears, eq(academicClasses.academicYearId, academicYears.id)).where(and(eq(academicClasses.mustahiqId, teacher.id), eq(academicYears.isActive, true))).then((res: any) => res[0]);
      if (assignedClass) {
        assignedClassId = assignedClass.id;
      }
    }
  }

  if (account.role === "Wali Santri") {
    const guardian = await db.select({ familyCardNumber: guardianProfiles.familyCardNumber }).from(guardianProfiles).where(eq(guardianProfiles.personId, account.personId)).then((res: any) => res[0]);
    if (guardian) {
      familyCardNumber = guardian.familyCardNumber;
    }
  }

  let isDefaultPassword = false;
  try {
    const cached = await c.env.SESSION_KV.get(`session_must_change_pwd:${activeToken}`);
    if (cached !== null) {
      isDefaultPassword = cached === "true";
    } else {
      isDefaultPassword = await verifyPassword("mphm123", account.passwordHash);
      await c.env.SESSION_KV.put(`session_must_change_pwd:${activeToken}`, String(isDefaultPassword), {
        expirationTtl: 3600
      });
    }
  } catch (e) {
    isDefaultPassword = await verifyPassword("mphm123", account.passwordHash);
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
      avatarUrl: person?.avatarUrl || (person as any)?.avatar_url || null,
      avatar_url: person?.avatarUrl || (person as any)?.avatar_url || null,
      assignedClassId,
      familyCardNumber,
      mustChangePassword: isDefaultPassword,
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
  const db = createDb();

  // 1. Dapatkan akun pengguna
  const account = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, user.userId))
    .then((res: any) => res[0]);

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

    try {
      const currentToken = getCookie(c, "session_token");
      if (currentToken) {
        await c.env.SESSION_KV.put(`session_must_change_pwd:${currentToken}`, "false", {
          expirationTtl: 3600
        });
      }
    } catch (e) {
      console.error("Failed to update password status in KV", e);
    }
  }

  // 3. Update nama lengkap dan foto profil (Avatar) di tabel people
  const currentPerson = await db.select().from(people).where(eq(people.id, user.personId)).then((res: any) => res[0]);
  const currentAvatarUrl = currentPerson?.avatarUrl || (currentPerson as any)?.avatar_url;
  
  if (currentPerson && avatarUrl !== undefined && avatarUrl !== currentAvatarUrl) {
    if (currentAvatarUrl) {
      await deleteFromCloudinary(currentAvatarUrl, {
        CLOUDINARY_CLOUD_NAME: c.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: c.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: c.env.CLOUDINARY_API_SECRET,
      });
    }
  }

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
