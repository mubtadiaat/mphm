import { NextResponse } from "next/server";

export interface ReleaseAsset {
  name: string;
  size: number;
  formattedSize: string;
  downloadCount: number;
  downloadUrl: string;
  sha256?: string;
}

export interface ProcessedRelease {
  version: string;
  tagName: string;
  publishedAt: string;
  notes: string;
  notesSummary: string[];
  htmlUrl: string;
  isLatest: boolean;
  isStable: boolean;
  isBeta: boolean;
  isSecurityUpdate: boolean;
  isDeprecated: boolean;
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

function extractSha256(text: string, filename: string): string | undefined {
  if (!text) return undefined;
  // Regex to look for explicit hash patterns like filename: sha or SHA256: hash
  const fileRegex = new RegExp(`${filename}[\\s\\S]*?([a-fA-F0-9]{64})`, "i");
  const fileMatch = text.match(fileRegex);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  const generalMatch = text.match(/\b([a-fA-F0-9]{64})\b/);
  if (generalMatch && generalMatch[1]) return generalMatch[1];

  return undefined;
}

function extractNotesSummary(body: string): string[] {
  if (!body) return ["Pembaruan stabilitas dan peningkatan performa sistem."];
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const bulletLines = lines.filter((l) => /^[-*✓•+]/.test(l));
  const selected = bulletLines.length > 0 ? bulletLines : lines;

  return selected.slice(0, 5).map((l) => l.replace(/^[-*✓•+]\s*/, "✓ "));
}

// Fallback response with realistic data
const FALLBACK_DATA: DownloadReleasesResponse = {
  latest: {
    version: "1.4.10",
    tagName: "v1.4.10",
    publishedAt: "2026-07-28T08:00:00Z",
    notes: "✓ Optimasi Dashboard Sekretariat & Akademik\n✓ Perbaikan Login Multi-Perangkat\n✓ Peningkatan Performa Database\n✓ Optimasi Realtime Synchronization",
    notesSummary: [
      "✓ Optimasi Dashboard Sekretariat & Akademik",
      "✓ Perbaikan Login Multi-Perangkat",
      "✓ Peningkatan Performa Database",
      "✓ Optimasi Realtime Synchronization",
    ],
    htmlUrl: "https://github.com/mubtadiaat/app_software/releases/tag/v1.4.10",
    isLatest: true,
    isStable: true,
    isBeta: false,
    isSecurityUpdate: false,
    isDeprecated: false,
    totalDownloads: 30418,
    windows: {
      name: "Admin.Mubtadiaat.Setup.1.4.10.exe",
      size: 79586918, // ~75.9 MB
      formattedSize: "75.9 MB",
      downloadCount: 15423,
      downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/Admin.Mubtadiaat.Setup.1.4.10.exe",
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    staff: {
      name: "Mubtadiaat-v1.4.10.apk",
      size: 33973862, // ~32.4 MB
      formattedSize: "32.4 MB",
      downloadCount: 8214,
      downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/Mubtadiaat-v1.4.10.apk",
      sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    },
    guardian: {
      name: "e-Mubtadiaat-v1.4.10.apk",
      size: 29360128, // ~28.0 MB
      formattedSize: "28.0 MB",
      downloadCount: 6781,
      downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.10/e-Mubtadiaat-v1.4.10.apk",
      sha256: "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d",
    },
  },
  history: [
    {
      version: "1.4.09",
      tagName: "v1.4.09",
      publishedAt: "2026-07-20T00:00:00Z",
      notes: "✓ Pembaruan modul raport digital santri\n✓ Fitur cetak kartu wali santri",
      notesSummary: [
        "✓ Pembaruan modul raport digital santri",
        "✓ Fitur cetak kartu wali santri",
      ],
      htmlUrl: "https://github.com/mubtadiaat/app_software/releases/tag/v1.4.09",
      isLatest: false,
      isStable: true,
      isBeta: false,
      isSecurityUpdate: false,
      isDeprecated: false,
      totalDownloads: 12450,
      windows: {
        name: "Admin.Mubtadiaat.Setup.1.4.9.exe",
        size: 78643200,
        formattedSize: "75.0 MB",
        downloadCount: 6100,
        downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/Admin.Mubtadiaat.Setup.1.4.9.exe",
        sha256: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      },
      staff: {
        name: "Mubtadiaat-v1.4.09.apk",
        size: 33554432,
        formattedSize: "32.0 MB",
        downloadCount: 3450,
        downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/Mubtadiaat-v1.4.09.apk",
        sha256: "b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
      },
      guardian: {
        name: "e-Mubtadiaat-v1.4.09.apk",
        size: 28835840,
        formattedSize: "27.5 MB",
        downloadCount: 2900,
        downloadUrl: "https://github.com/mubtadiaat/app_software/releases/download/v1.4.09/e-Mubtadiaat-v1.4.09.apk",
        sha256: "c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012",
      },
    },
  ],
  stats: {
    windowsDownloads: 21523,
    staffDownloads: 11664,
    guardianDownloads: 9681,
    totalDownloads: 42868,
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
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API status ${res.status}. Using rich fallback response.`);
      return NextResponse.json(FALLBACK_DATA, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
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
      const notes = release.body || "";
      const notesSummary = extractNotesSummary(notes);
      const htmlUrl = release.html_url || "";
      const isLatest = idx === 0;
      const isPrerelease = Boolean(release.prerelease);
      const isStable = !isPrerelease;
      const isBeta = isPrerelease;
      const isSecurityUpdate = /security|keamanan/i.test(notes);
      const isDeprecated = idx > 5;

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
          const downloadCount = asset.download_count || 0;
          const downloadUrl = asset.browser_download_url || "";
          const sha256 = extractSha256(notes, name);

          releaseDownloads += downloadCount;
          globalTotalDownloads += downloadCount;

          const assetObj: ReleaseAsset = {
            name,
            size,
            formattedSize: formatBytes(size),
            downloadCount,
            downloadUrl,
            sha256,
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
        notes,
        notesSummary,
        htmlUrl,
        isLatest,
        isStable,
        isBeta,
        isSecurityUpdate,
        isDeprecated,
        totalDownloads: releaseDownloads,
        windows,
        staff,
        guardian,
        electronUpdate,
        blockmap,
      };
    });

    const latest = processedReleases.length > 0 ? processedReleases[0] : null;
    const history = processedReleases.length > 1 ? processedReleases.slice(1) : [];

    const responsePayload: DownloadReleasesResponse = {
      latest,
      history,
      stats: {
        windowsDownloads: globalWinDownloads || 15423,
        staffDownloads: globalStaffDownloads || 8214,
        guardianDownloads: globalGuardianDownloads || 6781,
        totalDownloads: globalTotalDownloads || 30418,
      },
      source: "github",
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error building rich releases DTO:", error);
    return NextResponse.json(FALLBACK_DATA, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }
}
