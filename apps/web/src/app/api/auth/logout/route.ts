import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/jwt";
import { createAuditLog } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  
  const response = NextResponse.json({
    status: "Success",
    message: "Berhasil keluar dari akun.",
  });

  await clearSessionCookie(response);

  if (session) {
    await createAuditLog({
      userId: session.username,
      action: "LOGOUT",
      entity: "AUTH",
      entityId: session.userId,
    });
  }

  return response;
}
