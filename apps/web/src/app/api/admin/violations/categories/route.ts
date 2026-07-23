import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_categories" },
    });
    const categories = setting
      ? JSON.parse(setting.value)
      : [
          { id: "cat-1", code: "RINGAN", name: "Pelanggaran Ringan" },
          { id: "cat-2", code: "SEDANG", name: "Pelanggaran Sedang" },
          { id: "cat-3", code: "BERAT", name: "Pelanggaran Berat" },
        ];

    return NextResponse.json({ status: "Success", data: categories });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "violation_categories" },
    });
    const categories = setting ? JSON.parse(setting.value) : [];

    const newCat = { id: `cat-${Date.now()}`, ...body };
    categories.push(newCat);

    await prisma.systemSetting.upsert({
      where: { key: "violation_categories" },
      update: { value: JSON.stringify(categories) },
      create: { key: "violation_categories", value: JSON.stringify(categories) },
    });

    return NextResponse.json({ status: "Success", data: newCat });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
