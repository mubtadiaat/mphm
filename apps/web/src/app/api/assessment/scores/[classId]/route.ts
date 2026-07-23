import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(req.url);
    const kwartal = searchParams.get("kwartal");

    const scores = await prisma.studentScore.findMany({
      where: {
        classId,
        ...(kwartal ? { kwartal: parseInt(kwartal, 10) } : {}),
      },
    });

    return NextResponse.json({ status: "Success", data: scores });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();
    const { studentId, subjectId, kwartal, score } = body;

    const kwartalNum = Number(kwartal);
    const scoreNum = Number(score);

    const existing = await prisma.studentScore.findFirst({
      where: { classId, studentId, subjectId, kwartal: kwartalNum },
    });

    let result;
    if (existing) {
      result = await prisma.studentScore.update({
        where: { id: existing.id },
        data: { score: scoreNum, updatedAt: new Date() },
      });
    } else {
      result = await prisma.studentScore.create({
        data: { classId, studentId, subjectId, kwartal: kwartalNum, score: scoreNum },
      });
    }

    return NextResponse.json({
      status: "Success",
      message: "Nilai berhasil disimpan",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
