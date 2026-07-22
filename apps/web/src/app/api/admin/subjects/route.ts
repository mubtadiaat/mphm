import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      where: { deletedAt: null },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ status: "Success", data: subjects });
  } catch (err: any) {
    console.error("SUBJECTS_GET_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, subjectType } = body;

    if (!code || !name || !subjectType) {
      return NextResponse.json(
        { status: "Error", message: "code, name, dan subjectType wajib diisi." },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        subjectType,
      },
    });

    return NextResponse.json({ status: "Success", data: subject });
  } catch (err: any) {
    console.error("SUBJECTS_POST_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
