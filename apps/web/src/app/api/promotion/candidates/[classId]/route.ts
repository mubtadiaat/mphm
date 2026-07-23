import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId, status: "ACTIVE", deletedAt: null },
      include: {
        student: {
          include: { person: true },
        },
      },
    });

    const candidates = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.person.fullName,
      nis: e.student.nis,
      stambuk: e.student.stambukNumber,
      status: "NAIK_KELAS",
      average: 8.2,
    }));

    return NextResponse.json({ status: "Success", data: candidates });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
