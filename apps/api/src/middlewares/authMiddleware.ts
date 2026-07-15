import { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { eq, and, gt } from "drizzle-orm";
import { createDb, userSessions, userAccounts, teacherProfiles, guardianProfiles, academicClasses, academicYears } from "@mphm/db";
import type { AppEnv, SessionPayload } from "../types";

// ============================================================
// AUTH MIDDLEWARE — Verifikasi Session Cookie dari D1
// ============================================================
// Menggantikan mock payload. Membaca session_token dari HttpOnly cookie,
// memverifikasi di tabel user_sessions, dan set context user.
export const requireAuth = async (c: Context<AppEnv>, next: Next) => {
  const sessionToken = getCookie(c, "session_token");

  if (!sessionToken) {
    return c.json(
      { status: "Error", message: "Unauthorized. Missing session token." },
      401
    );
  }

  const db = createDb(c.env.DB);
  const now = new Date();

  // 1. Lookup session di D1 — pastikan belum expired
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
    return c.json(
      { status: "Error", message: "Unauthorized. Session expired atau tidak valid." },
      401
    );
  }

  // 2. Ambil account data
  const account = await db
    .select()
    .from(userAccounts)
    .where(eq(userAccounts.id, session.userId))
    .get();

  if (!account || !account.isActive) {
    return c.json(
      { status: "Error", message: "Unauthorized. Akun tidak aktif." },
      401
    );
  }

  // 3. Build session payload
  const payload: SessionPayload = {
    userId: session.userId,
    accountId: account.id,
    personId: account.personId,
    role: account.role,
    username: account.username,
  };

  // 4. Enrich payload berdasarkan role
  if (account.role === "Mustahiq") {
    // Ambil assignedClassId dari teacher_profiles + academic_classes
    // HARUS filter berdasarkan tahun ajaran aktif
    const teacher = await db
      .select({ id: teacherProfiles.id })
      .from(teacherProfiles)
      .where(eq(teacherProfiles.personId, account.personId))
      .get();

    if (teacher) {
      const assignedClass = await db
        .select({ id: academicClasses.id })
        .from(academicClasses)
        .innerJoin(academicYears, eq(academicClasses.academicYearId, academicYears.id))
        .where(
          and(
            eq(academicClasses.mustahiqId, teacher.id),
            eq(academicYears.isActive, true)
          )
        )
        .get();

      if (assignedClass) {
        payload.assignedClassId = assignedClass.id;
      }
    }
  }

  if (account.role === "Wali Santri") {
    // Ambil familyCardNumber dari guardian_profiles
    const guardian = await db
      .select({ familyCardNumber: guardianProfiles.familyCardNumber })
      .from(guardianProfiles)
      .where(eq(guardianProfiles.personId, account.personId))
      .get();

    if (guardian) {
      payload.familyCardNumber = guardian.familyCardNumber;
    }
  }

  // 5. Session Rotation — Jika session lebih tua dari 30 menit, rotate token
  const sessionAge = now.getTime() - (session.createdAt?.getTime() || 0);
  const THIRTY_MINUTES = 30 * 60 * 1000;

  if (sessionAge > THIRTY_MINUTES) {
    // Generate token baru
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    const newToken = Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
    const newExpiry = new Date(now.getTime() + 3600000); // 1 jam dari sekarang

    // Update session di D1
    await db
      .update(userSessions)
      .set({
        sessionToken: newToken,
        expiresAt: newExpiry,
      })
      .where(eq(userSessions.id, session.id));

    // Set cookie baru
    setCookie(c, "session_token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 3600,
      domain: "m.p3hm.my.id",
    });
  }

  // 6. Set user di context
  c.set("user", payload);
  await next();
};
