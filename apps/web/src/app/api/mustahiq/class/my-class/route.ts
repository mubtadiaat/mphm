import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSessionFromCookies();

    // Find class where current user is Mustahiq or fallback to first active class
    let academicClass = null;
    if (session?.personId) {
      academicClass = await (prisma as any).academicClass.findFirst({
        where: { mustahiqId: session.personId, deletedAt: null },
        include: {
          enrollments: {
            where: { status: "ACTIVE", deletedAt: null },
            include: { student: { include: { person: true } } },
          },
        },
      });
    }

    if (!academicClass) {
      academicClass = await (prisma as any).academicClass.findFirst({
        where: { deletedAt: null },
        include: {
          enrollments: {
            where: { status: "ACTIVE", deletedAt: null },
            include: { student: { include: { person: true } } },
          },
        },
      });
    }

    if (!academicClass) {
      return NextResponse.json(
        { status: "Error", message: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    const students = (academicClass.enrollments || []).map((e: any) => {
      const personName = e.student?.person?.fullName || "";
      const fallbackName = personName || (e.student?.stambukNumber ? `Santri ${e.student.stambukNumber}` : `Santri ${e.student?.nis || ""}`);
      return {
        id: e.student.id,
        studentId: e.student.id,
        name: fallbackName,
        fullName: fallbackName,
        nis: e.student?.nis || "-",
        nisn: e.student?.nisn || "-",
        stambuk: e.student?.stambukNumber || "-",
        gender: e.student?.person?.gender || "P",
        birthPlace: e.student?.person?.birthPlace || "-",
        birthDate: e.student?.person?.birthDate || "-",
        address: e.student?.person?.address || "-",
      };
    });

    const classInfo = {
      id: academicClass.id,
      name: academicClass.name,
      fullName: academicClass.fullName || academicClass.name,
      institutionLevel: academicClass.institutionLevel || "IBTIDAIYYAH",
      levelNumber: academicClass.levelNumber || 1,
      capacity: 20,
    };

    return NextResponse.json({
      status: "Success",
      data: {
        ...classInfo,
        class: classInfo,
        students,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
