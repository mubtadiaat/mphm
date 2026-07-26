import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const person = await tx.person.findUnique({ where: { id } });
      if (person) {
        const students = await tx.studentProfile.findMany({
          where: { personId: id },
          select: { id: true },
        });
        const studentIds = students.map((s) => s.id);

        if (studentIds.length > 0) {
          await tx.classEnrollment.deleteMany({
            where: { studentId: { in: studentIds } },
          });
          await tx.studentProfile.deleteMany({
            where: { id: { in: studentIds } },
          });
        }

        await tx.teacherProfile.deleteMany({ where: { personId: id } });
        await tx.guardianProfile.deleteMany({ where: { personId: id } });
        await tx.organizationMembership.deleteMany({ where: { personId: id } });
        await tx.userAccount.deleteMany({ where: { personId: id } });
        await tx.person.deleteMany({ where: { id } });
      } else {
        await tx.userAccount.deleteMany({ where: { id } });
        await tx.academicClass.deleteMany({ where: { id } });
      }
    });

    return NextResponse.json({
      status: "Success",
      message: "Data berhasil dihapus permanen.",
    });
  } catch (err: any) {
    console.error("RECYCLE_BIN_SINGLE_DELETE_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
