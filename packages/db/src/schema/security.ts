import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),          // Siapa yang mengubah
  role: text("role").notNull(),                // Peran saat bertindak
  module: text("module").notNull(),            // Nama Modul (cth: ASSESSMENT, VIOLATION)
  action: text("action").notNull(),            // POST / PUT / DELETE
  beforeData: text("before_data"),             // JSON string sebelum diubah (Null jika POST)
  afterData: text("after_data"),               // JSON string setelah diubah (Null jika DELETE)
  ipAddress: text("ip_address").notNull(),     // IP Address Request
  userAgent: text("user_agent").notNull(),     // Browser / Device User
  timestamp: timestamp("timestamp").default(sql`now()`),
});
