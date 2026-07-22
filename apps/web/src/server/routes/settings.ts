import { Hono } from "hono";
import { createDb, systemSettings } from "@mphm/db";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { requireRole } from "../middlewares/rbacMiddleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const settingsAdmin = new Hono<AppEnv>();

// GET ALL SETTINGS (Bisa diakses publik atau minimal ada token, tapi untuk Maintenance Mode lebih baik publik/bebas)
// Karena ini endpoint frontend untuk mem-fetch global UI states, kita buka agar bisa cek `systemMaintenance` tanpa login
settingsAdmin.get("/", async (c) => {
  const db = createDb();
  const rows = await db.select().from(systemSettings);
  
  const settingsObj: Record<string, any> = {};
  for (const row of rows) {
    try {
      settingsObj[row.key] = row.value ? JSON.parse(row.value) : null;
    } catch (e) {
      settingsObj[row.key] = row.value;
    }
  }

  return c.json({
    status: "Success",
    data: settingsObj
  });
});

const bulkUpdateSchema = z.record(z.string(), z.any());

// PUT (UPDATE) SETTINGS - Hanya Sekretariat
settingsAdmin.put("/", requireRole(["Sekretariat"]), zValidator("json", bulkUpdateSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb();

  // Lakukan update/insert secara iteratif
  const keys = Object.keys(data);
  for (const key of keys) {
    const stringValue = JSON.stringify(data[key]);
    
    // Upsert (Insert or Update)
    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).then((res: any) => res[0]);
    
    if (existing) {
      await db.update(systemSettings)
        .set({ value: stringValue, updatedAt: new Date() })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings)
        .values({ key, value: stringValue, updatedAt: new Date() });
    }
  }

  return c.json({
    status: "Success",
    message: "Konfigurasi sistem berhasil diperbarui.",
  });
});

export default settingsAdmin;
