import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json(
        { status: "Error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get("academicYearId");

    // 1. Resolve Academic Year ID if not passed
    let targetYearId = academicYearId || null;
    if (!targetYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true, deletedAt: null },
        select: { id: true },
      });
      targetYearId = activeYear?.id || null;
    }

    const yearScoreWhere = targetYearId
      ? { academicClass: { academicYearId: targetYearId } }
      : undefined;

    const classWhere = {
      deletedAt: null,
      ...(targetYearId ? { academicYearId: targetYearId } : {}),
    };

    const prismaKhidmah = (prisma as any).khidmahAssignment || (prisma as any).khidmah_assignment;
    const prismaRoom = (prisma as any).room;

    const prismaPermit = (prisma as any).studentPermit;

    // 2. Execute all queries concurrently in parallel
    const [
      totalStudents,
      scoreAgg,
      attendanceAgg,
      activeViolations,
      classes,
      totalKhidmah,
      totalGuardians,
      totalRooms,
      dbRooms,
      recentAuditLogs,
      activePermits,
    ] = await Promise.all([
      prisma.studentProfile.count({
        where: { status: "ACTIVE", deletedAt: null },
      }),
      prisma.studentScore.aggregate({
        _avg: { score: true },
        where: yearScoreWhere,
      }),
      prisma.studentAttendance.aggregate({
        _sum: { sick: true, permitted: true, unexcused: true },
        _count: { id: true },
      }),
      prisma.studentViolation.count({
        where: { deletedAt: null },
      }),
      prisma.academicClass.findMany({
        where: classWhere,
        select: {
          id: true,
          institutionLevel: true,
          _count: {
            select: { enrollments: { where: { status: "ACTIVE", deletedAt: null } } },
          },
        },
      }),
      prismaKhidmah
        ? prismaKhidmah.count({ where: { status: "ACTIVE", deletedAt: null } })
        : prisma.alumniRecord.count({ where: { khidmahStatus: { not: "TIDAK_KHIDMAH" }, deletedAt: null } }),
      prisma.guardianProfile.count({ where: { deletedAt: null } }),
      prismaRoom ? prismaRoom.count({ where: { deletedAt: null } }) : Promise.resolve(0),
      prismaRoom
        ? prismaRoom.findMany({
            where: { deletedAt: null },
            take: 6,
            orderBy: { name: "asc" },
            select: {
              name: true,
              buildingName: true,
              _count: {
                select: { students: { where: { deletedAt: null } } },
              },
            },
          })
        : Promise.resolve([]),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          action: true,
          entity: true,
          userId: true,
          createdAt: true,
        },
      }),
      prismaPermit ? prismaPermit.count({ where: { status: "APPROVED", deletedAt: null } }) : Promise.resolve(0),
    ]);

    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;

    const attendanceCount = attendanceAgg._count.id || 0;
    const totalSick = attendanceAgg._sum.sick || 0;
    const totalPermitted = attendanceAgg._sum.permitted || 0;
    const totalUnexcused = attendanceAgg._sum.unexcused || 0;
    const totalDays = attendanceCount * 26;
    const absentDays = totalSick + totalPermitted + totalUnexcused;
    const attendanceRate =
      totalDays > 0
        ? Math.round(((totalDays - absentDays) / totalDays) * 10000) / 100
        : 100;

    const levelMap = new Map<string, { active: number }>();
    for (const cls of classes) {
      const level = cls.institutionLevel;
      if (!levelMap.has(level)) {
        levelMap.set(level, { active: 0 });
      }
      const entry = levelMap.get(level)!;
      entry.active += cls._count.enrollments;
    }

    const performances = Array.from(levelMap.entries()).map(([level, data]) => ({
      level,
      score: averageGpa || 8.0,
      active: data.active,
    }));

    const roomDistributions = (dbRooms as any[]).map((r) => ({
      roomName: r.name,
      buildingName: r.buildingName,
      studentCount: r._count?.students || 0,
    }));

    const responseData = {
      totalStudents,
      averageGpa,
      attendanceRate,
      activeViolations,
      performances,
      totalKhidmah,
      totalGuardians,
      totalRooms,
      roomDistributions,
      totalClasses: classes.length,
      activePermits,
      recentAuditLogs: recentAuditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        userId: l.userId || "Sistem",
        createdAt: l.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({
      status: "Success",
      data: responseData,
    });
  } catch (err: any) {
    console.error("DASHBOARD_STATS_ERROR:", err?.message || err);
    return NextResponse.json(
      { status: "Error", message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
