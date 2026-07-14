import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, academicYears, academicHistory, classEnrollments, studentProfiles } from "@mphm/db";
import { eq, and, sql } from "drizzle-orm";
import type { AppEnv } from "../types";
import { requireRole } from "../middlewares/rbacMiddleware";

const promotionEngine = new Hono<AppEnv>();

const finalizeSchema = z.object({
  promotionCandidates: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(["PROMOTED", "RETAINED", "GRADUATED", "KHIDMAH", "TRANSFERRED", "DROPPED"]),
    overrideReason: z.string().optional()
  }))
});

// ============================================================
// 1. REKOMENDASI KENAIKAN KELAS
// ============================================================
promotionEngine.get(
  "/candidates/:classId",
  requireRole(["Mustahiq", "Mufattisy", "Sekretariat"]),
  async (c) => {
    const classId = c.req.param("classId");
    if (!classId) {
      return c.json({ status: "Error", message: "classId is required" }, 400);
    }
    const db = createDb(c.env.DB);

    // Ambil daftar santri aktif di kelas tersebut beserta rata-rata nilai dan kehadiran
    const result = await db.run(sql`
      SELECT 
        sp.id as studentId,
        sp.nis as nis,
        p.full_name as name,
        sp.stambuk_number as stambuk,
        coalesce(avg_score.score, 7.5) as averageScore,
        coalesce(att_rate.rate, 1.0) as attendanceRate,
        CASE 
          WHEN coalesce(avg_score.score, 7.5) >= 7.0 AND coalesce(att_rate.rate, 1.0) >= 0.85 THEN 'PROMOTED'
          ELSE 'RETAINED'
        END as recommendedStatus,
        'Jayyid' as akhlaqPenentu
      FROM class_enrollments ce
      INNER JOIN student_profiles sp ON ce.student_id = sp.id
      INNER JOIN people p ON sp.person_id = p.id
      LEFT JOIN (
        SELECT student_id, avg(score) as score
        FROM student_scores ss
        INNER JOIN subjects s ON ss.subject_id = s.id
        WHERE s.subject_type = 'NON_MAPEL'
        GROUP BY student_id
      ) avg_score ON avg_score.student_id = sp.id
      LEFT JOIN (
        SELECT student_id, 
               cast(sum(case when status in ('HADIR', 'SAKIT', 'IZIN') then 1 else 0 end) as float) / count(*) as rate
        FROM attendance_records
        GROUP BY student_id
      ) att_rate ON att_rate.student_id = sp.id
      WHERE ce.class_id = ${classId} AND ce.status = 'ACTIVE'
    `);

    const candidates = (result.results || []).map((row: any) => ({
      studentId: row.studentId,
      nis: row.nis,
      name: row.name,
      stambuk: row.stambuk,
      averageScore: parseFloat(Number(row.averageScore).toFixed(2)),
      attendanceRate: parseFloat(Number(row.attendanceRate).toFixed(4)),
      recommendedStatus: row.recommendedStatus,
      akhlaqPenentu: row.akhlaqPenentu
    }));

    return c.json({ status: "Success", data: candidates });
});

// ============================================================
// 2. FINALISASI & LOCK (Eksekusi Akhir Tahun)
// ============================================================
promotionEngine.post(
  "/finalize/:academicYearId",
  requireRole(["Sekretariat", "Mundzir"]),
  zValidator("json", finalizeSchema),
  async (c) => {
    const academicYearId = c.req.param("academicYearId");
    if (!academicYearId) {
      return c.json({ status: "Error", message: "academicYearId is required" }, 400);
    }
    const { promotionCandidates } = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Cek apakah tahun ajaran ini ada dan belum ditutup
    const year = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, academicYearId))
      .get();

    if (!year) {
      return c.json({ status: "Error", message: "Tahun Ajaran tidak ditemukan." }, 404);
    }

    if (year.isClosed) {
      return c.json({ status: "Error", message: "Tahun Ajaran sudah dikunci dan tidak bisa difinalisasi lagi." }, 400);
    }

    const transactionId = crypto.randomUUID();

    // Simpan history akademik dan update status santri
    for (const candidate of promotionCandidates) {
      // 1. Dapatkan kelas terakhir siswa
      const enrollment = await db
        .select({
          classId: classEnrollments.classId
        })
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.studentId, candidate.studentId),
            eq(classEnrollments.status, "ACTIVE")
          )
        )
        .get();

      const classId = enrollment?.classId || "unknown-class";

      // 2. Insert ke academic_history (Append-Only)
      await db.insert(academicHistory).values({
        studentId: candidate.studentId,
        academicYearId: academicYearId,
        institutionLevel: year.name, // atau ambil level dari kelas jika diperlukan
        classId: classId,
        status: candidate.status,
        promotionTransactionId: transactionId,
        overrideReason: candidate.overrideReason || null,
      });

      // 3. Update profil student
      await db
        .update(studentProfiles)
        .set({
          status: candidate.status === "GRADUATED" ? "GRADUATED" : 
                  candidate.status === "KHIDMAH" ? "KHIDMAH" : 
                  candidate.status === "DROPPED" ? "DROPPED" : "ACTIVE"
        })
        .where(eq(studentProfiles.id, candidate.studentId));
    }

    // Kunci Tahun Ajaran (isClosed = true)
    await db
      .update(academicYears)
      .set({ isClosed: true, isActive: false })
      .where(eq(academicYears.id, academicYearId));

    return c.json({ 
      status: "Success", 
      message: "Tahun Ajaran berhasil dikunci & proses kenaikan kelas telah dieksekusi",
      data: {
        transactionId
      }
    });
});

export default promotionEngine;
