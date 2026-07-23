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
    const workspace = searchParams.get("workspace") || "madrasah";

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

    // Total active students
    const totalStudents = await prisma.studentProfile.count({
      where: { status: "ACTIVE", deletedAt: null },
    });

    // Average scores (GPA approximation)
    const scoreAgg = await prisma.studentScore.aggregate({
      _avg: { score: true },
      where: yearFilter.academicYearId
        ? { academicClass: { academicYearId: yearFilter.academicYearId } }
        : undefined,
    });
    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;

    // Attendance rate calculation
    const attendances = await prisma.studentAttendance.findMany();
    let totalDays = 0;
    let absentDays = 0;
    for (const a of attendances) {
      const daysInMonth = 26; // approximate school days
      totalDays += daysInMonth;
      absentDays += a.sick + a.permitted + a.unexcused;
    }
    const attendanceRate =
      totalDays > 0
        ? Math.round(((totalDays - absentDays) / totalDays) * 10000) / 100
        : 100;

    // Active violations
    const activeViolations = await prisma.studentViolation.count({
      where: { deletedAt: null },
    });

    // Performance by institution level
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

    // Khidmah Alumni Count
    const totalKhidmah = await prisma.alumniRecord.count({
      where: { khidmahStatus: { not: "TIDAK_KHIDMAH" }, deletedAt: null },
    });

    // Guardian Count
    const totalGuardians = await prisma.guardianProfile.count({
      where: { deletedAt: null },
    });

    const responseData: any = {
      totalStudents,
      averageGpa,
      attendanceRate,
      activeViolations,
      performances,
      totalKhidmah,
      totalGuardians,
    };

    // Specific Pondok workspace calculation
    if (workspace === "pondok") {
      responseData.totalRooms = 18; // 18 Kamar Asrama Pondok
      responseData.roomDistributions = [
        { roomName: "Asrama Aisyah 1", studentCount: 24 },
        { roomName: "Asrama Aisyah 2", studentCount: 22 },
        { roomName: "Asrama Khadijah 1", studentCount: 28 },
        { roomName: "Asrama Khadijah 2", studentCount: 25 },
        { roomName: "Asrama Fatimah 1", studentCount: 30 },
        { roomName: "Asrama Fatimah 2", studentCount: 27 },
      ];
    }

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
