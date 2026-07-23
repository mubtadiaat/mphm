import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.studentProfile.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      include: { person: true },
      take: 5,
    });

    const children = students.map((s) => ({
      id: s.id,
      name: s.person.fullName,
      nis: s.nis,
      stambuk: s.stambukNumber,
      gender: s.person.gender,
      className: "1 Ibtida'iyyah A",
    }));

    return NextResponse.json({ status: "Success", data: children });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
