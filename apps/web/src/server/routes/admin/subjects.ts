import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, subjects, curriculums, curriculumSubjects } from "@mphm/db";
import { eq, and } from "drizzle-orm";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";

const subjectsAdmin = new Hono<AppEnv>();

subjectsAdmin.use("*", requireRole(["Sekretariat"]));

const createSubjectSchema = z.object({
  code: z.string().min(3, "Kode mapel minimal 3 karakter"),
  name: z.string().min(3, "Nama mapel minimal 3 karakter"),
  subjectType: z.enum(["MAPEL", "NON_MAPEL"]).optional(),
});

const createCurriculumSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

const batchCurriculumSubjectsSchema = z.object({
  mappings: z.array(z.object({
    subjectId: z.string().uuid(),
    institutionLevel: z.string(),
    classLevel: z.string(),
  }))
});

// ============================================================
// 1. CRUD SUBJECTS (Master Mata Pelajaran)
// ============================================================
subjectsAdmin.post("/", zValidator("json", createSubjectSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb();

  const sub = await db
    .insert(subjects)
    .values({
      code: data.code,
      name: data.name,
      subjectType: data.subjectType ?? "NON_MAPEL",
      isActive: true,
    })
    .returning()
    .then((res: any) => res[0]);

  return c.json({ status: "Success", message: "Mata pelajaran berhasil ditambahkan", data: sub });
});

subjectsAdmin.get("/", async (c) => {
  const db = createDb();
  const list = await db.select().from(subjects).where(eq(subjects.isActive, true));
  return c.json({ status: "Success", data: list });
});

// Soft Delete Mapel
subjectsAdmin.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);
  const db = createDb();

  const updated = await db
    .update(subjects)
    .set({ isActive: false })
    .where(eq(subjects.id, id))
    .returning()
    .then((res: any) => res[0]);

  if (!updated) return c.json({ status: "Error", message: "Mata pelajaran tidak ditemukan." }, 404);
  return c.json({ status: "Success", message: "Mata pelajaran dinonaktifkan." });
});

// Update Mapel
subjectsAdmin.put("/:id", zValidator("json", createSubjectSchema), async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);
  const data = c.req.valid("json");
  const db = createDb();

  const updated = await db
    .update(subjects)
    .set({
      code: data.code,
      name: data.name,
      subjectType: data.subjectType,
    })
    .where(eq(subjects.id, id))
    .returning()
    .then((res: any) => res[0]);

  if (!updated) return c.json({ status: "Error", message: "Mata pelajaran tidak ditemukan." }, 404);
  return c.json({ status: "Success", message: "Mata pelajaran berhasil diperbarui", data: updated });
});

// ============================================================
// 2. CRUD CURRICULUMS (Master Kurikulum)
// ============================================================
subjectsAdmin.post("/curriculums", zValidator("json", createCurriculumSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb();

  const cur = await db
    .insert(curriculums)
    .values({
      name: data.name,
      description: data.description || null,
      isActive: true,
    })
    .returning()
    .then((res: any) => res[0]);

  return c.json({ status: "Success", message: "Kurikulum berhasil ditambahkan", data: cur });
});

subjectsAdmin.get("/curriculums", async (c) => {
  const db = createDb();
  const list = await db.select().from(curriculums).where(eq(curriculums.isActive, true));
  return c.json({ status: "Success", data: list });
});

// ============================================================
// 3. BATCH MUTATION FOR CURRICULUM SUBJECTS (Matrix View)
// ============================================================
// PUT /api/admin/curriculums/:id/subjects
subjectsAdmin.put("/curriculums/:id/subjects", zValidator("json", batchCurriculumSubjectsSchema), async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);
  const { mappings } = c.req.valid("json");
  const db = createDb();

  // Execute atomic transaction (delete old and insert new mappings)
  const batchOps = [
    db.delete(curriculumSubjects).where(eq(curriculumSubjects.curriculumId, id))
  ];

  for (const map of mappings) {
    batchOps.push(
      db.insert(curriculumSubjects).values({
        curriculumId: id,
        subjectId: map.subjectId,
        institutionLevel: map.institutionLevel,
        classLevel: map.classLevel,
      }) as any
    );
  }

  await db.batch(batchOps as any);

  return c.json({ status: "Success", message: "Pemetaan silabus berhasil disimpan" });
});

export default subjectsAdmin;
