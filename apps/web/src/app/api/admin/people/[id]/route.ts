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
      class: className,
      classId,
    } = body;

    const updatedPersonName = name || fullName;

    // Dynamic targetPersonId resolution across all polymorphic profiles
    let targetPersonId: string | null = null;

    const existingPerson = await prisma.person.findFirst({ where: { id, deletedAt: null } });
    if (existingPerson) targetPersonId = existingPerson.id;

    if (!targetPersonId) {
      const teacher = await prisma.teacherProfile.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (teacher) targetPersonId = teacher.personId;
    }

    if (!targetPersonId) {
      const membership = await prisma.organizationMembership.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (membership) targetPersonId = membership.personId;
    }

    if (!targetPersonId) {
      const student = await prisma.studentProfile.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (student) targetPersonId = student.personId;
    }

    if (!targetPersonId) {
      const userAccount = await prisma.userAccount.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (userAccount) targetPersonId = userAccount.personId;
    }

    if (!targetPersonId) {
      targetPersonId = id;
    }

    const existingStudent = await prisma.studentProfile.findFirst({
      where: { personId: targetPersonId },
      include: { person: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Person
      const person = await tx.person.update({
        where: { id: targetPersonId! },
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

      // 1b. Update OrganizationMembership if roleName/role or supervisedLevel provided
      const targetRoleName = body.roleName || body.role;
      const targetSupervisedLevel = body.supervisedLevel;
      if (targetRoleName || targetSupervisedLevel !== undefined) {
        await tx.organizationMembership.updateMany({
          where: { personId: targetPersonId!, deletedAt: null },
          data: {
            ...(targetRoleName ? { role: targetRoleName } : {}),
            ...(targetSupervisedLevel !== undefined ? { supervisedLevel: targetSupervisedLevel } : {}),
          },
        });
      }

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

        // 2b. Update or Create ClassEnrollment if class specified
        let targetClass = null;
        if (classId) {
          targetClass = await tx.academicClass.findFirst({
            where: { id: classId, deletedAt: null },
          });
        } else if (className && className !== "Belum Ditentukan") {
          targetClass = await tx.academicClass.findFirst({
            where: {
              OR: [{ name: className }, { fullName: className }],
              deletedAt: null,
            },
          });
        }

        if (targetClass) {
          // Deactivate old enrollments
          await tx.classEnrollment.updateMany({
            where: { studentId: existingStudent.id, deletedAt: null },
            data: { deletedAt: new Date() },
          });

          // Create new enrollment
          await tx.classEnrollment.create({
            data: {
              classId: targetClass.id,
              studentId: existingStudent.id,
              status: "ACTIVE",
            },
          });
        }
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

    // Dynamic targetPersonId resolution across all polymorphic profiles
    let targetPersonId: string | null = null;

    const existingPerson = await prisma.person.findFirst({ where: { id } });
    if (existingPerson) targetPersonId = existingPerson.id;

    if (!targetPersonId) {
      const teacher = await prisma.teacherProfile.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (teacher) targetPersonId = teacher.personId;
    }

    if (!targetPersonId) {
      const membership = await prisma.organizationMembership.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (membership) targetPersonId = membership.personId;
    }

    if (!targetPersonId) {
      const student = await prisma.studentProfile.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (student) targetPersonId = student.personId;
    }

    if (!targetPersonId) {
      const userAccount = await prisma.userAccount.findFirst({ where: { OR: [{ id }, { personId: id }] } });
      if (userAccount) targetPersonId = userAccount.personId;
    }

    if (!targetPersonId) {
      return NextResponse.json(
        { status: "Error", message: "Data person tidak ditemukan." },
        { status: 404 }
      );
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Soft delete Person
      await tx.person.update({
        where: { id: targetPersonId! },
        data: { deletedAt: now },
      });

      // 2. Soft delete StudentProfile if exists
      await tx.studentProfile.updateMany({
        where: { personId: targetPersonId!, deletedAt: null },
        data: { deletedAt: now },
      });

      // 3. Soft delete TeacherProfile if exists
      await tx.teacherProfile.updateMany({
        where: { personId: targetPersonId!, deletedAt: null },
        data: { deletedAt: now },
      });

      // 4. Soft delete OrganizationMembership if exists
      await tx.organizationMembership.updateMany({
        where: { personId: targetPersonId!, deletedAt: null },
        data: { deletedAt: now },
      });

      // 5. Soft delete UserAccount if exists
      await tx.userAccount.updateMany({
        where: { personId: targetPersonId!, deletedAt: null },
        data: { status: "INACTIVE", deletedAt: now },
      });

      // 6. Soft delete GuardianProfile & associated Wali Person / Account if linked by familyCardNumber
      const santriGuardians = await tx.guardianProfile.findMany({
        where: { personId: targetPersonId!, deletedAt: null },
        select: { familyCardNumber: true },
      });

      await tx.guardianProfile.updateMany({
        where: { personId: targetPersonId!, deletedAt: null },
        data: { deletedAt: now },
      });

      const kkList = santriGuardians.map((g) => g.familyCardNumber).filter((kk): kk is string => Boolean(kk && kk !== "-"));
      if (kkList.length > 0) {
        const waliGuardians = await tx.guardianProfile.findMany({
          where: { familyCardNumber: { in: kkList }, deletedAt: null },
          select: { id: true, personId: true },
        });

        const waliPersonIds = waliGuardians.map((g) => g.personId);
        if (waliPersonIds.length > 0) {
          await tx.guardianProfile.updateMany({
            where: { id: { in: waliGuardians.map((g) => g.id) } },
            data: { deletedAt: now },
          });

          await tx.userAccount.updateMany({
            where: { personId: { in: waliPersonIds }, deletedAt: null },
            data: { status: "INACTIVE", deletedAt: now },
          });

          await tx.person.updateMany({
            where: { id: { in: waliPersonIds }, deletedAt: null },
            data: { deletedAt: now },
          });
        }
      }
    });

    return NextResponse.json({
      status: "Success",
      message: "Data person dan seluruh profil terkait berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("PEOPLE_ID_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
