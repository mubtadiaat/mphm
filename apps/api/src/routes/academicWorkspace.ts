import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDb, academicYears, academicClasses } from "@mphm/db";
import type { AppEnv } from "../types";
import { requireRole } from "../middlewares/rbacMiddleware";

const academicWorkspace = new Hono<AppEnv>();

// ============================================================
// 1. BUAT TAHUN AJARAN BARU (KHUSUS SEKRETARIAT)
// ============================================================
const createYearSchema = z.object({
  name: z.string().min(3, "Nama tahun ajaran minimal 3 karakter"), // Cth: "2025/2026"
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
});

academicWorkspace.post(
  "/years",
  requireRole(["Sekretariat"]),
  zValidator("json", createYearSchema),
  async (c) => {
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);

    const newYear = await db
      .insert(academicYears)
      .values({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: false, // Belum aktif sampai diaktifkan manual
        isClosed: false,
      })
      .returning()
      .get();

    return c.json({
      status: "Success",
      message: "Tahun Ajaran berhasil dibuat",
      data: newYear,
    });
  }
);

// ============================================================
// 2. DAPATKAN SEMUA TAHUN AJARAN
// ============================================================
academicWorkspace.get("/years", async (c) => {
  const db = createDb(c.env.DB);
  const years = await db.select().from(academicYears).all();
  return c.json({ status: "Success", data: years });
});

// ============================================================
// 3. DAPATKAN KELAS AKTIF (Filter by Tahun Ajaran)
// ============================================================
academicWorkspace.get("/classes/:academicYearId", async (c) => {
  const academicYearId = c.req.param("academicYearId");
  if (!academicYearId) {
    return c.json({ status: "Error", message: "academicYearId is required" }, 400);
  }
  const db = createDb(c.env.DB);

  const classes = await db
    .select()
    .from(academicClasses)
    .where(eq(academicClasses.academicYearId, academicYearId))
    .all();

  return c.json({ status: "Success", data: classes });
});

// ============================================================
// 4. AKTIFKAN TAHUN AJARAN
// ============================================================
academicWorkspace.put(
  "/years/:id/activate",
  requireRole(["Sekretariat"]),
  async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ status: "Error", message: "id is required" }, 400);
    }
    const db = createDb(c.env.DB);

    // Nonaktifkan semua tahun ajaran lain
    await db
      .update(academicYears)
      .set({ isActive: false });

    // Aktifkan yang dipilih
    const updated = await db
      .update(academicYears)
      .set({ isActive: true })
      .where(eq(academicYears.id, id))
      .returning()
      .get();

    if (!updated) {
      return c.json({ status: "Error", message: "Tahun Ajaran tidak ditemukan" }, 404);
    }

    return c.json({
      status: "Success",
      message: "Tahun Ajaran diaktifkan",
      data: updated,
    });
  }
);

// ============================================================
// 5. NONAKTIFKAN TAHUN AJARAN
// ============================================================
academicWorkspace.put(
  "/years/:id/deactivate",
  requireRole(["Sekretariat"]),
  async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ status: "Error", message: "id is required" }, 400);
    }
    const db = createDb(c.env.DB);

    const updated = await db
      .update(academicYears)
      .set({ isActive: false })
      .where(eq(academicYears.id, id))
      .returning()
      .get();

    if (!updated) {
      return c.json({ status: "Error", message: "Tahun Ajaran tidak ditemukan" }, 404);
    }

    return c.json({
      status: "Success",
      message: "Tahun Ajaran dinonaktifkan",
      data: updated,
    });
  }
);

// ============================================================
// 6. EDIT TAHUN AJARAN
// ============================================================
academicWorkspace.put(
  "/years/:id",
  requireRole(["Sekretariat"]),
  zValidator("json", createYearSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    if (!id) {
      return c.json({ status: "Error", message: "id is required" }, 400);
    }
    const db = createDb(c.env.DB);

    const updated = await db
      .update(academicYears)
      .set({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      })
      .where(eq(academicYears.id, id))
      .returning()
      .get();

    if (!updated) {
      return c.json({ status: "Error", message: "Tahun Ajaran tidak ditemukan" }, 404);
    }

    return c.json({
      status: "Success",
      message: "Tahun Ajaran berhasil diubah",
      data: updated,
    });
  }
);

export default academicWorkspace;
