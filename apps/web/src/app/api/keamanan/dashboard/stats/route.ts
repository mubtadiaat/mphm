import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalViolations = await prisma.studentViolation.count({ where: { deletedAt: null } });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayViolations = await prisma.studentViolation.count({
      where: {
        date: { gte: todayStart },
        deletedAt: null,
      },
    });

    return NextResponse.json({
      status: "Success",
      data: {
        todayViolations,
        monthlyViolations: totalViolations,
        pendingPenalties: totalViolations,
        resolvedViolations: totalViolations,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
