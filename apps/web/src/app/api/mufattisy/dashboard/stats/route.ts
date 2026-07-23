import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalTeachers = await prisma.teacherProfile.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalClasses = await prisma.academicClass.count({ where: { deletedAt: null } });

    return NextResponse.json({
      status: "Success",
      data: {
        inspectionsCompleted: 24,
        pendingReviews: 3,
        curriculumCompliance: 94.8,
        totalTeachers,
        totalClasses,
        evaluations: [
          { month: "Jan", score: 88 },
          { month: "Feb", score: 92 },
          { month: "Mar", score: 90 },
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
