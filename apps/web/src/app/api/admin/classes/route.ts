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

    const classes = await (prisma.academicClass as any).findMany({
      where: {
        ...(targetYearId ? { academicYearId: targetYearId } : {}),
        deletedAt: null,
      },
      include: {
        mustahiq: true,
        curriculum: true,
        enrollments: {
          where: { status: "ACTIVE", deletedAt: null },
        },
      },
      orderBy: { levelNumber: "asc" },
    });

    const formatted = classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      fullName: c.fullName,
      institutionLevel: c.institutionLevel,
      levelNumber: c.levelNumber,
      mustahiq: c.mustahiq?.fullName || "-",
      mufattisy: "-",
      capacity: 40,
      mustahiqId: c.mustahiqId,
      academicYearId: c.academicYearId,
      curriculumId: c.curriculumId,
      studentCount: c.enrollments?.length || 0,
    }));

    return NextResponse.json({ status: "Success", data: formatted });
  } catch (err: any) {
    console.error("ADMIN_CLASSES_GET_ERROR:", err.message);
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

    if (!academicYearId || !name || !fullName || !institutionLevel || levelNumber === undefined) {
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
    console.error("ADMIN_CLASSES_POST_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
