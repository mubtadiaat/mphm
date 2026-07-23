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

    // Compute monthly attendance trend from DB
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const attendanceTrend: { month: string; rate: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIdx = d.getMonth() + 1;
      const yVal = d.getFullYear();
      const monthLabel = monthNames[d.getMonth()];

      const mAtts = await prisma.studentAttendance.findMany({
        where: { month: mIdx, year: yVal },
      });

      let mTotal = 0;
      let mAbsent = 0;
      for (const ma of mAtts) {
        mTotal += 26;
        mAbsent += ma.sick + ma.permitted + ma.unexcused;
      }

      const mRate = mTotal > 0 ? Math.round(((mTotal - mAbsent) / mTotal) * 1000) / 10 : 96.5;
      attendanceTrend.push({ month: monthLabel, rate: mRate });
    }

    return NextResponse.json({
      status: "Success",
      data: {
        totalStudents,
        totalTeachers,
        averageGpa,
        attendanceRate,
        totalClasses,
        activeViolations,
        attendanceTrend,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
