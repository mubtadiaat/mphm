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
  hijriMonth: z.string(),
  hijriYear: z.number().int().positive(),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    sickDays: z.number().int().min(0),
    excusedDays: z.number().int().min(0),
    unexcusedDays: z.number().int().min(0),
    notes: z.string().optional(),
  }))
});

// ============================================================
// POST /api/mustahiq/attendance/:classId — INPUT ABSENSI BULANAN
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
        hijriMonth: data.hijriMonth,
        hijriYear: data.hijriYear,
        records: data.records,
        recordedBy: user.userId,
      });

      return c.json({
        status: "Success",
        message: "Absensi bulanan berhasil direkam.",
        data: results,
      });
    } catch (err: any) {
      return c.json({ status: "Error", message: err.message }, 400);
    }
  }
);

export default attendanceMustahiq;
