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
    const db = createDb();

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
      .then((res: any) => res[0]);

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
  const db = createDb();
  const years = await db.select().from(academicYears);
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
  const db = createDb();

  const classes = await db
    .select()
    .from(academicClasses)
    .where(eq(academicClasses.academicYearId, academicYearId))
    ;

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
    const db = createDb();

    // Cek apakah tahun ajaran ini ada dan belum ditutup
    const year = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, id))
      .then((res: any) => res[0]);

    if (!year) {
      return c.json({ status: "Error", message: "Tahun Ajaran tidak ditemukan" }, 404);
    }

    if (year.isClosed) {
      return c.json({ status: "Error", message: "Tidak dapat mengaktifkan Tahun Ajaran yang sudah dikunci/ditutup." }, 400);
    }

    // Nonaktifkan semua tahun ajaran lain yang aktif
    await db
      .update(academicYears)
      .set({ isActive: false })
      .where(eq(academicYears.isActive, true));

    // Aktifkan yang dipilih
    const updated = await db
      .update(academicYears)
      .set({ isActive: true })
      .where(eq(academicYears.id, id))
      .returning()
      .then((res: any) => res[0]);

    if (!updated) {
      return c.json({ status: "Error", message: "Gagal mengaktifkan Tahun Ajaran" }, 500);
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
    const db = createDb();

    const updated = await db
      .update(academicYears)
      .set({ isActive: false })
      .where(eq(academicYears.id, id))
      .returning()
      .then((res: any) => res[0]);

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
    const db = createDb();

    const existing = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, id))
      .then((res: any) => res[0]);
    if (existing) {
      c.set("auditBeforeData", existing);
    }

    const updated = await db
      .update(academicYears)
      .set({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      })
      .where(eq(academicYears.id, id))
      .returning()
      .then((res: any) => res[0]);

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
