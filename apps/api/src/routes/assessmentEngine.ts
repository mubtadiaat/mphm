import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDb, studentScores, subjects, academicClasses, curriculumSubjects, classEnrollments, studentProfiles, people } from "@mphm/db";
import type { AppEnv } from "../types";
import { requireRole, requireDataScope } from "../middlewares/rbacMiddleware";

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
    const db = createDb(c.env.DB);

    // THE SACRED GUARD — Ambil subjectType dari DATABASE, bukan frontend
    const subject = await db
      .select({ subjectType: subjects.subjectType })
      .from(subjects)
      .where(eq(subjects.id, data.subjectId))
      .get();

    if (!subject) {
      return c.json(
        { status: "Validation Error", message: "Mata pelajaran tidak ditemukan." },
        400
      );
    }

    // Validasi Sacred Guard: Mapel SAKRAL maksimal skor 8
    if (subject.subjectType === "MAPEL" && data.score > 8) {
      return c.json(
        {
          status: "Validation Error",
          message: "Nilai maksimal untuk Mapel adalah 8.",
          field: "score",
        },
        400
      );
    }

    // Upsert score (update jika sudah ada, insert jika belum)
    const existing = await db
      .select()
      .from(studentScores)
      .where(
        and(
          eq(studentScores.classId, classId),
          eq(studentScores.studentId, data.studentId),
          eq(studentScores.subjectId, data.subjectId),
          eq(studentScores.kwartal, data.kwartal)
        )
      )
      .get();

    let result;
    if (existing) {
      result = await db
        .update(studentScores)
        .set({
          score: data.score,
          updatedAt: new Date(),
        })
        .where(eq(studentScores.id, existing.id))
        .returning()
        .get();
    } else {
      result = await db
        .insert(studentScores)
        .values({
          classId,
          studentId: data.studentId,
          subjectId: data.subjectId,
          kwartal: data.kwartal,
          score: data.score,
          updatedAt: new Date(),
        })
        .returning()
        .get();
    }

    return c.json({
      status: "Success",
      message: "Nilai berhasil disimpan",
      data: result,
    });
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
    const db = createDb(c.env.DB);

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
          .all()
      : await query.all();

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
    const db = createDb(c.env.DB);

    // Get Class Data for Curriculum
    const classData = await db
      .select({ curriculumId: academicClasses.curriculumId })
      .from(academicClasses)
      .where(eq(academicClasses.id, classId))
      .get();
      
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
      .all();

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
      .all();

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
      .all();

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
