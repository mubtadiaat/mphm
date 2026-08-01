import { NextResponse } from "next/server";
import { filterHighestVersionPerDate } from "@/lib/releaseUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface ReleaseAsset {
  name: string;
  size: number;
  formattedSize: string;
  downloadCount: number;
  downloadUrl: string;
}

export interface ProcessedRelease {
  version: string;
  tagName: string;
  publishedAt: string;
  htmlUrl: string;
  isLatest: boolean;
  isStable: boolean;
  totalDownloads: number;
  windows?: ReleaseAsset;
  staff?: ReleaseAsset;
  guardian?: ReleaseAsset;
  electronUpdate?: ReleaseAsset;
  blockmap?: ReleaseAsset;
}

export interface DownloadReleasesResponse {
  latest: ProcessedRelease | null;
  history: ProcessedRelease[];
  stats: {
    windowsDownloads: number;
    staffDownloads: number;
    guardianDownloads: number;
    totalDownloads: number;
  };
  source: "github" | "fallback";
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const FALLBACK_DATA: DownloadReleasesResponse = {
  latest: {
    version: "1.4.11",
    tagName: "v1.4.11",
    publishedAt: "2026-07-27T16:38:02Z",
    htmlUrl: "https://github.com/mubtadiaat/app_software/releases/tag/v2.0.1",
    isLatest: true,
    isStable: true,
    totalDownloads: 0,
    windows: {
      name: "mphm-windows-desktop-v2.0.0.zip",
      size: 45000000,
      formattedSize: "42.9 MB",
      downloadCount: 0,
      downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v2.0.1/mphm-windows-desktop-v2.0.0.zip",
    },
    staff: {
      name: "app-release.apk",
      size: 15000000,
      formattedSize: "14.3 MB",
      downloadCount: 0,
      downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v2.0.1/app-release.apk",
    },
    guardian: {
      name: "app-release.apk",
      size: 15000000,
      formattedSize: "14.3 MB",
      downloadCount: 0,
      downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v2.0.1/app-release.apk",
    },
  },
  history: [
    {
      version: "2.0.1",
      tagName: "v2.0.1",
      publishedAt: "2026-08-01T16:00:00Z",
      htmlUrl: "https://github.com/mubtadiaat/app_software/releases/tag/v2.0.1",
      isLatest: true,
      isStable: true,
      totalDownloads: 0,
      windows: {
        name: "mphm-windows-desktop-v2.0.0.zip",
        size: 45000000,
        formattedSize: "42.9 MB",
        downloadCount: 0,
        downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v2.0.1/mphm-windows-desktop-v2.0.0.zip",
      },
      staff: {
        name: "app-release.apk",
        size: 15000000,
        formattedSize: "14.3 MB",
        downloadCount: 0,
        downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v2.0.1/app-release.apk",
      },
      guardian: {
        name: "app-release.apk",
        size: 15000000,
        formattedSize: "14.3 MB",
        downloadCount: 0,
        downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v2.0.1/app-release.apk",
      },
    },
  ],
  stats: {
    windowsDownloads: 0,
    staffDownloads: 0,
    guardianDownloads: 0,
    totalDownloads: 0,
  },
  source: "fallback",
};

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Mubtadiaat-Download-Center",
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      "https://api.github.com/repos/mubtadiaat/app_software/releases?per_page=20",
      {
        headers,
        cache: "no-store", // Always fetch live software releases from mubtadiaat/app_software
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API status ${res.status}. Using fallback response.`);
      return NextResponse.json(FALLBACK_DATA, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=5, s-maxage=5, stale-while-revalidate=10",
        },
      });
    }

    const rawReleases = await res.json();
    if (!Array.isArray(rawReleases) || rawReleases.length === 0) {
      return NextResponse.json(FALLBACK_DATA, { status: 200 });
    }

    const validReleases = rawReleases.filter((r: any) => !r.draft);

    let globalWinDownloads = 0;
    let globalStaffDownloads = 0;
    let globalGuardianDownloads = 0;
    let globalTotalDownloads = 0;

    const processedReleases: ProcessedRelease[] = validReleases.map((release: any, idx: number) => {
      const version = (release.tag_name || "").replace(/^v/i, "");
      const tagName = release.tag_name || `v${version}`;
      const publishedAt = release.published_at || release.created_at;
      const htmlUrl = release.html_url || "";
      const isLatest = idx === 0;
      const isPrerelease = Boolean(release.prerelease);
      const isStable = !isPrerelease;

      let windows: ReleaseAsset | undefined;
      let staff: ReleaseAsset | undefined;
      let guardian: ReleaseAsset | undefined;
      let electronUpdate: ReleaseAsset | undefined;
      let blockmap: ReleaseAsset | undefined;
      let releaseDownloads = 0;

      if (Array.isArray(release.assets)) {
        for (const asset of release.assets) {
          const name: string = asset.name || "";
          const nameLower = name.toLowerCase();
          const size = asset.size || 0;
          const downloadCount = Number(asset.download_count || 0);
          const downloadUrl = asset.browser_download_url || "";

          releaseDownloads += downloadCount;
          globalTotalDownloads += downloadCount;

          const assetObj: ReleaseAsset = {
            name,
            size,
            formattedSize: formatBytes(size),
            downloadCount,
            downloadUrl,
          };

          if (nameLower.endsWith(".exe")) {
            windows = assetObj;
            globalWinDownloads += downloadCount;
          } else if (nameLower.startsWith("e-mubtadiaat") && nameLower.endsWith(".apk")) {
            guardian = assetObj;
            globalGuardianDownloads += downloadCount;
          } else if (nameLower.startsWith("mubtadiaat") && nameLower.endsWith(".apk")) {
            staff = assetObj;
            globalStaffDownloads += downloadCount;
          } else if (nameLower === "latest.yml") {
            electronUpdate = assetObj;
          } else if (nameLower.endsWith(".blockmap")) {
            blockmap = assetObj;
          }
        }
      }

      return {
        version,
        tagName,
        publishedAt,
        htmlUrl,
        isLatest,
        isStable,
        totalDownloads: releaseDownloads,
        windows,
        staff,
        guardian,
        electronUpdate,
        blockmap,
      };
    });

    const latest = processedReleases.length > 0 ? processedReleases[0] : null;
    const rawHistory = processedReleases.length > 1 ? processedReleases.slice(1) : [];
    const history = filterHighestVersionPerDate(rawHistory);

    const responsePayload: DownloadReleasesResponse = {
      latest,
      history,
      stats: {
        windowsDownloads: globalWinDownloads,
        staffDownloads: globalStaffDownloads,
        guardianDownloads: globalGuardianDownloads,
        totalDownloads: globalTotalDownloads,
      },
      source: "github",
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=5, s-maxage=5, stale-while-revalidate=10",
      },
    });
  } catch (error) {
    console.error("Error building releases DTO:", error);
    return NextResponse.json(FALLBACK_DATA, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=5, s-maxage=5, stale-while-revalidate=10",
      },
    });
  }
}
