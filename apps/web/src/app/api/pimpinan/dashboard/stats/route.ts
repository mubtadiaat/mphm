import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalStudents = await prisma.studentProfile.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalTeachers = await prisma.teacherProfile.count({ where: { status: "ACTIVE", deletedAt: null } });

    const scoreAgg = await prisma.studentScore.aggregate({ _avg: { score: true } });
    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;

    return NextResponse.json({
      status: "Success",
      data: {
        totalStudents,
        totalTeachers,
        averageGpa,
        attendanceRate: 96.5,
        totalClasses: 12,
        financialSummary: { totalIncome: 150000000, totalExpense: 85000000 },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
