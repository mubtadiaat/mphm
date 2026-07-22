import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        teacherProfile: true,
        guardianProfiles: true,
        userAccount: true,
      },
    });

    if (!person || person.deletedAt) {
      return NextResponse.json(
        { status: "Error", message: "Data orang tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "Success", data: person });
  } catch (err: any) {
    console.error("PEOPLE_ID_GET_ERROR:", err.message);
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
    const {
      name,
      fullName,
      nik,
      gender,
      birthPlace,
      birthDate,
      address,
      phoneNumber,
      stambuk,
      nis,
      nisn,
      status,
      guardianName,
      guardianPhone,
      guardianRelation,
      familyCardNumber,
    } = body;

    const updatedPersonName = name || fullName;

    // Check if id matches personId or studentProfile id
    const existingStudent = await prisma.studentProfile.findFirst({
      where: { OR: [{ id }, { personId: id }] },
      include: { person: true },
    });

    const targetPersonId = existingStudent ? existingStudent.personId : id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Person
      const person = await tx.person.update({
        where: { id: targetPersonId },
        data: {
          ...(updatedPersonName ? { fullName: updatedPersonName } : {}),
          ...(nik !== undefined ? { nik } : {}),
          ...(gender !== undefined ? { gender } : {}),
          ...(birthPlace !== undefined ? { birthPlace } : {}),
          ...(birthDate !== undefined ? { birthDate } : {}),
          ...(address !== undefined ? { address } : {}),
          ...(phoneNumber !== undefined ? { phoneNumber } : {}),
        },
      });

      // 2. Update StudentProfile if exists
      if (existingStudent) {
        await tx.studentProfile.update({
          where: { id: existingStudent.id },
          data: {
            ...(stambuk !== undefined ? { stambukNumber: stambuk } : {}),
            ...(nis !== undefined ? { nis } : {}),
            ...(nisn !== undefined ? { nisn } : {}),
            ...(status !== undefined ? { status: status.toUpperCase() } : {}),
          },
        });
      }

      return person;
    });

    return NextResponse.json({
      status: "Success",
      message: "Data orang/santri berhasil diperbarui.",
      data: result,
    });
  } catch (err: any) {
    console.error("PEOPLE_ID_PUT_ERROR:", err.message);
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

    const existingStudent = await prisma.studentProfile.findFirst({
      where: { OR: [{ id }, { personId: id }] },
    });

    const targetPersonId = existingStudent ? existingStudent.personId : id;
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.person.update({
        where: { id: targetPersonId },
        data: { deletedAt: now },
      });

      if (existingStudent) {
        await tx.studentProfile.update({
          where: { id: existingStudent.id },
          data: { deletedAt: now },
        });
      }
    });

    return NextResponse.json({
      status: "Success",
      message: "Data berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("PEOPLE_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
