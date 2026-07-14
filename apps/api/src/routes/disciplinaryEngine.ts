import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createDb, studentViolations, violationTypes, violationCategories, violationSeverities, academicHistory } from "@mphm/db";
import { eq, sql } from "drizzle-orm";
import type { AppEnv } from "../types";
import { requireRole } from "../middlewares/rbacMiddleware";

const disciplinaryEngine = new Hono<AppEnv>();

disciplinaryEngine.get("/violations", requireRole(["Sekretariat", "Mustahiq", "Mufattisy", "Mundzir", "Petugas Keamanan"]), async (c) => {
  const academicYearId = c.req.query("academicYearId") || undefined;
  const db = createDb(c.env.DB);

  const result = await db.run(sql`
    SELECT 
      sv.id as id,
      p.full_name as name,
      sp.stambuk_number as stambuk,
      ac.full_name as class,
      vt.name as desc,
      vc.name as category,
      vs.name as severity,
      sv.incident_date as date,
      sv.incident_time as time,
      sv.location as location,
      sv.description as detailDescription,
      sv.status as status
    FROM student_violations sv
    INNER JOIN student_profiles sp ON sv.student_id = sp.id
    INNER JOIN people p ON sp.person_id = p.id
    LEFT JOIN class_enrollments ce ON ce.student_id = sp.id AND ce.status = 'ACTIVE'
    LEFT JOIN academic_classes ac ON ce.class_id = ac.id
    INNER JOIN violation_types vt ON sv.violation_type_id = vt.id
    INNER JOIN violation_categories vc ON vt.category_id = vc.id
    INNER JOIN violation_severities vs ON vt.severity_id = vs.id
    ${academicYearId ? sql`WHERE sv.academic_year_id = ${academicYearId}` : sql``}
    ORDER BY sv.incident_date DESC, sv.incident_time DESC
  `);
  const list = result.results || [];
  return c.json({ status: "Success", data: list });
});

const violationSchema = z.object({
  studentId: z.string().uuid(),
  violationTypeId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  incidentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  incidentTime: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  evidenceUrl: z.string().url().optional(), // URL Cloudinary
});

const overrideSchema = z.object({
  overrideReason: z.string().min(15, "Alasan pengubahan manual minimal 15 karakter"),
  newPredikatAkhlaq: z.string()
});

// ============================================================
// 1. RECORD PELANGGARAN
// ============================================================
disciplinaryEngine.post(
  "/violations",
  requireRole(["Sekretariat", "Petugas Keamanan"]),
  zValidator("json", violationSchema),
  async (c) => {
    const data = c.req.valid("json");
    const user = c.get("user");
    const db = createDb(c.env.DB);

    // Get the violation type to check severity points or tier shifting
    const vType = await db
      .select()
      .from(violationTypes)
      .where(eq(violationTypes.id, data.violationTypeId))
      .get();

    if (!vType) {
      return c.json({ status: "Error", message: "Jenis pelanggaran tidak ditemukan." }, 400);
    }

    const recorded = await db.insert(studentViolations).values({
      academicYearId: data.academicYearId,
      studentId: data.studentId,
      violationTypeId: data.violationTypeId,
      incidentDate: data.incidentDate,
      incidentTime: data.incidentTime || null,
      location: data.location || null,
      description: data.description || null,
      evidenceUrl: data.evidenceUrl || null,
      reportedBy: user.userId,
      status: "RECORDED",
    }).returning().get();

    return c.json({ 
      status: "Success", 
      message: "Pelanggaran berhasil direkam", 
      data: recorded 
    });
});

// ============================================================
// 2. OVERRIDE PREDIKAT AKHLAQ (Trap Guard)
// ============================================================
disciplinaryEngine.put(
  "/akhlaq-override/:studentId",
  requireRole(["Mustahiq", "Sekretariat"]),
  zValidator("json", overrideSchema),
  async (c) => {
    const studentId = c.req.param("studentId");
    if (!studentId) {
      return c.json({ status: "Error", message: "studentId is required" }, 400);
    }
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Ambil record history akademik terbaru untuk disunting
    const latestHistory = await db
      .select()
      .from(academicHistory)
      .where(eq(academicHistory.studentId, studentId))
      .get(); // Dapatkan satu record paling atas atau gunakan sorting jika diperlukan

    if (!latestHistory) {
      return c.json({ status: "Error", message: "Riwayat akademik siswa tidak ditemukan untuk di-override." }, 404);
    }

    const updated = await db
      .update(academicHistory)
      .set({
        overrideReason: data.overrideReason,
        status: data.newPredikatAkhlaq as "PROMOTED" | "RETAINED" | "GRADUATED" | "KHIDMAH" | "TRANSFERRED" | "DROPPED", // Gunakan status baru sebagai penanda / disesuaikan dengan arsitektur riwayat
      })
      .where(eq(academicHistory.id, latestHistory.id))
      .returning()
      .get();

    return c.json({ 
      status: "Success", 
      message: "Override predikat akhlaq berhasil disimpan", 
      data: updated 
    });
});

export default disciplinaryEngine;
