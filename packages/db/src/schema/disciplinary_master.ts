import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================================
// 1. VIOLATION CATEGORIES (7 Kategori Resmi)
// ============================================================
// Kategori resmi yang disetujui: Adab, Ibadah, Administrasi,
// Perizinan, Kebersihan, Asrama, Keamanan.
// Administrator hanya bisa menonaktifkan, TIDAK BOLEH menghapus.
export const violationCategories = pgTable("violation_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(), // Cth: "Adab", "Ibadah"
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").default(true), // Soft Delete Mutlak
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ============================================================
// 2. VIOLATION SEVERITIES (4 Tingkat Keparahan)
// ============================================================
// Hierarki mutlak: Ringan → Sedang → Berat → Sangat Berat
// Setiap severity memiliki badgeColor untuk UI Pill Badge.
export const violationSeverities = pgTable("violation_severities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(), // Cth: "Ringan", "Sangat Berat"
  level: integer("level").notNull().unique(), // 1=Ringan, 2=Sedang, 3=Berat, 4=Sangat Berat
  badgeColor: text("badge_color").notNull(), // Cth: "#22c55e" (hijau), "#ef4444" (merah)
  description: text("description"),
  isActive: boolean("is_active").default(true), // Soft Delete Mutlak
  createdAt: timestamp("created_at").default(sql`now()`),
});
