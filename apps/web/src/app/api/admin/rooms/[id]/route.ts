import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { name, roomName, buildingName, capacity, supervisorId } = body;

    const prismaRoom = (prisma as any).room;
    if (!prismaRoom) {
      return NextResponse.json({ status: "Error", message: "Model room belum dikonfigurasi" }, { status: 500 });
    }

    const updated = await prismaRoom.update({
      where: { id },
      data: {
        ...(name || roomName ? { name: name || roomName } : {}),
        ...(buildingName ? { buildingName } : {}),
        ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
        ...(supervisorId !== undefined ? { supervisorId: supervisorId || null } : {}),
      },
      include: {
        supervisor: {
          select: { fullName: true },
        },
      },
    });

    return NextResponse.json({
      status: "Success",
      message: "Data kamar berhasil diperbarui di database.",
      data: updated,
    });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_PUT_ERROR:", err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Gagal memperbarui kamar" },
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

    const prismaRoom = (prisma as any).room;
    if (!prismaRoom) {
      return NextResponse.json({ status: "Error", message: "Model room belum dikonfigurasi" }, { status: 500 });
    }

    // Soft delete in database
    await prismaRoom.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "Kamar berhasil dihapus dari database.",
    });
  } catch (err: any) {
    console.error("ADMIN_ROOMS_DELETE_ERROR:", err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Gagal menghapus kamar" },
      { status: 500 }
    );
  }
}
