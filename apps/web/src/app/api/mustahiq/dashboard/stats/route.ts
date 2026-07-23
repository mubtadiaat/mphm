import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    const myClass = await (prisma as any).academicClass.findFirst({
      where: session?.personId ? { mustahiqId: session.personId, deletedAt: null } : { deletedAt: null },
      include: {
        enrollments: { where: { status: "ACTIVE", deletedAt: null } },
      },
    });

    const classStudentsCount = myClass?.enrollments.length || 0;

    let averageClassScore = 0;
    const kwartalScores: { kwartal: string; avg: number }[] = [
      { kwartal: "Kwartal 1", avg: 0 },
      { kwartal: "Kwartal 2", avg: 0 },
      { kwartal: "Kwartal 3", avg: 0 },
      { kwartal: "Kwartal 4", avg: 0 },
    ];

    if (myClass?.id) {
      const scoreAgg = await (prisma as any).studentScore.aggregate({
        _avg: { score: true },
        where: { classId: myClass.id },
      });
      averageClassScore = Math.round((scoreAgg._avg.score || 0) * 100) / 100;

      for (let k = 1; k <= 4; k++) {
        const kAgg = await (prisma as any).studentScore.aggregate({
          _avg: { score: true },
          where: { classId: myClass.id, kwartal: k },
        });
        kwartalScores[k - 1].avg = Math.round((kAgg._avg.score || 0) * 10) / 10;
      }
    }

    // Attendance rate for class students
    const studentIds = myClass?.enrollments.map((e: any) => e.studentId) || [];
    const attendances = studentIds.length > 0
      ? await (prisma as any).studentAttendance.findMany({ where: { studentId: { in: studentIds } } })
      : [];

    let totalDays = 0;
    let absentDays = 0;
    for (const a of attendances) {
      totalDays += 26;
      absentDays += a.sick + a.permitted + a.unexcused;
    }
    const attendanceRate =
      totalDays > 0
        ? Math.round(((totalDays - absentDays) / totalDays) * 10000) / 100
        : 100;

    const totalViolations = studentIds.length > 0
      ? await (prisma as any).studentViolation.count({ where: { studentId: { in: studentIds }, deletedAt: null } })
      : 0;

    return NextResponse.json({
      status: "Success",
      data: {
        className: myClass?.fullName || myClass?.name || "Kelas Diniyyah",
        classStudentsCount,
        averageClassScore,
        attendanceRate,
        totalViolations,
        kwartalScores,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
