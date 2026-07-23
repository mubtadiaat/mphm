import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_severities" },
    });
    const severities = setting
      ? JSON.parse(setting.value)
      : [
          { id: "sev-1", level: 1, name: "Ringan 1", points: 5 },
          { id: "sev-2", level: 2, name: "Sedang 1", points: 15 },
          { id: "sev-3", level: 3, name: "Berat 1", points: 50 },
        ];

    return NextResponse.json({ status: "Success", data: severities });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_severities" },
    });
    const severities = setting ? JSON.parse(setting.value) : [];

    const newSev = { id: `sev-${Date.now()}`, ...body };
    severities.push(newSev);

    await prisma.systemSetting.upsert({
      where: { key: "violation_severities" },
      update: { value: JSON.stringify(severities) },
      create: { key: "violation_severities", value: JSON.stringify(severities) },
    });

    return NextResponse.json({ status: "Success", data: newSev });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
