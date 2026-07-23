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
          include: {
            person: true,
            attendances: true,
          },
        },
      },
    });

    const data = enrollments.map((e) => ({
      studentId: e.student.id,
      name: e.student.person.fullName,
      nis: e.student.nis,
      attendance: e.student.attendances[0] || { sick: 0, permitted: 0, unexcused: 0 },
    }));

    return NextResponse.json({ status: "Success", data });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const body = await req.json();
    const { attendances, month, year } = body; // Array of { studentId, sick, permitted, unexcused }

    if (Array.isArray(attendances)) {
      for (const item of attendances) {
        const existing = await prisma.studentAttendance.findFirst({
          where: {
            studentId: item.studentId,
            month: month || new Date().getMonth() + 1,
            year: year || new Date().getFullYear(),
          },
        });

        if (existing) {
          await prisma.studentAttendance.update({
            where: { id: existing.id },
            data: {
              sick: item.sick ?? existing.sick,
              permitted: item.permitted ?? existing.permitted,
              unexcused: item.unexcused ?? existing.unexcused,
            },
          });
        } else {
          await prisma.studentAttendance.create({
            data: {
              studentId: item.studentId,
              month: month || new Date().getMonth() + 1,
              year: year || new Date().getFullYear(),
              sick: item.sick || 0,
              permitted: item.permitted || 0,
              unexcused: item.unexcused || 0,
            },
          });
        }
      }
    }

    return NextResponse.json({ status: "Success", message: "Absensi berhasil disimpan" });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
