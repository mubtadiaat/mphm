import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classId, studentId, subjectId, kwartal, score } = body;

    if (!classId || !studentId || !subjectId || kwartal === undefined || score === undefined) {
      return NextResponse.json(
        { status: "Error", message: "classId, studentId, subjectId, kwartal, dan score wajib diisi." },
        { status: 400 }
      );
    }

    const kwartalNum = Number(kwartal);
    const scoreNum = Number(score);

    if (kwartalNum < 1 || kwartalNum > 4) {
      return NextResponse.json(
        { status: "Error", message: "Kwartal harus bernilai antara 1 sampai 4." },
        { status: 400 }
      );
    }

    if (scoreNum < 0 || scoreNum > 10) {
      return NextResponse.json(
        { status: "Error", message: "Nilai harus bernilai antara 0 sampai 10." },
        { status: 400 }
      );
    }

    // 1. Dapatkan metadata mata pelajaran via Prisma
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json(
        { status: "Error", message: "Mata pelajaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Sacred Guard (Blueprint Modul #04): Max score = 8 HANYA untuk Akhlaq
    const isAkhlaq =
      subject.name.toLowerCase().includes("akhlaq") ||
      subject.code.toLowerCase().includes("akhlaq");
    const maxAllowed = isAkhlaq ? 8 : 10;

    if (scoreNum > maxAllowed) {
      return NextResponse.json(
        {
          status: "Validation Error",
          message: `Nilai maksimal untuk pelajaran ${isAkhlaq ? "Akhlaq" : "umum/sakral"} adalah ${maxAllowed}.`,
          field: "score",
        },
        { status: 400 }
      );
    }

    // 3. Upsert nilai ke database Prisma
    const existing = await prisma.studentScore.findFirst({
      where: {
        classId,
        studentId,
        subjectId,
        kwartal: kwartalNum,
      },
    });

    let result;
    if (existing) {
      result = await prisma.studentScore.update({
        where: { id: existing.id },
        data: {
          score: scoreNum,
          updatedAt: new Date(),
        },
      });
    } else {
      result = await prisma.studentScore.create({
        data: {
          classId,
          studentId,
          subjectId,
          kwartal: kwartalNum,
          score: scoreNum,
        },
      });
    }

    return NextResponse.json({
      status: "Success",
      message: "Nilai berhasil disimpan",
      data: result,
    });
  } catch (err: any) {
    console.error("SCORE_INPUT_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const kwartal = searchParams.get("kwartal");

    if (!classId) {
      return NextResponse.json(
        { status: "Error", message: "classId is required" },
        { status: 400 }
      );
    }

    const scores = await prisma.studentScore.findMany({
      where: {
        classId,
        ...(kwartal ? { kwartal: parseInt(kwartal, 10) } : {}),
      },
    });

    return NextResponse.json({ status: "Success", data: scores });
  } catch (err: any) {
    console.error("SCORES_GET_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
