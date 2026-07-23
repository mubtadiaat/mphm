import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalViolations = await prisma.studentViolation.count({ where: { deletedAt: null } });

    return NextResponse.json({
      status: "Success",
      data: {
        todayViolations: 1,
        monthlyViolations: totalViolations,
        pendingPenalties: 2,
        resolvedViolations: totalViolations,
        topViolationTypes: [
          { type: "Terlambat Subuh", count: 3 },
          { type: "Seragam Inkomplet", count: 2 },
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
