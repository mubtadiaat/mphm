import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_types" },
    });
    const types = setting
      ? JSON.parse(setting.value)
      : [
          { id: "vtype-1", code: "V-01", name: "Terlambat Jamaah Subuh", categoryId: "cat-1", points: 5 },
          { id: "vtype-2", code: "V-02", name: "Tidak Memakai Seragam", categoryId: "cat-1", points: 5 },
          { id: "vtype-3", code: "V-03", name: "Kabur dari Pesantren", categoryId: "cat-3", points: 100 },
        ];

    return NextResponse.json({ status: "Success", data: types });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_types" },
    });
    const types = setting ? JSON.parse(setting.value) : [];

    const newType = { id: `vtype-${Date.now()}`, ...body };
    types.push(newType);

    await prisma.systemSetting.upsert({
      where: { key: "violation_types" },
      update: { value: JSON.stringify(types) },
      create: { key: "violation_types", value: JSON.stringify(types) },
    });

    return NextResponse.json({ status: "Success", data: newType });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
