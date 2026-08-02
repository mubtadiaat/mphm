import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, JWTPayload } from "./jwt";
import { InstitutionType, isInstitutionAllowed } from "./institutionGuard";

export interface AuthGuardResult {
  session: JWTPayload | null;
  errorResponse: NextResponse | null;
}

/**
 * Validasi sesi autentikasi dengan dukungan penuh isolasi antarinstansi.
 *
 * @param _req - NextRequest (reserved for future header-based auth)
 * @param allowedRoleKeywords - Daftar keyword role yang diizinkan (partial match)
 * @param allowedInstitutions - Daftar instansi yang diizinkan ("PONDOK" | "MADRASAH" | "ALL")
 *                              Jika tidak diisi, semua instansi diizinkan.
 */
export async function requireAuthSession(
  _req: NextRequest,
  allowedRoleKeywords?: string[],
  allowedInstitutions?: InstitutionType[]
): Promise<AuthGuardResult> {
  const session = await getSessionFromCookies();

  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { status: "Error", message: "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali." },
        { status: 401 }
      ),
    };
  }

  // Validasi role keyword
  if (allowedRoleKeywords && allowedRoleKeywords.length > 0) {
    const userRole = String(session.role || "").trim().toLowerCase();
    const isAllowed = allowedRoleKeywords.some((kw) => userRole.includes(kw.toLowerCase()));

    if (!isAllowed) {
      return {
        session,
        errorResponse: NextResponse.json(
          { status: "Error", message: "Anda tidak memiliki hak akses untuk tindakan ini." },
          { status: 403 }
        ),
      };
    }
  }

  // Validasi isolasi instansi (Pondok vs Madrasah)
  if (allowedInstitutions && allowedInstitutions.length > 0) {
    const sessionInstitution = (session.institution || "MADRASAH") as InstitutionType;

    // Akun "ALL" (admin/superadmin) selalu lolos
    const isInstitutionOk =
      sessionInstitution === "ALL" ||
      allowedInstitutions.includes("ALL") ||
      allowedInstitutions.some((inst) => isInstitutionAllowed(sessionInstitution, inst));

    if (!isInstitutionOk) {
      return {
        session,
        errorResponse: NextResponse.json(
          {
            status: "Error",
            message: "Akses ditolak: Data ini bukan milik instansi Anda. Setiap instansi hanya dapat mengakses data miliknya sendiri.",
          },
          { status: 403 }
        ),
      };
    }
  }

  return { session, errorResponse: null };
}

/**
 * Ekstrak institution dari session (dengan fallback aman).
 */
export function getSessionInstitution(session: JWTPayload | null): InstitutionType {
  if (!session) return "MADRASAH";
  return (session.institution || "MADRASAH") as InstitutionType;
}
