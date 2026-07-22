import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const years = await prisma.academicYear.findMany({
      where: { deletedAt: null },
      orderBy: { name: "desc" },
    });

    return NextResponse.json({ status: "Success", data: years });
  } catch (err: any) {
    console.error("ACADEMIC_YEARS_GET_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { status: "Error", message: "Nama tahun ajaran wajib diisi." },
        { status: 400 }
      );
    }

    if (isActive) {
      // Deactivate all other years
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const year = await prisma.academicYear.create({
      data: {
        name,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ status: "Success", data: year });
  } catch (err: any) {
    console.error("ACADEMIC_YEARS_POST_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
