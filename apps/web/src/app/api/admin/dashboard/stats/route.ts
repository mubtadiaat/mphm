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

    // Find target academic year
    let yearFilter: any = {};
    if (academicYearId) {
      yearFilter = { academicYearId };
    } else {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true, deletedAt: null },
      });
      if (activeYear) {
        yearFilter = { academicYearId: activeYear.id };
      }
    }

    // Total active students from DB
    const totalStudents = await prisma.studentProfile.count({
      where: { status: "ACTIVE", deletedAt: null },
    });

    // Average scores from DB
    const scoreAgg = await prisma.studentScore.aggregate({
      _avg: { score: true },
      where: yearFilter.academicYearId
        ? { academicClass: { academicYearId: yearFilter.academicYearId } }
        : undefined,
    });
    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;

    // Attendance rate calculation from DB
    const attendances = await prisma.studentAttendance.findMany();
    let totalDays = 0;
    let absentDays = 0;
    for (const a of attendances) {
      const daysInMonth = 26;
      totalDays += daysInMonth;
      absentDays += a.sick + a.permitted + a.unexcused;
    }
    const attendanceRate =
      totalDays > 0
        ? Math.round(((totalDays - absentDays) / totalDays) * 10000) / 100
        : 100;

    // Active violations count from DB
    const activeViolations = await prisma.studentViolation.count({
      where: { deletedAt: null },
    });

    // Performance by institution level from DB
    const classes = await prisma.academicClass.findMany({
      where: {
        deletedAt: null,
        ...(yearFilter.academicYearId
          ? { academicYearId: yearFilter.academicYearId }
          : {}),
      },
      include: {
        enrollments: { where: { status: "ACTIVE", deletedAt: null } },
        studentScores: true,
      },
    });

    const levelMap = new Map<
      string,
      { totalScore: number; count: number; active: number }
    >();
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

    const performances = Array.from(levelMap.entries()).map(
      ([level, data]) => ({
        level,
        score:
          data.count > 0
            ? Math.round((data.totalScore / data.count) * 100) / 100
            : 0,
        active: data.active,
      })
    );

    // Real database counts for Khidmah & Guardians
    const prismaKhidmah = (prisma as any).khidmahAssignment || (prisma as any).khidmah_assignment;
    const totalKhidmah = prismaKhidmah
      ? await prismaKhidmah.count({ where: { status: "ACTIVE", deletedAt: null } })
      : await prisma.alumniRecord.count({ where: { khidmahStatus: { not: "TIDAK_KHIDMAH" }, deletedAt: null } });

    const totalGuardians = await prisma.guardianProfile.count({
      where: { deletedAt: null },
    });

    // Real database counts for Rooms & Room Distributions
    const prismaRoom = (prisma as any).room;
    const totalRooms = prismaRoom
      ? await prismaRoom.count({ where: { deletedAt: null } })
      : 0;

    const dbRooms: any[] = prismaRoom
      ? await prismaRoom.findMany({
          where: { deletedAt: null },
          take: 6,
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { students: { where: { deletedAt: null } } },
            },
          },
        })
      : [];

    const roomDistributions = dbRooms.map((r: any) => ({
      roomName: r.name,
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
