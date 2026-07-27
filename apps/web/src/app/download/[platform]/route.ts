import { NextResponse } from "next/server";

const FALLBACK_CONFIGS: Record<string, { url: string; filename: string; contentType: string }> = {
  windows: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/Admin.Mubtadiaat.Setup.1.4.10.exe",
    filename: "Admin.Mubtadiaat.Setup.1.4.10.exe",
    contentType: "application/x-msdownload",
  },
  admin: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/Admin.Mubtadiaat.Setup.1.4.10.exe",
    filename: "Admin.Mubtadiaat.Setup.1.4.10.exe",
    contentType: "application/x-msdownload",
  },
  staff: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/Mubtadiaat-v1.4.10.apk",
    filename: "Mubtadiaat-v1.4.10.apk",
    contentType: "application/vnd.android.package-archive",
  },
  guardian: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/e-Mubtadiaat-v1.4.10.apk",
    filename: "e-Mubtadiaat-v1.4.10.apk",
    contentType: "application/vnd.android.package-archive",
  },
  wali: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/e-Mubtadiaat-v1.4.10.apk",
    filename: "e-Mubtadiaat-v1.4.10.apk",
    contentType: "application/vnd.android.package-archive",
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: rawPlatform } = await params;
  const platform = (rawPlatform || "").toLowerCase().trim();

  let targetUrl: string | undefined;
  let filename: string | undefined;
  let contentType = platform === "windows" || platform === "admin"
    ? "application/x-msdownload"
    : "application/vnd.android.package-archive";

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Mubtadiaat-Download-Center",
    };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch("https://api.github.com/repos/mubtadiaat/app_software/releases/latest", {
      headers,
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const release = await res.json();
      if (Array.isArray(release.assets)) {
        for (const asset of release.assets) {
          const nameLower = (asset.name || "").toLowerCase();
          if ((platform === "windows" || platform === "admin") && nameLower.endsWith(".exe")) {
            targetUrl = asset.browser_download_url;
            filename = asset.name;
            contentType = "application/x-msdownload";
            break;
          } else if ((platform === "guardian" || platform === "wali") && nameLower.startsWith("e-mubtadiaat") && nameLower.endsWith(".apk")) {
            targetUrl = asset.browser_download_url;
            filename = asset.name;
            contentType = "application/vnd.android.package-archive";
            break;
          } else if (platform === "staff" && nameLower.startsWith("mubtadiaat") && nameLower.endsWith(".apk")) {
            targetUrl = asset.browser_download_url;
            filename = asset.name;
            contentType = "application/vnd.android.package-archive";
            break;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Error resolving dynamic download URL for platform:", platform, err);
  }

  const fallback = FALLBACK_CONFIGS[platform] || FALLBACK_CONFIGS.staff;
  if (!targetUrl) {
    targetUrl = fallback.url;
    filename = fallback.filename;
    contentType = fallback.contentType;
  }
  if (!filename) {
    filename = fallback.filename;
  }

  // Stream binary file directly from GitHub release asset to browser
  try {
    const fileRes = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mubtadiaat-Download-Center",
      },
    });

    if (fileRes.ok && fileRes.body) {
      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", contentType);
      responseHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
      responseHeaders.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
      
      const contentLength = fileRes.headers.get("content-length");
      if (contentLength) {
        responseHeaders.set("Content-Length", contentLength);
      }

      return new Response(fileRes.body as any, {
        status: 200,
        headers: responseHeaders,
      });
    }
  } catch (streamError) {
    console.warn("Direct stream failed, falling back to 307 redirect:", streamError);
  }

  // Fallback redirect if binary stream fails
  return NextResponse.redirect(targetUrl, 307);
}
