import { NextResponse } from "next/server";

const DOWNLOAD_URLS: Record<string, string> = {
  staff: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/Mubtadiaat-v1.4.09.apk",
  guardian: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/e-Mubtadiaat-v1.4.09.apk",
  admin: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/Admin.Mubtadiaat.Setup.1.4.9.exe",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "staff";
  const targetUrl = DOWNLOAD_URLS[type.toLowerCase()];

  if (!targetUrl) {
    return NextResponse.json({ error: "File unduhan tidak ditemukan." }, { status: 404 });
  }

  // 307 Redirect directly to binary asset which browser triggers as instant download without opening GitHub tab
  return NextResponse.redirect(targetUrl, 307);
}
