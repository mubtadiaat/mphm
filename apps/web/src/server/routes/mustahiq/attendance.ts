import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "@mphm/db";
import { AttendanceService } from "../../services/attendance.service";
import type { AppEnv } from "../../types";
import { requireRole, requireDataScope } from "../../middlewares/rbacMiddleware";

const attendanceMustahiq = new Hono<AppEnv>();

attendanceMustahiq.use("*", requireRole(["Mustahiq"]));

const saveAttendanceSchema = z.object({
  academicYearId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  session: z.enum(["HISSOH_ULA", "HISSOH_TSANI"]),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(["HADIR", "SAKIT", "IZIN", "ALFA"]),
    notes: z.string().optional(),
  }))
});

// ============================================================
// POST /api/mustahiq/attendance/:classId — INPUT ABSENSI HISSOH
// ============================================================
attendanceMustahiq.post(
  "/:classId",
  requireDataScope("CLASS"),
  zValidator("json", saveAttendanceSchema),
  async (c) => {
    const classId = c.req.param("classId");
    if (!classId) return c.json({ status: "Error", message: "classId is required" }, 400);

    const data = c.req.valid("json");
    const user = c.get("user");
    const db = createDb();
    const attendanceService = new AttendanceService(db);

    try {
      const results = await attendanceService.saveClassAttendance({
        academicYearId: data.academicYearId,
        classId,
        date: data.date,
        session: data.session,
        records: data.records,
        recordedBy: user.userId,
      });

      return c.json({
        status: "Success",
        message: "Absensi Hissoh berhasil direkam.",
        data: results,
      });
    } catch (err: any) {
      return c.json({ status: "Error", message: err.message }, 400);
    }
  }
);

export default attendanceMustahiq;
