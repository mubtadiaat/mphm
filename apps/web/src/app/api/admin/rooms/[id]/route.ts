import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const roomsSetting = await prisma.systemSetting.findUnique({
      where: { key: "rooms_data" },
    });
    let rooms = roomsSetting ? JSON.parse(roomsSetting.value) : [];

    rooms = rooms.map((r: any) => (r.id === id ? { ...r, ...body } : r));

    await prisma.systemSetting.upsert({
      where: { key: "rooms_data" },
      update: { value: JSON.stringify(rooms) },
      create: { key: "rooms_data", value: JSON.stringify(rooms) },
    });

    return NextResponse.json({ status: "Success", message: "Kamar diperbarui" });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const roomsSetting = await prisma.systemSetting.findUnique({
      where: { key: "rooms_data" },
    });
    let rooms = roomsSetting ? JSON.parse(roomsSetting.value) : [];

    rooms = rooms.filter((r: any) => r.id !== id);

    await prisma.systemSetting.upsert({
      where: { key: "rooms_data" },
      update: { value: JSON.stringify(rooms) },
      create: { key: "rooms_data", value: JSON.stringify(rooms) },
    });

    return NextResponse.json({ status: "Success", message: "Kamar dihapus" });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
