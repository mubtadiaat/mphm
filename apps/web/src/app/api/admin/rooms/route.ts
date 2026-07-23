import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingName = searchParams.get("buildingName");

    // Mock/return empty rooms or room records if system settings store them
    const roomsSetting = await prisma.systemSetting.findUnique({
      where: { key: "rooms_data" },
    });

    const rooms = roomsSetting ? JSON.parse(roomsSetting.value) : [];

    return NextResponse.json({
      status: "Success",
      data: buildingName
        ? rooms.filter((r: any) => r.buildingName === buildingName)
        : rooms,
    });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const roomsSetting = await prisma.systemSetting.findUnique({
      where: { key: "rooms_data" },
    });
    const rooms = roomsSetting ? JSON.parse(roomsSetting.value) : [];

    const newRoom = {
      id: `room-${Date.now()}`,
      roomName: body.roomName || "Kamar Baru",
      buildingName: body.buildingName || "Gedung Utama",
      capacity: body.capacity || 10,
      studentCount: 0,
    };

    rooms.push(newRoom);

    await prisma.systemSetting.upsert({
      where: { key: "rooms_data" },
      update: { value: JSON.stringify(rooms) },
      create: { key: "rooms_data", value: JSON.stringify(rooms) },
    });

    return NextResponse.json({ status: "Success", data: newRoom });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_POST_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
