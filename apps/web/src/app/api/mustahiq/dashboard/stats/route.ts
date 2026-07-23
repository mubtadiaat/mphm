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

    return NextResponse.json({
      status: "Success",
      data: {
        className: myClass?.name || "1 Ibtida'iyyah A",
        classStudentsCount,
        averageClassScore: 82.5,
        attendanceRate: 98.1,
        unsubmittedScores: 2,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
