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

    const totalSantri = await prisma.studentProfile.count({ where: studentWhere as any });
    const totalTeachers = await prisma.teacherProfile.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalClasses = await prisma.academicClass.count({ where: classWhere as any });
    const totalCurriculums = await prisma.curriculum.count({ where: { deletedAt: null } });
    const totalSubjects = await prisma.subject.count({ where: { deletedAt: null } });
    const totalViolations = await prisma.studentViolation.count({ where: { deletedAt: null } });

    const scoreAgg = await prisma.studentScore.aggregate({ _avg: { score: true } });
    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;
    const curriculumCompliance = Math.round(((scoreAgg._avg.score || 80) / 100) * 1000) / 10;

    // Real DB breakdown by institution level
    const classes = await prisma.academicClass.findMany({
      where: classWhere as any,
      include: {
        enrollments: { where: { status: "ACTIVE", deletedAt: null } },
        studentScores: true,
      },
    });

    const levelMap = new Map<string, { totalScore: number; count: number; active: number }>();
    for (const cls of classes) {
      const level = cls.institutionLevel;
      if (!levelMap.has(level)) {
        levelMap.set(level, { totalScore: 0, count: 0, active: 0 });
      }
      const entry = levelMap.get(level)!;
      entry.active += cls.enrollments.length;
      for (const sc of cls.studentScores) {
        entry.totalScore += sc.score;
        entry.count += 1;
      }
    }

    const levelPerformances = Array.from(levelMap.entries()).map(([level, data]) => ({
      level,
      avgScore: data.count > 0 ? Math.round((data.totalScore / data.count) * 10) / 10 : 8.0,
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
