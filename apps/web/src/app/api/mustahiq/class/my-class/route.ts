import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSessionFromCookies();

    // Find class where current user is Mustahiq or fallback to first active class
    let academicClass = null;
    if (session?.personId) {
      academicClass = await prisma.academicClass.findFirst({
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
      academicClass = await prisma.academicClass.findFirst({
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

    const students = academicClass.enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.person.fullName,
      nis: e.student.nis,
      stambuk: e.student.stambukNumber,
      gender: e.student.person.gender,
      birthPlace: e.student.person.birthPlace,
      birthDate: e.student.person.birthDate,
      address: e.student.person.address,
    }));

    return NextResponse.json({
      status: "Success",
      data: {
        id: academicClass.id,
        name: academicClass.name,
        fullName: academicClass.fullName,
        institutionLevel: academicClass.institutionLevel,
        levelNumber: academicClass.levelNumber,
        students,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
