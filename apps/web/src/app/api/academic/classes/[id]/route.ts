import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, fullName, institutionLevel, levelNumber, mustahiqId, curriculumId } = body;

    const updated = await prisma.academicClass.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(fullName ? { fullName } : {}),
        ...(institutionLevel ? { institutionLevel } : {}),
        ...(levelNumber !== undefined ? { levelNumber: Number(levelNumber) } : {}),
        ...(mustahiqId !== undefined ? { mustahiqId } : {}),
        ...(curriculumId !== undefined ? { curriculumId } : {}),
      },
    });

    return NextResponse.json({
      status: "Success",
      message: "Kelas akademik berhasil diperbarui.",
      data: updated,
    });
  } catch (err: any) {
    console.error("ACADEMIC_CLASS_ID_PUT_ERROR:", err.message);
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

    await prisma.academicClass.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "Kelas akademik berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("ACADEMIC_CLASS_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
