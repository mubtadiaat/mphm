import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // Deactivate all other academic years
      await tx.academicYear.updateMany({
        data: { isActive: false },
      });

      return await tx.academicYear.update({
        where: { id },
        data: { isActive: true },
      });
    });

    return NextResponse.json({
      status: "Success",
      message: "Tahun ajaran berhasil diaktifkan.",
      data: result,
    });
  } catch (err: any) {
    console.error("ACADEMIC_YEAR_ACTIVATE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
