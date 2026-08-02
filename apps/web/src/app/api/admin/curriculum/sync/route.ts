import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OFFICIAL_CURRICULUM } from "@/config/curriculum.config";

export async function POST(_req: NextRequest) {
  try {
    let syncedSubjectCount = 0;
    let syncedCurriculumCount = 0;

    for (const item of OFFICIAL_CURRICULUM) {
      const curriculumName = `Kurikulum ${item.jenjang} Kelas ${item.kelas}`;
      
      // 1. Ensure Curriculum exists
      let curr = await prisma.curriculum.findFirst({
        where: {
          name: curriculumName,
          institutionLevel: item.jenjang,
          deletedAt: null,
        },
      });

      if (!curr) {
        curr = await prisma.curriculum.create({
          data: {
            name: curriculumName,
            institutionLevel: item.jenjang,
          },
        });
        syncedCurriculumCount++;
      }

      // 2. Process each subject
      let order = 1;
      for (const subjName of item.subjects) {
        // Generate a clean unique code based on Jenjang, Kelas, and Subject Name
        const cleanSlug = subjName
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 8)
          .toUpperCase();
        const code = `MP-${item.jenjang.substring(0, 3).toUpperCase()}-${item.kelas}-${cleanSlug}`;

        let subj = await prisma.subject.findFirst({
          where: {
            OR: [
              { code },
              { name: subjName }
            ],
            deletedAt: null,
          },
        });

        if (!subj) {
          subj = await prisma.subject.create({
            data: {
              code,
              name: subjName,
              subjectType: "MAPEL",
            },
          });
          syncedSubjectCount++;
        }

        // Link in CurriculumSubject if not already linked
        const existingLink = await prisma.curriculumSubject.findFirst({
          where: {
            curriculumId: curr.id,
            subjectId: subj.id,
          },
        });

        if (!existingLink) {
          await prisma.curriculumSubject.create({
            data: {
              curriculumId: curr.id,
              subjectId: subj.id,
              orderNumber: order,
            },
          });
        }
        order++;
      }
    }

    return NextResponse.json({
      status: "Success",
      message: `Sinkronisasi Kurikulum Resmi berhasil! (${syncedSubjectCount} Mapel Baru, ${syncedCurriculumCount} Kurikulum Baru)`,
      data: { syncedSubjectCount, syncedCurriculumCount },
    });
  } catch (err: any) {
    console.error("CURRICULUM_SYNC_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
