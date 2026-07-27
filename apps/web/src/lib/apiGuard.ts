import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, JWTPayload } from "./jwt";

export interface AuthGuardResult {
  session: JWTPayload | null;
  errorResponse: NextResponse | null;
}

export async function requireAuthSession(
  _req: NextRequest,
  allowedRoleKeywords?: string[]
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

  return { session, errorResponse: null };
}
