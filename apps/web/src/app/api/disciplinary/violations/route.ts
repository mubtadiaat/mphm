import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const violations = await prisma.studentViolation.findMany({
      where: {
        deletedAt: null,
        ...(studentId ? { studentId } : {}),
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json({ status: "Success", data: violations });
  } catch (err: any) {
    console.error("VIOLATIONS_GET_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, violationTypeId, penalty, evidenceUrl, notes } = body;

    if (!studentId || !violationTypeId) {
      return NextResponse.json(
        { status: "Error", message: "studentId dan violationTypeId wajib diisi." },
        { status: 400 }
      );
    }

    const violation = await prisma.studentViolation.create({
      data: {
        studentId,
        violationTypeId,
        penalty: penalty || null,
        evidenceUrl: evidenceUrl || null,
        notes: notes || null,
        date: new Date(),
      },
    });

    return NextResponse.json({ status: "Success", data: violation });
  } catch (err: any) {
    console.error("VIOLATIONS_POST_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
