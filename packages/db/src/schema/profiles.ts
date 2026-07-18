import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { people } from "./people";

// 0. MASTER KAMAR / ASRAMA (DORMITORY ROOM)
export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(), // Cth: "Kamar Al-Ghozali 01"
  buildingName: text("building_name").notNull(), // Cth: "Gedung A"
  capacity: integer("capacity").notNull().default(10),
  gender: text("gender", { enum: ["L", "P"] }).notNull(), // Asrama L/P
  supervisorId: text("supervisor_id").references(() => teacherProfiles.id, { onDelete: "set null" }), // Wali Kamar
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// 1. PROFIL SANTRI
export const studentProfiles = sqliteTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }), 
  stambukNumber: text("stambuk_number").notNull().unique(),
  nis: text("nis").notNull().unique(),
  nisn: text("nisn").unique(),
  enrollmentYear: integer("enrollment_year").notNull(),
  status: text("status", { enum: ["ACTIVE", "GRADUATED", "DROPPED", "BOYONG", "KHIDMAH"] }).default("ACTIVE"),
  khidmahPlacement: text("khidmah_placement"),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// 2. PROFIL PENGAJAR / MUSTAHIQ
export const teacherProfiles = sqliteTable("teacher_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  teacherCode: text("teacher_code").notNull().unique(), // Cth: "UST-01"
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).default("ACTIVE"),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// 3. PROFIL WALI SANTRI (Smart Guardian Mapping)
export const guardianProfiles = sqliteTable("guardian_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  familyCardNumber: text("family_card_number").notNull(), // NOMOR KK
  relation: text("relation", { enum: ["AYAH", "IBU", "WALI"] }).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// 4. ALUMNI RECORDS
export const alumniRecords = sqliteTable("alumni_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  graduationYear: integer("graduation_year").notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// 5. PENGURUS / YAYASAN
export const organizationMemberships = sqliteTable("organization_memberships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  roleName: text("role_name").notNull(), // cth: "Mufattisy", "Pimpinan"
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).default("ACTIVE"),
  supervisedLevel: text("supervised_level"), // Cth: "Tsanawiyyah", "Aliyyah"
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});
