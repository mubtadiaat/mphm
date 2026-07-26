import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/jwt";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    let supervisedLevel: string | null = session?.supervisedLevel || null;

    if (!supervisedLevel && session?.personId) {
      const om = await prisma.organizationMembership.findFirst({
        where: { personId: session.personId, deletedAt: null },
      });
      supervisedLevel = om?.supervisedLevel || null;
    }

    const classWhere = {
      deletedAt: null,
      ...(supervisedLevel ? { institutionLevel: { contains: supervisedLevel, mode: "insensitive" as const } } : {}),
    };

    const studentWhere = {
      status: "ACTIVE",
      deletedAt: null,
      ...(supervisedLevel
        ? {
            enrollments: {
              some: {
                deletedAt: null,
                academicClass: { institutionLevel: { contains: supervisedLevel, mode: "insensitive" as const } },
              },
            },
          }
        : {}),
    };

    const [
      totalSantri,
      totalTeachers,
      totalClasses,
      totalCurriculums,
      totalSubjects,
      totalViolations,
      scoreAgg,
      classes,
    ] = await Promise.all([
      prisma.studentProfile.count({ where: studentWhere as any }),
      prisma.teacherProfile.count({ where: { status: "ACTIVE", deletedAt: null } }),
      prisma.academicClass.count({ where: classWhere as any }),
      prisma.curriculum.count({ where: { deletedAt: null } }),
      prisma.subject.count({ where: { deletedAt: null } }),
      prisma.studentViolation.count({ where: { deletedAt: null } }),
      prisma.studentScore.aggregate({ _avg: { score: true } }),
      prisma.academicClass.findMany({
        where: classWhere as any,
        select: {
          id: true,
          institutionLevel: true,
          _count: { select: { enrollments: { where: { status: "ACTIVE", deletedAt: null } } } },
        },
      }),
    ]);

    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;
    const curriculumCompliance = Math.round(((scoreAgg._avg.score || 80) / 100) * 1000) / 10;

    const levelMap = new Map<string, { active: number }>();
    for (const cls of classes) {
      const level = cls.institutionLevel;
      if (!levelMap.has(level)) {
        levelMap.set(level, { active: 0 });
      }
      const entry = levelMap.get(level)!;
      entry.active += cls._count.enrollments;
    }

    const levelPerformances = Array.from(levelMap.entries()).map(([level, data]) => ({
      level,
      avgScore: averageGpa || 8.0,
      activeStudents: data.active,
    }));

    return NextResponse.json({
      status: "Success",
      data: {
        totalSantri,
        totalTeachers,
        totalClasses,
        totalCurriculums,
        totalSubjects,
        totalViolations,
        averageGpa,
        curriculumCompliance,
        levelPerformances,
        supervisedLevel,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
