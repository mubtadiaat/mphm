import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promotions } = body; // Array of { studentId: string, status: "PROMOTED" | "RETAINED" | "GRADUATED" | "KHIDMAH" }

    if (!Array.isArray(promotions) || promotions.length === 0) {
      return NextResponse.json(
        { status: "Error", message: "Array promotions wajib diisi." },
        { status: 400 }
      );
    }

    const updatedResults = [];

    for (const item of promotions) {
      const { studentId, status } = item;

      if (!studentId || !status) continue;

      // Check if student belongs to I'dadiyyah level (which is 1-year orientation, no promotion)
      const enrollment = await prisma.classEnrollment.findFirst({
        where: { studentId, status: "ACTIVE", deletedAt: null },
      });

      if (enrollment) {
        const cls = await prisma.academicClass.findUnique({
          where: { id: enrollment.classId },
        });

        // Blueprint Modul #05: I'dadiyyah dikecualikan dari algoritma kenaikan kelas
        if (cls?.institutionLevel === "I'dadiyyah") {
          continue;
        }
      }

      const updated = await prisma.studentProfile.update({
        where: { id: studentId },
        data: { status },
      });

      updatedResults.push(updated);
    }

    return NextResponse.json({
      status: "Success",
      message: `${updatedResults.length} data status santri berhasil diperbarui.`,
      data: updatedResults,
    });
  } catch (err: any) {
    console.error("PROMOTION_EXECUTE_PRISMA_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
