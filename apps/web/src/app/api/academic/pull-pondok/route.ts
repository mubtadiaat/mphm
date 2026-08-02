import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthSession } from "@/lib/apiGuard";

export const dynamic = "force-dynamic";

/**
 * GET /api/academic/pull-pondok
 * Mengambil daftar santriwati Pondok P3HM untuk keperluan penarikan data ke Madrasah MPHM.
 * Hanya akun dari instansi Madrasah (atau admin) yang diizinkan mengakses endpoint ini.
 * Ini adalah SATU-SATUNYA mekanisme resmi sinkronisasi data Pondok → Madrasah.
 */

export async function GET(req: NextRequest) {
  try {
    // Guard: hanya Madrasah (sek.madrasah, mustahiq, admin) yang bisa akses
    const { session, errorResponse } = await requireAuthSession(req, ["sek", "mustahiq", "admin", "superadmin"]);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const academicYearId = searchParams.get("academicYearId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");

    const whereCondition: any = {
      deletedAt: null,
      person: { deletedAt: null },
      OR: [
        { residenceType: "PONDOK_MUBTADIAAT" },
        { roomId: { not: null } },
      ],
    };

    if (query.trim()) {
      whereCondition.AND = [
        {
          OR: [
            { person: { fullName: { contains: query, mode: "insensitive" } } },
            { stambukNumber: { contains: query, mode: "insensitive" } },
            { nis: { contains: query, mode: "insensitive" } },
            { person: { nik: { contains: query, mode: "insensitive" } } },
          ],
        },
      ];
    }

    const students = await (prisma.studentProfile as any).findMany({
      where: whereCondition,
      take: limit,
      include: {
        person: {
          include: {
            guardianProfiles: {
              where: { deletedAt: null },
              include: { person: true },
              take: 1,
            },
          },
        },
        room: {
          include: { supervisor: true },
        },
        enrollments: {
          where: { deletedAt: null },
          include: {
            academicClass: true,
          },
        },
      },
      orderBy: { person: { fullName: "asc" } },
    });

    const result = students.map((sp: any) => {
      const activeEnrollment = academicYearId
        ? sp.enrollments.find((e: any) => e.academicClass?.academicYearId === academicYearId)
        : sp.enrollments[0];

      const guardian = sp.person.guardianProfiles?.[0];

      return {
        id: sp.id,
        personId: sp.personId,
        fullName: sp.person.fullName,
        stambukNumber: sp.stambukNumber,
        nis: sp.nis,
        nik: sp.person.nik || "-",
        residenceType: sp.residenceType || "PONDOK_MUBTADIAAT",
        roomName: sp.room?.name || "Tanpa Kamar",
        buildingName: sp.room?.buildingName || "Asrama Utama",
        currentClass: activeEnrollment?.academicClass?.name || "Belum Ada Kelas",
        isEnrolled: !!activeEnrollment,
        guardianName: guardian?.person?.fullName || "-",
        guardianPhone: guardian?.person?.phoneNumber || "-",
      };
    });

    return NextResponse.json({ status: "Success", data: result });
  } catch (error: any) {
    console.error("Error fetching Pondok students for EMIS pull:", error);
    return NextResponse.json(
      { status: "Error", message: error.message || "Gagal mengambil data santri Pondok." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, classId } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { status: "Error", message: "studentId dan classId wajib diisi." },
        { status: 400 }
      );
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { person: true },
    });

    if (!student) {
      return NextResponse.json(
        { status: "Error", message: "Data santri tidak ditemukan." },
        { status: 404 }
      );
    }

    const targetClass = await prisma.academicClass.findUnique({
      where: { id: classId },
    });

    if (!targetClass) {
      return NextResponse.json(
        { status: "Error", message: "Kelas Madrasah tidak ditemukan." },
        { status: 404 }
      );
    }

    // Check if student is already enrolled in this class
    const existingEnrollment = await prisma.classEnrollment.findFirst({
      where: {
        studentId: studentId,
        classId: classId,
        deletedAt: null,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        status: "Success",
        message: `Santri ${student.person.fullName} sudah terdaftar di kelas ${targetClass.name}.`,
        data: existingEnrollment,
      });
    }

    const newEnrollment = await prisma.classEnrollment.create({
      data: {
        studentId: studentId,
        classId: classId,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      status: "Success",
      message: `Berhasil menarik data santri ${student.person.fullName} dan mengaitkannya ke kelas ${targetClass.name}.`,
      data: newEnrollment,
    });
  } catch (error: any) {
    console.error("Error executing EMIS pull for Pondok student:", error);
    return NextResponse.json(
      { status: "Error", message: error.message || "Gagal memproses penarikan data santri." },
      { status: 500 }
    );
  }
}
