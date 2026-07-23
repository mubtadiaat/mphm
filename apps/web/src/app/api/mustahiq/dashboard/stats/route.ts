import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    const myClass = await prisma.academicClass.findFirst({
      where: session?.personId ? { mustahiqId: session.personId, deletedAt: null } : { deletedAt: null },
      include: {
        enrollments: { where: { status: "ACTIVE", deletedAt: null } },
      },
    });

    const classStudentsCount = myClass?.enrollments.length || 0;

    let averageClassScore = 0;
    if (myClass?.id) {
      const scoreAgg = await prisma.studentScore.aggregate({
        _avg: { score: true },
        where: { classId: myClass.id },
      });
      averageClassScore = Math.round((scoreAgg._avg.score || 0) * 100) / 100;
    }

    // Attendance rate for class students
    const studentIds = myClass?.enrollments.map((e) => e.studentId) || [];
    const attendances = studentIds.length > 0
      ? await prisma.studentAttendance.findMany({ where: { studentId: { in: studentIds } } })
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

    const unsubmittedScores = await prisma.studentProfile.count({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        enrollments: {
          some: { classId: myClass?.id || "" },
        },
        studentScores: {
          none: { classId: myClass?.id || "" },
        },
      },
    });

    return NextResponse.json({
      status: "Success",
      data: {
        className: myClass?.fullName || myClass?.name || "Kelas Diniyyah",
        classStudentsCount,
        averageClassScore,
        attendanceRate,
        unsubmittedScores,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
