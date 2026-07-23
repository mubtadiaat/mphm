import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction([
      prisma.person.updateMany({
        where: { id },
        data: { deletedAt: null },
      }),
      prisma.userAccount.updateMany({
        where: { id },
        data: { deletedAt: null },
      }),
      prisma.academicClass.updateMany({
        where: { id },
        data: { deletedAt: null },
      }),
    ]);

    return NextResponse.json({
      status: "Success",
      message: "Data berhasil dipulihkan.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
