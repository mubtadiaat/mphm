import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await (prisma as any).studentProfile.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      include: {
        person: true,
        enrollments: {
          where: { status: "ACTIVE", deletedAt: null },
          include: { academicClass: true },
        },
      },
      take: 10,
    });

    const children = students.map((s: any) => ({
      id: s.id,
      name: s.person?.fullName || "-",
      nis: s.nis || "-",
      stambuk: s.stambukNumber || "-",
      gender: s.person?.gender || "P",
      className: s.enrollments?.[0]?.academicClass?.fullName || s.enrollments?.[0]?.academicClass?.name || "-",
    }));

    return NextResponse.json({ status: "Success", data: children });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}
