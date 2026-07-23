import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const deletedPeople = await prisma.person.findMany({
      where: { deletedAt: { not: null } },
    });
    const deletedUsers = await prisma.userAccount.findMany({
      where: { deletedAt: { not: null } },
    });
    const deletedClasses = await prisma.academicClass.findMany({
      where: { deletedAt: { not: null } },
    });

    const items = [
      ...deletedPeople.map((p) => ({
        id: p.id,
        entityType: "Person",
        name: p.fullName,
        deletedAt: p.deletedAt,
      })),
      ...deletedUsers.map((u) => ({
        id: u.id,
        entityType: "UserAccount",
        name: u.username,
        deletedAt: u.deletedAt,
      })),
      ...deletedClasses.map((c) => ({
        id: c.id,
        entityType: "AcademicClass",
        name: c.fullName,
        deletedAt: c.deletedAt,
      })),
    ];

    return NextResponse.json({ status: "Success", data: items });
  } catch (err: any) {
    console.error("RECYCLE_BIN_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
