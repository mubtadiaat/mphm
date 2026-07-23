import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { person: true, studentScores: { include: { subject: true } }, attendances: true },
    });

    if (!student) {
      return NextResponse.json(
        { status: "Error", message: "Student not found" },
        { status: 404 }
      );
    }

    const scoresMap = student.studentScores.map((s) => ({
      subjectName: s.subject.name,
      kwartal: s.kwartal,
      score: s.score,
    }));

    return NextResponse.json({
      status: "Success",
      data: {
        studentName: student.person.fullName,
        nis: student.nis,
        scores: scoresMap,
        attendances: student.attendances,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
