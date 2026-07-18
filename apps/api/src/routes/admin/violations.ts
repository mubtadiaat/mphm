import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, violationTypes, violationCategories, violationSeverities } from "@mphm/db";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";

const violationsAdmin = new Hono<AppEnv>();

violationsAdmin.post("*", requireRole(["Sekretariat"]));
violationsAdmin.delete("*", requireRole(["Sekretariat"]));
violationsAdmin.get("*", requireRole(["Sekretariat", "Mustahiq", "Mufattisy", "Mundzir", "Petugas Keamanan"]));

const createCategorySchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

const createSeveritySchema = z.object({
  name: z.string().min(3),
  level: z.number().int().positive(),
  badgeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Format warna hexadecimal (cth: #ef4444)"),
  description: z.string().optional(),
});

const createTypeSchema = z.object({
  categoryId: z.string().uuid(),
  severityId: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().optional(),
  points: z.number().int().nonnegative().optional(),
});

// ============================================================
// 1. VIOLATION CATEGORIES
// ============================================================
violationsAdmin.post("/categories", zValidator("json", createCategorySchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb(c.env.DB);

  const cat = await db
    .insert(violationCategories)
    .values({
      name: data.name,
      description: data.description || null,
      isActive: true,
    })
    .returning()
    .get();

  return c.json({ status: "Success", data: cat });
});

violationsAdmin.get("/categories", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db.select().from(violationCategories).where(eq(violationCategories.isActive, true)).all();
  return c.json({ status: "Success", data: list });
});

// ============================================================
// 2. VIOLATION SEVERITIES
// ============================================================
violationsAdmin.post("/severities", zValidator("json", createSeveritySchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb(c.env.DB);

  const sev = await db
    .insert(violationSeverities)
    .values({
      name: data.name,
      level: data.level,
      badgeColor: data.badgeColor,
      description: data.description || null,
      isActive: true,
    })
    .returning()
    .get();

  return c.json({ status: "Success", data: sev });
});

violationsAdmin.get("/severities", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db.select().from(violationSeverities).where(eq(violationSeverities.isActive, true)).all();
  return c.json({ status: "Success", data: list });
});

// ============================================================
// 3. VIOLATION TYPES (Master Pelanggaran Dinamis)
// ============================================================
violationsAdmin.post("/types", zValidator("json", createTypeSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb(c.env.DB);

  const vType = await db
    .insert(violationTypes)
    .values({
      categoryId: data.categoryId,
      severityId: data.severityId,
      name: data.name,
      description: data.description || null,
      points: data.points ?? 0,
      isActive: true,
    })
    .returning()
    .get();

  return c.json({ status: "Success", data: vType });
});

violationsAdmin.get("/types", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db
    .select({
      id: violationTypes.id,
      name: violationTypes.name,
      category: violationCategories.name,
      severity: violationSeverities.name,
      points: violationTypes.points,
      isActive: violationTypes.isActive,
    })
    .from(violationTypes)
    .innerJoin(violationCategories, eq(violationTypes.categoryId, violationCategories.id))
    .innerJoin(violationSeverities, eq(violationTypes.severityId, violationSeverities.id))
    .where(eq(violationTypes.isActive, true))
    .all();
  return c.json({ status: "Success", data: list });
});

// SOFT DELETE ONLY - Menghapus permanen diblokir untuk menjaga riwayat tahun-tahun sebelumnya
violationsAdmin.delete("/types/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

  const db = createDb(c.env.DB);
  const updated = await db
    .update(violationTypes)
    .set({ isActive: false })
    .where(eq(violationTypes.id, id))
    .returning()
    .get();

  if (!updated) {
    return c.json({ status: "Error", message: "Jenis pelanggaran tidak ditemukan." }, 404);
  }

  return c.json({ status: "Success", message: "Jenis pelanggaran dinonaktifkan (Soft Delete)." });
});

export default violationsAdmin;
