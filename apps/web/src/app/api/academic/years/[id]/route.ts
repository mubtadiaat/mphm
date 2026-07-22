import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, isActive } = body;

    const result = await prisma.$transaction(async (tx) => {
      if (isActive) {
        // Deactivate all other academic years
        await tx.academicYear.updateMany({
          data: { isActive: false },
        });
      }

      return await tx.academicYear.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(isActive !== undefined ? { isActive } : {}),
        },
      });
    });

    return NextResponse.json({
      status: "Success",
      message: "Tahun ajaran berhasil diperbarui.",
      data: result,
    });
  } catch (err: any) {
    console.error("ACADEMIC_YEAR_ID_PUT_ERROR:", err.message);
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

    await prisma.academicYear.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "Tahun ajaran berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("ACADEMIC_YEAR_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
