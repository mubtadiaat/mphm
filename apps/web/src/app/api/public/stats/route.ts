import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const [totalSiswiAktif, totalAlumni, totalKelasAktif, totalPengajar] = await Promise.all([
      prisma.studentProfile.count({
        where: {
          status: "ACTIVE",
          deletedAt: null,
        },
      }),
      prisma.alumniRecord.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.academicClass.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.teacherProfile.count({
        where: {
          status: "ACTIVE",
          deletedAt: null,
        },
      }),
    ]);

    const tahunBerdiri = 1997;
    const tahunBeroperasi = new Date().getFullYear() - tahunBerdiri;

    return NextResponse.json({
      success: true,
      data: {
        totalSiswiAktif,
        totalAlumni,
        totalKelasAktif,
        totalPengajar,
        tahunBerdiri,
        tahunBeroperasi,
      },
    });
  } catch (error: any) {
    console.error("Error fetching public stats:", error);
    // Return fallback numbers if DB query fails
    const tahunBerdiri = 1997;
    return NextResponse.json({
      success: true,
      data: {
        totalSiswiAktif: 1250,
        totalAlumni: 4800,
        totalKelasAktif: 28,
        totalPengajar: 45,
        tahunBerdiri,
        tahunBeroperasi: new Date().getFullYear() - tahunBerdiri,
      },
      fallback: true,
    });
  }
}
