import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAndFormatOddVersion, filterHighestVersionPerDate } from "@/lib/releaseUtils";

// GET /api/admin/versions -> Fetch active app versions filtered by highest version per date
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || undefined;

    const rawVersions = await (prisma as any).appVersion.findMany({
      where: {
        isActive: true,
        ...(platform ? { targetPlatform: platform.toUpperCase() } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    // Apply Daily Retention Filter: Only keep the highest build for each date
    const versions = filterHighestVersionPerDate(rawVersions.map((v: any) => ({
      ...v,
      publishedAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
    })));

    return NextResponse.json({
      status: "success",
      total: versions.length,
      data: versions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil versi aplikasi." },
      { status: 500 }
    );
  }
}

// POST /api/admin/versions -> Register new app release version
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { version, buildNumber, targetPlatform, releaseNotes, downloadUrl, isMandatoryUpdate } = body;

    if (!version || !buildNumber || !targetPlatform || !downloadUrl) {
      return NextResponse.json(
        { status: "error", message: "Harap isi semua bidang wajib versi." },
        { status: 400 }
      );
    }

    // 1. Format version to strictly end in an ODD number, max .39
    const formattedOddVersion = validateAndFormatOddVersion(version);
    const platformUpper = String(targetPlatform).toUpperCase();

    // 2. Daily Build Retention Policy: Purge previous builds on the SAME DATE for the SAME PLATFORM
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Delete / Deactivate older builds created today on the same date
    await (prisma as any).appVersion.deleteMany({
      where: {
        targetPlatform: platformUpper,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // 3. Insert the latest single build for today
    const newVersion = await (prisma as any).appVersion.create({
      data: {
        version: formattedOddVersion,
        buildNumber: Number(buildNumber),
        targetPlatform: platformUpper,
        releaseNotes: releaseNotes || `Rilis Aplikasi Versi ${formattedOddVersion}`,
        downloadUrl,
        isMandatoryUpdate: Boolean(isMandatoryUpdate),
        isActive: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: `Versi rilis ${formattedOddVersion} (${platformUpper}) berhasil dicatat sebagai build terbaru tanggal ini!`,
      data: newVersion,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mencatat versi aplikasi." },
      { status: 500 }
    );
  }
}
