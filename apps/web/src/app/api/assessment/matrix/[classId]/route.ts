import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(req.url);
    const kwartal = parseInt(searchParams.get("kwartal") || "1", 10);

    const classData = await prisma.academicClass.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      return NextResponse.json(
        { status: "Error", message: "Class not found" },
        { status: 404 }
      );
    }

    let classSubjects: any[] = [];
    if (classData.curriculumId) {
      const currSubjects = await prisma.curriculumSubject.findMany({
        where: { curriculumId: classData.curriculumId },
        orderBy: { orderNumber: "asc" },
      });
      const subjectIds = currSubjects.map((cs) => cs.subjectId);
      classSubjects = await prisma.subject.findMany({
        where: { id: { in: subjectIds }, deletedAt: null },
      });
    } else {
      classSubjects = await prisma.subject.findMany({
        where: { deletedAt: null },
        take: 20,
      });
    }

    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId, status: "ACTIVE", deletedAt: null },
    });

    const studentIds = enrollments.map((e) => e.studentId);
    const studentProfiles = await prisma.studentProfile.findMany({
      where: { id: { in: studentIds }, deletedAt: null },
      include: { person: true },
    });

    const scores = await prisma.studentScore.findMany({
      where: { classId, kwartal },
    });

    const SACRED_NAMES = ["al-qur'an", "khoth", "imla", "qiro'ah", "muhafadhoh", "akhlaq"];

    const studentsWithScores = studentProfiles.map((student) => {
      const studentScores = scores.filter((s) => s.studentId === student.id);
      const scoreMap: Record<string, number> = {};

      let totalScoreForRanking = 0;
      let rankingSubjectCount = 0;

      classSubjects.forEach((sub) => {
        const matchingScore = studentScores.find((s) => s.subjectId === sub.id);
        if (matchingScore) {
          scoreMap[sub.id] = matchingScore.score;

          const isSacred =
            sub.subjectType === "NON_MAPEL" ||
            SACRED_NAMES.some((name) => sub.name.toLowerCase().includes(name));

          if (!isSacred) {
            totalScoreForRanking += matchingScore.score;
            rankingSubjectCount += 1;
          }
        }
      });

      const average =
        rankingSubjectCount > 0
          ? parseFloat((totalScoreForRanking / rankingSubjectCount).toFixed(2))
          : 0;

      return {
        id: student.id,
        name: student.person.fullName,
        nis: student.nis,
        stambuk: student.stambukNumber,
        scores: scoreMap,
        average,
      };
    });

    const sorted = [...studentsWithScores].sort((a, b) => b.average - a.average);
    const rankedMap: Record<string, number> = {};
    sorted.forEach((item, index) => {
      rankedMap[item.id] = index + 1;
    });

    const finalStudents = studentsWithScores.map((s) => ({
      ...s,
      rank: rankedMap[s.id] || 0,
    }));

    return NextResponse.json({
      status: "Success",
      data: {
        subjects: classSubjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          type: s.subjectType,
        })),
        students: finalStudents,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
