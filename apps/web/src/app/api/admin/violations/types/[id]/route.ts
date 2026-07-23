import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_types" },
    });
    let types = setting ? JSON.parse(setting.value) : [];

    types = types.map((t: any) => (t.id === id ? { ...t, ...body } : t));

    await prisma.systemSetting.upsert({
      where: { key: "violation_types" },
      update: { value: JSON.stringify(types) },
      create: { key: "violation_types", value: JSON.stringify(types) },
    });

    return NextResponse.json({ status: "Success", message: "Tipe pelanggaran diperbarui" });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_types" },
    });
    let types = setting ? JSON.parse(setting.value) : [];

    types = types.filter((t: any) => t.id !== id);

    await prisma.systemSetting.upsert({
      where: { key: "violation_types" },
      update: { value: JSON.stringify(types) },
      create: { key: "violation_types", value: JSON.stringify(types) },
    });

    return NextResponse.json({ status: "Success", message: "Tipe pelanggaran dihapus" });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
