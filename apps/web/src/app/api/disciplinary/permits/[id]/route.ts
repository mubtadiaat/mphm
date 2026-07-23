import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedById, notes } = body;

    const existing = await prisma.studentPermit.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { status: "Not Found", message: "Data perizinan tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.studentPermit.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(approvedById && { approvedById }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({
      status: "Success",
      message: `Status perizinan berhasil diperbarui menjadi ${updated.status}.`,
      data: updated,
    });
  } catch (err: any) {
    console.error("PUT_PERMIT_ERROR:", err);
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal meng-update perizinan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.studentPermit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "Data perizinan berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("DELETE_PERMIT_ERROR:", err);
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal menghapus perizinan." },
      { status: 500 }
    );
  }
}
