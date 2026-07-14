import { Context, Next } from "hono";
import type { AppEnv } from "../types";

// ============================================================
// 6 PERAN RESMI SISTEM (System Rule #02)
// ============================================================
export const VALID_ROLES = [
  "Sekretariat",
  "Mustahiq",
  "Mufattisy",
  "Mundzir",
  "Petugas Keamanan",
  "Wali Santri",
] as const;

export type ValidRole = typeof VALID_ROLES[number];

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

    // Mufattisy juga punya akses luas (tingkatan, bukan individual class)
    if (user.role === "Mufattisy") {
      return await next();
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
