import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (type) where.permitType = type;

    const permits = await (prisma as any).studentPermit.findMany({
      where,
      include: {
        student: {
          include: {
            person: true,
          },
        },
        approvedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = permits.map((p: any) => ({
      id: p.id,
      studentId: p.studentId,
      studentName: p.student.person.fullName,
      stambuk: p.student.stambukNumber,
      permitType: p.permitType,
      reason: p.reason,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      approvedByName: p.approvedBy?.fullName || "-",
      notes: p.notes,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      status: "Success",
      data: formatted,
    });
  } catch (err: any) {
    console.error("GET_PERMITS_ERROR:", err);
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal mengambil data perizinan." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, permitType, reason, startDate, endDate, notes } = body;

    if (!studentId || !permitType || !reason || !startDate || !endDate) {
      return NextResponse.json(
        { status: "Validation Error", message: "Seluruh kolom wajib diisi." },
        { status: 400 }
      );
    }

    const permit = await (prisma as any).studentPermit.create({
      data: {
        studentId,
        permitType,
        reason,
        startDate,
        endDate,
        notes,
        status: "PENDING",
      },
      include: {
        student: {
          include: {
            person: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: "Success",
      message: "Pengajuan perizinan berhasil dibuat.",
      data: {
        id: permit.id,
        studentName: permit.student.person.fullName,
        permitType: permit.permitType,
        status: permit.status,
      },
    });
  } catch (err: any) {
    console.error("POST_PERMIT_ERROR:", err);
    return NextResponse.json(
      { status: "Error", message: err.message || "Gagal membuat pengajuan perizinan." },
      { status: 500 }
    );
  }
}
