import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalStudents = await prisma.studentProfile.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalTeachers = await prisma.teacherProfile.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalClasses = await prisma.academicClass.count({ where: { deletedAt: null } });

    const scoreAgg = await prisma.studentScore.aggregate({ _avg: { score: true } });
    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;

    // Real database attendance rate
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

    const activeViolations = await prisma.studentViolation.count({ where: { deletedAt: null } });

    return NextResponse.json({
      status: "Success",
      data: {
        totalStudents,
        totalTeachers,
        averageGpa,
        attendanceRate,
        totalClasses,
        activeViolations,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
