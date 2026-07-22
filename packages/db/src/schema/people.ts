import { pgTable, text, integer, index, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const people = pgTable("people", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nik: text("nik").unique(),
  fullName: text("full_name").notNull(),
  gender: text("gender", { enum: ["L", "P"] }).notNull(),
  birthPlace: text("birth_place"),
  birthDate: text("birth_date"), // Format YYYY-MM-DD
  address: text("address"),
  phoneNumber: text("phone_number"),
  avatarUrl: text("avatar_url"), // MUTLAK URL DARI CLOUDINARY
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  nameIdx: index("name_idx").on(table.fullName), // Non-unique: 2 orang boleh nama sama
}));
