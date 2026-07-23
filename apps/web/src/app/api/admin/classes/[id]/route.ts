import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const academicClass = await prisma.academicClass.findUnique({
      where: { id },
      include: {
        mustahiq: true,
        curriculum: true,
        enrollments: {
          where: { status: "ACTIVE", deletedAt: null },
          include: { student: { include: { person: true } } },
        },
      },
    });

    if (!academicClass || academicClass.deletedAt) {
      return NextResponse.json(
        { status: "Error", message: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    const formattedClass = {
      id: academicClass.id,
      name: academicClass.name,
      fullName: academicClass.fullName,
      institutionLevel: academicClass.institutionLevel,
      levelNumber: academicClass.levelNumber,
      mustahiq: academicClass.mustahiq?.fullName || "Ustadz Muhammad Ridwan, Lc",
      mufattisy: "Ustadz Dr. H. Zayd Syarif",
      mustahiqId: academicClass.mustahiqId,
      curriculumId: academicClass.curriculumId,
      curriculumName: academicClass.curriculum?.name || "-",
    };

    const students = academicClass.enrollments.map((e) => ({
      studentId: e.studentId,
      name: e.student.person.fullName,
      fullName: e.student.person.fullName,
      stambuk: e.student.stambukNumber,
      nis: e.student.nis,
      nisn: e.student.nisn || "-",
      gender: e.student.person.gender,
      address: e.student.person.address || "-",
      phone: e.student.person.phoneNumber || "-",
    }));

    return NextResponse.json({
      status: "Success",
      data: { class: formattedClass, students },
    });
  } catch (err: any) {
    console.error("ADMIN_CLASS_ID_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, fullName, institutionLevel, levelNumber, mustahiqId, curriculumId } = body;

    const updated = await prisma.academicClass.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(fullName ? { fullName } : {}),
        ...(institutionLevel ? { institutionLevel } : {}),
        ...(levelNumber !== undefined ? { levelNumber: Number(levelNumber) } : {}),
        ...(mustahiqId !== undefined ? { mustahiqId } : {}),
        ...(curriculumId !== undefined ? { curriculumId } : {}),
      },
    });

    return NextResponse.json({
      status: "Success",
      message: "Kelas berhasil diperbarui",
      data: updated,
    });
  } catch (err: any) {
    console.error("ADMIN_CLASS_ID_PUT_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.academicClass.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      status: "Success",
      message: "Kelas berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("ADMIN_CLASS_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
