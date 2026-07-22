import { Context, Next } from "hono";
import type { AppEnv } from "../types";
import { eq } from "drizzle-orm";
import { createDb, academicClasses } from "@mphm/db";

// ============================================================
import { ROLES, RoleType } from "@mphm/utils";

export const VALID_ROLES = ROLES;
export type ValidRole = RoleType;

// ============================================================
// RBAC MIDDLEWARE — Pembatasan berdasarkan peran
// ============================================================
export const requireRole = (allowedRoles: ValidRole[]) => {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        { status: "Error", message: "Unauthorized. User session not found." },
        401
      );
    }

    if (!allowedRoles.includes(user.role as ValidRole)) {
      return c.json(
        { status: "Error", message: "Forbidden. Insufficient role permissions." },
        403
      );
    }

    await next();
  };
};

// ============================================================
// DATA SCOPE AUTHORIZATION INTERCEPTOR
// ============================================================
// System Rule #SEC-01: Semua user selain Sekretariat dan Mundzir
// wajib hanya melihat data di lingkup kerjanya masing-masing.
export const requireDataScope = (targetType: "CLASS" | "GUARDIAN") => {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get("user");

    // Global admins bypass scope
    if (user.role === "Sekretariat" || user.role === "Mundzir") {
      return await next();
    }

    // ---- CLASS SCOPE LOCK (Mufattisy) ----
    if (targetType === "CLASS" && user.role === "Mufattisy") {
      const requestedClassId = c.req.param("classId") || c.req.query("classId");
      if (!requestedClassId) {
        return await next();
      }

      if (!user.supervisedLevel) {
        return c.json(
          {
            status: "Error",
            message: "Data Scope Forbidden: Tidak ada jenjang pendidikan yang ditugaskan untuk diawasi.",
          },
          403
        );
      }

      const db = createDb();
      const targetClass = await db
        .select({ institutionLevel: academicClasses.institutionLevel })
        .from(academicClasses)
        .where(eq(academicClasses.id, requestedClassId))
        .then((res: any) => res[0]);

      if (!targetClass || targetClass.institutionLevel !== user.supervisedLevel) {
        return c.json(
          {
            status: "Error",
            message: `Data Scope Forbidden: Anda hanya diizinkan mengakses data jenjang ${user.supervisedLevel}.`,
          },
          403
        );
      }
    }

    // ---- CLASS SCOPE LOCK (Mustahiq) ----
    if (targetType === "CLASS" && user.role === "Mustahiq") {
      const requestedClassId =
        c.req.param("classId") || c.req.query("classId");

      if (!user.assignedClassId) {
        return c.json(
          {
            status: "Error",
            message: "Data Scope Forbidden: Tidak ada kelas yang ditugaskan.",
          },
          403
        );
      }

      if (requestedClassId && requestedClassId !== user.assignedClassId) {
        return c.json(
          {
            status: "Error",
            message: "Data Scope Forbidden: Bukan kelas Anda.",
          },
          403
        );
      }
    }

    // ---- GUARDIAN SCOPE LOCK (Wali Santri) ----
    if (targetType === "GUARDIAN" && user.role === "Wali Santri") {
      if (!user.familyCardNumber) {
        return c.json(
          {
            status: "Error",
            message: "Data Scope Forbidden: Nomor KK tidak ditemukan.",
          },
          403
        );
      }
      // Validasi detail KK Mapping dilakukan di handler level
      // karena memerlukan query DB untuk cross-reference studentId → guardianProfile → familyCardNumber
    }

    await next();
  };
};
