import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { penalty, notes, evidenceUrl } = body;

    const updated = await prisma.studentViolation.update({
      where: { id },
      data: {
        ...(penalty !== undefined ? { penalty } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(evidenceUrl !== undefined ? { evidenceUrl } : {}),
      },
    });

    return NextResponse.json({
      status: "Success",
      message: "Data pelanggaran berhasil diperbarui.",
      data: updated,
    });
  } catch (err: any) {
    console.error("DISCIPLINARY_VIOLATION_ID_PUT_ERROR:", err.message);
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

    await prisma.studentViolation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "Data pelanggaran berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("DISCIPLINARY_VIOLATION_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
