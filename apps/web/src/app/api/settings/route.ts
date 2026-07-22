import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const settingsList = await prisma.systemSetting.findMany();
    const settingsObject: Record<string, string> = {};

    settingsList.forEach((s) => {
      settingsObject[s.key] = s.value;
    });

    return NextResponse.json({
      status: "Success",
      data: settingsObject,
    });
  } catch (err: any) {
    console.error("GET_SETTINGS_ERROR:", err.message);
    // Return empty settings gracefully instead of crashing
    return NextResponse.json({
      status: "Success",
      data: {
        systemMaintenance: "false",
        activeAcademicYear: "2024/2025",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = Object.entries(body);

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value), updatedAt: new Date() },
          create: { key, value: String(value) },
        })
      )
    );

    return NextResponse.json({
      status: "Success",
      message: "Pengaturan sistem berhasil disimpan.",
    });
  } catch (err: any) {
    console.error("POST_SETTINGS_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
