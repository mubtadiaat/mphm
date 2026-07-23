import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingName = searchParams.get("buildingName");

    // Fetch directly from Neon PostgreSQL Cloud DB
    let dbRooms = await prisma.room.findMany({
      where: {
        deletedAt: null,
        ...(buildingName ? { buildingName } : {}),
      },
      include: {
        supervisor: {
          select: { fullName: true },
        },
      },
    });

    // Auto-seed database if empty
    if (dbRooms.length === 0 && !buildingName) {
      await prisma.room.createMany({
        data: [
          { name: "Asrama Aisyah 1", buildingName: "Gedung Aisyah", capacity: 20 },
          { name: "Asrama Aisyah 2", buildingName: "Gedung Aisyah", capacity: 20 },
          { name: "Asrama Fatimah 1", buildingName: "Gedung Fatimah", capacity: 25 },
          { name: "Asrama Khadijah 1", buildingName: "Gedung Khadijah", capacity: 25 },
        ],
      });

      dbRooms = await prisma.room.findMany({
        where: { deletedAt: null },
        include: {
          supervisor: {
            select: { fullName: true },
          },
        },
      });
    }

    const rooms = dbRooms.map((r) => ({
      id: r.id,
      name: r.name,
      buildingName: r.buildingName,
      capacity: r.capacity,
      studentCount: 0,
      supervisor: r.supervisor?.fullName || "Musyrifah Asrama",
    }));

    return NextResponse.json({
      status: "Success",
      data: rooms,
    });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const created = await prisma.room.create({
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
