import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_CONFIGS: Record<string, { url: string; filename: string; contentType: string }> = {
  windows: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.11/Admin.Mubtadiaat.Setup.1.4.11.exe",
    filename: "Admin.Mubtadiaat.Setup.1.4.11.exe",
    contentType: "application/x-msdownload",
  },
  admin: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.11/Admin.Mubtadiaat.Setup.1.4.11.exe",
    filename: "Admin.Mubtadiaat.Setup.1.4.11.exe",
    contentType: "application/x-msdownload",
  },
  staff: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.11/Mubtadiaat-v1.4.11.apk",
    filename: "Mubtadiaat-v1.4.11.apk",
    contentType: "application/vnd.android.package-archive",
  },
  guardian: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.11/e-Mubtadiaat-v1.4.11.apk",
    filename: "e-Mubtadiaat-v1.4.11.apk",
    contentType: "application/vnd.android.package-archive",
  },
  wali: {
    url: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.11/e-Mubtadiaat-v1.4.11.apk",
    filename: "e-Mubtadiaat-v1.4.11.apk",
    contentType: "application/vnd.android.package-archive",
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: rawPlatform } = await params;
  const platform = (rawPlatform || "").toLowerCase().trim();

  const { searchParams } = new URL(request.url);
  const versionParam = searchParams.get("version");

  let targetUrl: string | undefined;
  let filename: string | undefined;
  let assetId: number | undefined;
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

    const ghApiUrl = versionParam
      ? `https://api.github.com/repos/mubtadiaat/app_software/releases/tags/v${versionParam.replace(/^v/i, "")}`
      : "https://api.github.com/repos/mubtadiaat/app_software/releases/latest";

    const res = await fetch(ghApiUrl, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const release = await res.json();
      if (Array.isArray(release.assets)) {
        for (const asset of release.assets) {
          const nameLower = (asset.name || "").toLowerCase();
          if ((platform === "windows" || platform === "admin") && nameLower.endsWith(".exe")) {
            targetUrl = asset.browser_download_url;
            filename = asset.name;
            assetId = asset.id;
            contentType = "application/x-msdownload";
            break;
          } else if ((platform === "guardian" || platform === "wali") && nameLower.startsWith("e-mubtadiaat") && nameLower.endsWith(".apk")) {
            targetUrl = asset.browser_download_url;
            filename = asset.name;
            assetId = asset.id;
            contentType = "application/vnd.android.package-archive";
            break;
          } else if (platform === "staff" && nameLower.startsWith("mubtadiaat") && nameLower.endsWith(".apk")) {
            targetUrl = asset.browser_download_url;
            filename = asset.name;
            assetId = asset.id;
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

  // 1. First try streaming binary directly via GitHub API asset endpoint if token is present
  if (assetId && process.env.GITHUB_TOKEN) {
    try {
      const assetRes = await fetch(`https://api.github.com/repos/mubtadiaat/app_software/releases/assets/${assetId}`, {
        headers: {
          Accept: "application/octet-stream",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "User-Agent": "Mubtadiaat-Download-Center",
        },
      });

      if (assetRes.ok && assetRes.body) {
        const responseHeaders = new Headers();
        responseHeaders.set("Content-Type", contentType);
        responseHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
        responseHeaders.set("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=120");

        const contentLength = assetRes.headers.get("content-length");
        if (contentLength) {
          responseHeaders.set("Content-Length", contentLength);
        }

        return new Response(assetRes.body as any, {
          status: 200,
          headers: responseHeaders,
        });
      }
    } catch (apiStreamErr) {
      console.warn("GitHub API asset stream failed:", apiStreamErr);
    }
  }

  // 2. Stream binary file directly from browser_download_url to browser
  try {
    const fileRes = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mubtadiaat-Download-Center",
      },
    });

    const respContentType = fileRes.headers.get("content-type") || "";

    if (fileRes.ok && fileRes.body && !respContentType.includes("text/html")) {
      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", contentType);
      responseHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
      responseHeaders.set("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=120");
      
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
    console.warn("Direct stream failed:", streamError);
  }

  return NextResponse.redirect(targetUrl, 307);
}
