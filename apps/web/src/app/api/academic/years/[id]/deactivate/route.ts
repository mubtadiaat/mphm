import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.academicYear.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      status: "Success",
      message: "Tahun ajaran berhasil dinonaktifkan.",
      data: result,
    });
  } catch (err: any) {
    console.error("ACADEMIC_YEAR_DEACTIVATE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
