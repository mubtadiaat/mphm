import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDb, studentScores, subjects, academicClasses, curriculumSubjects, classEnrollments, studentProfiles, people } from "@mphm/db";
import type { AppEnv } from "../types";
import { requireRole, requireDataScope } from "../middlewares/rbacMiddleware";
import { GradeService } from "../services/grade.service";

const assessmentEngine = new Hono<AppEnv>();

// ============================================================
// SCORE INPUT SCHEMA
// ============================================================
// PERBAIKAN SACRED GUARD: isSacred TIDAK lagi dikirim dari frontend.
// subjectType diambil dari database subjects.subjectType.
const scoreSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  kwartal: z.number().min(1).max(4),
  score: z.number().min(0).max(10),
});

// ============================================================
// 1. INPUT NILAI OLEH WALI KELAS (MUSTAHIQ)
// ============================================================
assessmentEngine.post(
  "/scores/:classId",
  requireRole(["Mustahiq", "Sekretariat"]),
  requireDataScope("CLASS"),
  zValidator("json", scoreSchema),
  async (c) => {
    const classId = c.req.param("classId");
    if (!classId) {
      return c.json({ status: "Error", message: "classId is required" }, 400);
    }
    const data = c.req.valid("json");
    const db = createDb();
    const gradeService = new GradeService(db);

    try {
      const result = await gradeService.saveScore({
        classId,
        studentId: data.studentId,
        subjectId: data.subjectId,
        kwartal: data.kwartal,
        score: data.score,
      });

      return c.json({
        status: "Success",
        message: "Nilai berhasil disimpan",
        data: result,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan nilai.";
      return c.json(
        { status: "Validation Error", message, field: "score" },
        400
      );
    }
  }
);

// ============================================================
// ============================================================
// 2. AMBIL NILAI PER KELAS PER KWARTAL (SCORE DATA ONLY)
// ============================================================
assessmentEngine.get(
  "/scores/:classId",
  requireRole(["Mustahiq", "Mufattisy", "Sekretariat", "Mundzir"]),
  requireDataScope("CLASS"),
  async (c) => {
    const classId = c.req.param("classId");
    if (!classId) {
      return c.json({ status: "Error", message: "classId is required" }, 400);
    }
    const kwartal = c.req.query("kwartal");
    const db = createDb();

    let query = db
      .select()
      .from(studentScores)
      .where(eq(studentScores.classId, classId));

    const scores = kwartal
      ? await db
          .select()
          .from(studentScores)
          .where(
            and(
              eq(studentScores.classId, classId),
              eq(studentScores.kwartal, parseInt(kwartal))
            )
          )
          
      : await query;

    return c.json({ status: "Success", data: scores });
  }
);

// ============================================================
// 3. MATRIX NILAI KELAS (SISWA + MAPEL + NILAI)
// ============================================================
assessmentEngine.get(
  "/matrix/:classId",
  requireRole(["Mustahiq", "Mufattisy", "Sekretariat", "Mundzir"]),
  requireDataScope("CLASS"),
  async (c) => {
    const classId = c.req.param("classId");
    if (!classId) {
      return c.json({ status: "Error", message: "classId is required" }, 400);
    }
    const kwartal = parseInt(c.req.query("kwartal") || "1", 10);
    const db = createDb();

    // Get Class Data for Curriculum
    const classData = await db
      .select({ curriculumId: academicClasses.curriculumId })
      .from(academicClasses)
      .where(eq(academicClasses.id, classId))
      .then((res: any) => res[0]);
      
    if (!classData) {
      return c.json({ status: "Error", message: "Class not found" }, 404);
    }

    // A. Ambil Daftar Mata Pelajaran untuk Kelas Ini (Berdasarkan Curriculum)
    // Note: To simplify, we get curriculum subjects for this curriculumId.
    const classSubjectsRaw = await db
      .select({
        id: subjects.id,
        code: subjects.code,
        name: subjects.name,
        type: subjects.subjectType,
      })
      .from(curriculumSubjects)
      .innerJoin(subjects, eq(curriculumSubjects.subjectId, subjects.id))
      .where(eq(curriculumSubjects.curriculumId, classData.curriculumId))
      ;

    // B. Ambil Daftar Siswa (Class Enrollments)
    const enrolledStudents = await db
      .select({
        id: studentProfiles.id,
        personId: studentProfiles.personId,
        name: people.fullName,
        nis: studentProfiles.nis,
        stambuk: studentProfiles.stambukNumber,
      })
      .from(classEnrollments)
      .innerJoin(studentProfiles, eq(classEnrollments.studentId, studentProfiles.id))
      .innerJoin(people, eq(studentProfiles.personId, people.id))
      .where(eq(classEnrollments.classId, classId))
      ;

    // C. Ambil Skor Kwartal Ini
    const allScores = await db
      .select()
      .from(studentScores)
      .where(
        and(
          eq(studentScores.classId, classId),
          eq(studentScores.kwartal, kwartal)
        )
      )
      ;

    // D. Gabungkan menjadi matrix per siswa
    const matrix = enrolledStudents.map((student) => {
      const studentScoreRecords = allScores.filter(s => s.studentId === student.id);
      const scoreMap: Record<string, number> = {};
      studentScoreRecords.forEach(s => {
        scoreMap[s.subjectId] = s.score;
      });
      return {
        id: student.id,
        name: student.name,
        nis: student.nis,
        stambuk: student.stambuk,
        scores: scoreMap
      };
    });

    return c.json({
      status: "Success",
      data: {
        subjects: classSubjectsRaw,
        students: matrix
      }
    });
  }
);

export default assessmentEngine;
