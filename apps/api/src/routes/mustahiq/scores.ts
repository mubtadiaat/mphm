import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "@mphm/db";
import { GradeService } from "../../services/grade.service";
import type { AppEnv } from "../../types";
import { requireRole, requireDataScope } from "../../middlewares/rbacMiddleware";

const scoresMustahiq = new Hono<AppEnv>();

scoresMustahiq.use("*", requireRole(["Mustahiq"]));

const saveScoreSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  kwartal: z.number().int().min(1).max(4),
  score: z.number().min(0).max(10),
});

// ============================================================
// POST /api/mustahiq/scores/:classId — INPUT NILAI DENGAN SACRED GUARD
// ============================================================
scoresMustahiq.post(
  "/:classId",
  requireDataScope("CLASS"),
  zValidator("json", saveScoreSchema),
  async (c) => {
    const classId = c.req.param("classId");
    if (!classId) return c.json({ status: "Error", message: "classId is required" }, 400);

    const data = c.req.valid("json");
    const db = createDb(c.env.DB);
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
    } catch (err: any) {
      return c.json({ status: "Error", message: err.message }, 400);
    }
  }
);

export default scoresMustahiq;
