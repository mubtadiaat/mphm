import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Permanent hard delete
    await prisma.$transaction([
      prisma.userAccount.deleteMany({ where: { id } }),
      prisma.person.deleteMany({ where: { id } }),
      prisma.academicClass.deleteMany({ where: { id } }),
    ]);

    return NextResponse.json({
      status: "Success",
      message: "Data berhasil dihapus permanen.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
