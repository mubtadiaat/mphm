import { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { eq, and, gt } from "drizzle-orm";
import { createDb, userSessions, userAccounts, teacherProfiles, guardianProfiles, academicClasses, academicYears, organizationMemberships } from "@mphm/db";
import type { AppEnv, SessionPayload } from "../types";
import { rotateSessionIfStale } from "../utils/session";

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

  const db = createDb();
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
    .then((res: any) => res[0]);

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
    .then((res: any) => res[0]);

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
      .then((res: any) => res[0]);

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
        .then((res: any) => res[0]);

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
      .then((res: any) => res[0]);

    if (guardian) {
      payload.familyCardNumber = guardian.familyCardNumber;
    }
  }

  if (account.role === "Mufattisy") {
    // Ambil supervised_level dari organization_memberships
    const membership = await db
      .select({ supervisedLevel: organizationMemberships.supervisedLevel })
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.personId, account.personId),
          eq(organizationMemberships.status, "ACTIVE")
        )
      )
      .then((res: any) => res[0]);

    if (membership?.supervisedLevel) {
      payload.supervisedLevel = membership.supervisedLevel;
    }
  }

  // 5. Session Rotation — Jika session lebih tua dari 30 menit, rotate token
  await rotateSessionIfStale(db, session, c);

  // 6. Set user di context
  c.set("user", payload);
  await next();
};
