import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get("academicYearId");

    let targetYearId: string | null = academicYearId;
    if (!targetYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true, deletedAt: null },
      });
      targetYearId = activeYear?.id || null;
    }

    if (!targetYearId) {
      return NextResponse.json({ status: "Success", data: [] });
    }

    const classes = await prisma.academicClass.findMany({
      where: { academicYearId: targetYearId, deletedAt: null },
      orderBy: { levelNumber: "asc" },
    });

    return NextResponse.json({ status: "Success", data: classes });
  } catch (err: any) {
    console.error("CLASSES_GET_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { academicYearId, name, fullName, institutionLevel, levelNumber, mustahiqId } = body;

    if (!academicYearId || !name || !fullName || !institutionLevel || !levelNumber) {
      return NextResponse.json(
        { status: "Error", message: "Parameter kelas tidak lengkap." },
        { status: 400 }
      );
    }

    const newClass = await prisma.academicClass.create({
      data: {
        academicYearId,
        name,
        fullName,
        institutionLevel,
        levelNumber: Number(levelNumber),
        mustahiqId: mustahiqId || null,
      },
    });

    return NextResponse.json({ status: "Success", data: newClass });
  } catch (err: any) {
    console.error("CLASSES_POST_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
