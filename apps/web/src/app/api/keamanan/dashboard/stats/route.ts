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

    // Compute monthly violation trend for the last 6 months from DB
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const dbViolations = await prisma.studentViolation.findMany({
      where: {
        date: { gte: sixMonthsAgo },
        deletedAt: null,
      },
      select: { date: true },
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const monthMap = new Map<string, number>();

    // Seed last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = monthNames[d.getMonth()];
      monthMap.set(label, 0);
    }

    for (const v of dbViolations) {
      const d = new Date(v.date);
      const label = monthNames[d.getMonth()];
      if (monthMap.has(label)) {
        monthMap.set(label, (monthMap.get(label) || 0) + 1);
      }
    }

    const monthlyTrend = Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    return NextResponse.json({
      status: "Success",
      data: {
        todayViolations,
        monthlyViolations: totalViolations,
        pendingPenalties: totalViolations,
        resolvedViolations: totalViolations,
        monthlyTrend,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
