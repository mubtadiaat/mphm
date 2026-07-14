import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, academicClasses, teacherProfiles, people, academicYears } from "@mphm/db";
import { AcademicService } from "../../services/academic.service";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { eq, isNull, and } from "drizzle-orm";

const classesAdmin = new Hono<AppEnv>();

classesAdmin.use("*", requireRole(["Sekretariat", "Mufattisy", "Mundzir", "Mustahiq"]));

classesAdmin.get("/", async (c) => {
  const academicYearId = c.req.query("academicYearId") || undefined;
  const db = createDb(c.env.DB);

  // Resolve target academic year
  let targetYearId = academicYearId;
  if (!targetYearId) {
    const activeYear = await db
      .select({ id: academicYears.id })
      .from(academicYears)
      .where(eq(academicYears.isActive, true))
      .get();
    targetYearId = activeYear?.id || "";
  }

  const list = await db
    .select({
      id: academicClasses.id,
      name: academicClasses.fullName,
      capacity: academicClasses.capacity,
      institutionLevel: academicClasses.institutionLevel,
      classLevel: academicClasses.classLevel,
      section: academicClasses.section,
      mustahiqId: academicClasses.mustahiqId,
      mustahiq: people.fullName,
    })
    .from(academicClasses)
    .innerJoin(teacherProfiles, eq(academicClasses.mustahiqId, teacherProfiles.id))
    .innerJoin(people, eq(teacherProfiles.personId, people.id))
    .where(and(
      isNull(academicClasses.deletedAt),
      eq(academicClasses.academicYearId, targetYearId)
    ))
    .all();

  return c.json({ status: "Success", data: list });
});

const createClassSchema = z.object({
  academicYearId: z.string().uuid(),
  curriculumId: z.string().uuid(),
  institutionLevel: z.string(),
  classLevel: z.string(),
  section: z.string(),
  mustahiqId: z.string().uuid(),
  capacity: z.number().int().positive().optional(),
});

const enrollBatchSchema = z.object({
  studentIds: z.array(z.string().uuid()),
});

// ============================================================
// 1. CREATE CLASS WITH AUTO GENERATED NAMING & CAPACITY CHECK
// ============================================================
classesAdmin.post("/", zValidator("json", createClassSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb(c.env.DB);
  const academicService = new AcademicService(db);

  try {
    const cls = await academicService.createClass(data);
    return c.json({ status: "Success", message: "Kelas berhasil dibuat", data: cls });
  } catch (err: any) {
    return c.json({ status: "Error", message: err.message }, 400);
  }
});

// ============================================================
// 2. BATCH ENROLL STUDENTS TO CLASS (ROMBEL)
// ============================================================
classesAdmin.post("/:id/enroll", zValidator("json", enrollBatchSchema), async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);
  
  const { studentIds } = c.req.valid("json");
  const db = createDb(c.env.DB);
  const academicService = new AcademicService(db);

  try {
    const enrollments = await academicService.enrollStudentsToClass(id, studentIds);
    return c.json({ status: "Success", message: `${studentIds.length} siswa berhasil didaftarkan ke kelas ini.`, data: enrollments });
  } catch (err: any) {
    return c.json({ status: "Error", message: err.message }, 400);
  }
});

// ============================================================
// 3. SOFT DELETE KELAS (deletedAt)
// ============================================================
classesAdmin.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

  const db = createDb(c.env.DB);
  
  const deleted = await db
    .update(academicClasses)
    .set({ deletedAt: new Date() })
    .where(eq(academicClasses.id, id))
    .returning()
    .get();

  if (!deleted) {
    return c.json({ status: "Error", message: "Kelas tidak ditemukan" }, 404);
  }

  return c.json({ status: "Success", message: "Kelas dinonaktifkan (Soft Delete)." });
});

export default classesAdmin;
