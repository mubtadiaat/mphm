import { eq, and, not } from "drizzle-orm";
import type { Database } from "@mphm/db";
import { studentScores, subjects, studentProfiles } from "@mphm/db";

export class GradeService {
  constructor(private db: Database) {}

  // ============================================================
  // SAVE SCORE WITH SACRED MAPEL CHECK (Sacred Guard)
  // ============================================================
  async saveScore(data: {
    classId: string;
    studentId: string;
    subjectId: string;
    kwartal: number;
    score: number;
  }) {
    // 1. Dapatkan metadata mapel untuk verifikasi Mapel/Non-Mapel
    const subject = await this.db
      .select({ subjectType: subjects.subjectType })
      .from(subjects)
      .where(eq(subjects.id, data.subjectId))
      .get();

    if (!subject) {
      throw new Error("Mata pelajaran tidak ditemukan.");
    }

    // Sacred Guard: Max 10 untuk Mapel, Max 8 untuk Non-Mapel
    const maxAllowed = subject.subjectType === "MAPEL" ? 10 : 8;
    if (data.score > maxAllowed) {
      throw new Error(`Validation Error: Nilai maksimal untuk ${subject.subjectType === "MAPEL" ? "Mapel" : "Non-Mapel"} adalah ${maxAllowed}.`);
    }

    // Upsert logic
    const existing = await this.db
      .select()
      .from(studentScores)
      .where(
        and(
          eq(studentScores.classId, data.classId),
          eq(studentScores.studentId, data.studentId),
          eq(studentScores.subjectId, data.subjectId),
          eq(studentScores.kwartal, data.kwartal)
        )
      )
      .get();

    if (existing) {
      return await this.db
        .update(studentScores)
        .set({
          score: data.score,
          updatedAt: new Date(),
        })
        .where(eq(studentScores.id, existing.id))
        .returning()
        .get();
    } else {
      return await this.db
        .insert(studentScores)
        .values({
          classId: data.classId,
          studentId: data.studentId,
          subjectId: data.subjectId,
          kwartal: data.kwartal,
          score: data.score,
          updatedAt: new Date(),
        })
        .returning()
        .get();
    }
  }

  // ============================================================
  // RANKING COMPUTATION (Eliminating 5 Sacred Mapel)
  // ============================================================
  async computeClassRanking(classId: string, kwartal: number) {
    // 1. Ambil nilai kwartal aktif untuk kelas tersebut
    const scores = await this.db
      .select({
        studentId: studentScores.studentId,
        score: studentScores.score,
        subjectId: studentScores.subjectId,
        subjectType: subjects.subjectType
      })
      .from(studentScores)
      .innerJoin(subjects, eq(studentScores.subjectId, subjects.id))
      .where(
        and(
          eq(studentScores.classId, classId),
          eq(studentScores.kwartal, kwartal)
        )
      )
      .all();

    // 2. Kelompokkan nilai per murid dan hitung rata-rata (hanya hitung mapel non-mapel)
    const studentGradesMap: Record<string, { total: number; count: number }> = {};

    for (const row of scores) {
      if (row.subjectType === "NON_MAPEL") {
        continue; // Exclude pelajaran sakral (NON_MAPEL) dari ranking
      }

      if (!studentGradesMap[row.studentId]) {
        studentGradesMap[row.studentId] = { total: 0, count: 0 };
      }
      studentGradesMap[row.studentId].total += row.score;
      studentGradesMap[row.studentId].count += 1;
    }

    // 3. Hitung rata-rata dan urutkan
    const rankingList = Object.entries(studentGradesMap).map(([studentId, data]) => {
      const average = data.count > 0 ? parseFloat((data.total / data.count).toFixed(2)) : 0;
      return {
        studentId,
        average,
      };
    });

    // Sort descending
    rankingList.sort((a, b) => b.average - a.average);

    // Tambah rank number
    return rankingList.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }
}
