import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    status: "Success",
    message: "Berhasil keluar dari akun.",
  });

  await clearSessionCookie(response);
  return response;
}
