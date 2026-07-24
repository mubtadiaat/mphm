import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [mundzirOrgCount, mundzirUserCount] = await Promise.all([
      prisma.organizationMembership.count({
        where: {
          OR: [
            { role: { contains: "Mundzir", mode: "insensitive" } },
            { role: { contains: "Mundziroh", mode: "insensitive" } },
          ],
          deletedAt: null,
        },
      }),
      prisma.userAccount.count({
        where: {
          role: { contains: "Mundzir", mode: "insensitive" },
          deletedAt: null,
        },
      }),
    ]);

    const [mufattisyOrgCount, mufattisyUserCount] = await Promise.all([
      prisma.organizationMembership.count({
        where: {
          role: { contains: "Mufattisy", mode: "insensitive" },
          deletedAt: null,
        },
      }),
      prisma.userAccount.count({
        where: {
          role: { contains: "Mufattisy", mode: "insensitive" },
          deletedAt: null,
        },
      }),
    ]);

    const [mustahiqTeacherCount, mustahiqUserCount] = await Promise.all([
      prisma.teacherProfile.count({
        where: { deletedAt: null },
      }),
      prisma.userAccount.count({
        where: {
          role: { contains: "Mustahiq", mode: "insensitive" },
          deletedAt: null,
        },
      }),
    ]);

    const classesCount = await prisma.academicClass.count({
      where: { deletedAt: null },
    });

    const santriCount = await prisma.studentProfile.count({
      where: { deletedAt: null },
    });

    const mundzirCount = mundzirOrgCount + mundzirUserCount;
    const mufattisyCount = mufattisyOrgCount + mufattisyUserCount;
    const mustahiqCount = mustahiqTeacherCount + mustahiqUserCount;

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
