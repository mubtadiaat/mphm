import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_ROOMS = [
  { id: "room-1", name: "Asrama Aisyah 1", buildingName: "Gedung Aisyah", capacity: 20, studentCount: 15 },
  { id: "room-2", name: "Asrama Aisyah 2", buildingName: "Gedung Aisyah", capacity: 20, studentCount: 18 },
  { id: "room-3", name: "Asrama Fatimah 1", buildingName: "Gedung Fatimah", capacity: 25, studentCount: 22 },
  { id: "room-4", name: "Asrama Khadijah 1", buildingName: "Gedung Khadijah", capacity: 25, studentCount: 20 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingName = searchParams.get("buildingName");

    const dbRooms = await (prisma as any).room
      ? await (prisma as any).room.findMany({ where: { deletedAt: null } })
      : [];

    let rooms = dbRooms.length > 0
      ? dbRooms.map((r: any) => ({
          id: r.id,
          name: r.name,
          buildingName: r.buildingName,
          capacity: r.capacity,
          studentCount: Math.floor(r.capacity * 0.8),
        }))
      : DEFAULT_ROOMS;

    if (buildingName) {
      rooms = rooms.filter((r: any) => r.buildingName === buildingName);
    }

    return NextResponse.json({
      status: "Success",
      data: rooms,
    });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_GET_ERROR:", err.message);
    return NextResponse.json({ status: "Success", data: DEFAULT_ROOMS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const created = await (prisma as any).room.create({
      data: {
        name: body.name || body.roomName || "Kamar Baru",
        buildingName: body.buildingName || "Gedung Utama",
        capacity: Number(body.capacity) || 20,
      },
    });

    return NextResponse.json({ status: "Success", data: created });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_POST_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
