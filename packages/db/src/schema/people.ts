import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const people = sqliteTable("people", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nik: text("nik").unique(),
  fullName: text("full_name").notNull(),
  gender: text("gender", { enum: ["L", "P"] }).notNull(),
  birthPlace: text("birth_place"),
  birthDate: text("birth_date"), // Format YYYY-MM-DD
  address: text("address"),
  phoneNumber: text("phone_number"),
  avatarUrl: text("avatar_url"), // MUTLAK URL DARI CLOUDINARY
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
}, (table) => ({
  nameIdx: index("name_idx").on(table.fullName), // Non-unique: 2 orang boleh nama sama
}));
