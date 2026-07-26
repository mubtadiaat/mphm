import { NextResponse } from "next/server";

const DOWNLOAD_MAP: Record<string, { url: string; filename: string; contentType: string }> = {
  staff: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/Mubtadiaat-v1.4.09.apk",
    filename: "Mubtadiaat-v1.4.09.apk",
    contentType: "application/vnd.android.package-archive",
  },
  guardian: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/e-Mubtadiaat-v1.4.09.apk",
    filename: "e-Mubtadiaat-v1.4.09.apk",
    contentType: "application/vnd.android.package-archive",
  },
  admin: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/Admin.Mubtadiaat.Setup.1.4.9.exe",
    filename: "Admin.Mubtadiaat.Setup.1.4.9.exe",
    contentType: "application/x-msdownload",
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "staff";
  const item = DOWNLOAD_MAP[type.toLowerCase()];

  if (!item) {
    return NextResponse.json({ error: "File unduhan tidak ditemukan." }, { status: 404 });
  }

  try {
    // Fetch direct binary stream from GitHub S3 asset
    const res = await fetch(item.url, {
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.redirect(item.url, 307);
    }

    const headers = new Headers();
    headers.set("Content-Type", item.contentType);
    headers.set("Content-Disposition", `attachment; filename="${item.filename}"`);
    headers.set("Cache-Control", "public, max-age=3600");
    
    const contentLength = res.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.redirect(item.url, 307);
  }
}
