import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { determineBuildingName } from "@/lib/determineBuilding";
import { requireAuthSession } from "@/lib/apiGuard";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAuthSession(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const buildingName = searchParams.get("buildingName") || searchParams.get("building");
    const query = searchParams.get("q");

    const dbRooms = await prisma.room.findMany({
      where: {
        deletedAt: null,
        ...(buildingName ? { buildingName: { contains: buildingName, mode: "insensitive" } } : {}),
        ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
      },
      include: {
        supervisor: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { students: { where: { deletedAt: null } } },
        },
      },
      orderBy: { name: "asc" },
    });

    const rooms = dbRooms.map((r) => ({
      id: r.id,
      name: r.name,
      buildingName: determineBuildingName(r.name, r.buildingName),
      capacity: r.capacity,
      supervisorId: r.supervisorId,
      supervisorName: r.supervisor?.fullName || null,
      supervisor: r.supervisor?.fullName || "-",
      studentCount: r._count?.students || 0,
      filledCapacity: r._count?.students || 0,
      isActive: true,
    }));

    return NextResponse.json({
      status: "Success",
      data: rooms,
      total: rooms.length,
    });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_GET_ERROR:", err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Internal server error", data: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = await requireAuthSession(req, ["sek", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { name, roomName, buildingName, capacity, supervisorId } = body;

    const targetName = name || roomName;
    if (!targetName) {
      return NextResponse.json(
        { status: "Error", message: "Nama kamar wajib diisi." },
        { status: 400 }
      );
    }

    const finalBuilding = determineBuildingName(targetName, buildingName);

    const created = await prisma.room.create({
      data: {
        name: targetName,
        buildingName: finalBuilding,
        capacity: Number(capacity) || 20,
        supervisorId: supervisorId || null,
      },
      include: {
        supervisor: {
          select: { fullName: true },
        },
      },
    });

    return NextResponse.json({ status: "Success", data: created });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_POST_ERROR:", err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Gagal membuat kamar" },
      { status: 500 }
    );
  }
}
