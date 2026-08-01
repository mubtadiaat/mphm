import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/telemetry -> Fetch active device sessions for developer cockpit
export async function GET(req: NextRequest) {
  try {
    const sessions = await (prisma as any).appDeviceSession.findMany({
      orderBy: { lastActiveAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      status: "success",
      total: sessions.length,
      data: sessions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil data telemetri perangkat." },
      { status: 500 }
    );
  }
}

// POST /api/admin/telemetry -> Record device telemetry ping
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, deviceId, deviceModel, osVersion, appVersion, platform } = body;

    if (!deviceId || !appVersion || !platform) {
      return NextResponse.json(
        { status: "error", message: "Data telemetri perangkat tidak lengkap." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "LIVE-CLIENT-IP";

    const session = await (prisma as any).appDeviceSession.create({
      data: {
        userId: userId || null,
        deviceId,
        deviceModel: deviceModel || "Unknown Device",
        osVersion: osVersion || "Unknown OS",
        appVersion,
        platform: String(platform).toUpperCase(),
        ipAddress: ip,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Telemetri perangkat berhasil dicatat.",
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mencatat telemetri." },
      { status: 500 }
    );
  }
}
