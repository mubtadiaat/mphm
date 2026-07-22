import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================================
// SYSTEM SETTINGS (Global Configuration & Parameters)
// ============================================================
export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(), // e.g., 'systemMaintenance', 'showMustahiqScores'
  value: text("value"), // Stored as JSON string
  updatedAt: timestamp("updated_at").default(sql`now()`),
});
