import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mundzirCount = await prisma.organizationMembership.count({
      where: {
        role: { contains: "Mundzir", mode: "insensitive" },
        deletedAt: null,
      },
    });

    const mufattisyCount = await prisma.organizationMembership.count({
      where: {
        role: { contains: "Mufattisy", mode: "insensitive" },
        deletedAt: null,
      },
    });

    const mustahiqCount = await prisma.teacherProfile.count({
      where: { deletedAt: null },
    });

    const classesCount = await prisma.academicClass.count({
      where: { deletedAt: null },
    });

    const santriCount = await prisma.studentProfile.count({
      where: { deletedAt: null },
    });

    return NextResponse.json({
      status: "Success",
      data: {
        hasMundzir: mundzirCount > 0,
        hasMufattisy: mufattisyCount > 0,
        hasMustahiq: mustahiqCount > 0,
        hasClasses: classesCount > 0,
        hasSantri: santriCount > 0,
      },
    });
  } catch (err: any) {
    console.error("ONBOARDING_STATUS_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
