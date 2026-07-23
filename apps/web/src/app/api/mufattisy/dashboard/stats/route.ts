import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalSantri = await prisma.studentProfile.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalTeachers = await prisma.teacherProfile.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalClasses = await prisma.academicClass.count({ where: { deletedAt: null } });
    const totalCurriculums = await prisma.curriculum.count({ where: { deletedAt: null } });
    const totalSubjects = await prisma.subject.count({ where: { deletedAt: null } });
    const totalViolations = await prisma.studentViolation.count({ where: { deletedAt: null } });

    const scoreAgg = await prisma.studentScore.aggregate({ _avg: { score: true } });
    const averageGpa = Math.round((scoreAgg._avg.score || 0) * 100) / 100;
    const curriculumCompliance = Math.round(((scoreAgg._avg.score || 80) / 100) * 1000) / 10;

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
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
