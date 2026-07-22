import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, name, subjectType } = body;

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(code ? { code } : {}),
        ...(name ? { name } : {}),
        ...(subjectType ? { subjectType } : {}),
      },
    });

    return NextResponse.json({
      status: "Success",
      message: "Mata pelajaran berhasil diperbarui.",
      data: updated,
    });
  } catch (err: any) {
    console.error("SUBJECT_ID_PUT_ERROR:", err.message);
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

    await prisma.subject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "Mata pelajaran berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("SUBJECT_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
