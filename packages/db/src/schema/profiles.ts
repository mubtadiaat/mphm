import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { people } from "./people";

// 0. MASTER KAMAR / ASRAMA (DORMITORY ROOM)
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(), // Cth: "Kamar Al-Ghozali 01"
  buildingName: text("building_name").notNull(), // Cth: "Gedung A"
  capacity: integer("capacity").notNull().default(10),
  gender: text("gender", { enum: ["L", "P"] }).notNull(), // Asrama L/P
  supervisorId: text("supervisor_id").references(() => teacherProfiles.id, { onDelete: "set null" }), // Wali Kamar
  isActive: boolean("is_active").default(true),
  deletedAt: timestamp("deleted_at"),
});

// 1. PROFIL SANTRI
export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }), 
  stambukNumber: text("stambuk_number").notNull().unique(),
  nis: text("nis").notNull().unique(),
  nisn: text("nisn").unique(),
  enrollmentYear: integer("enrollment_year").notNull(),
  status: text("status", { enum: ["ACTIVE", "GRADUATED", "DROPPED", "BOYONG", "KHIDMAH"] }).default("ACTIVE"),
  khidmahPlacement: text("khidmah_placement"),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
  deletedAt: timestamp("deleted_at"),
});

// 2. PROFIL PENGAJAR / MUSTAHIQ
export const teacherProfiles = pgTable("teacher_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  teacherCode: text("teacher_code").notNull().unique(), // Cth: "UST-01"
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).default("ACTIVE"),
  deletedAt: timestamp("deleted_at"),
});

// 3. PROFIL WALI SANTRI (Smart Guardian Mapping)
export const guardianProfiles = pgTable("guardian_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  familyCardNumber: text("family_card_number").notNull(), // NOMOR KK
  relation: text("relation", { enum: ["AYAH", "IBU", "WALI"] }).notNull(),
  deletedAt: timestamp("deleted_at"),
});

// 4. ALUMNI RECORDS
export const alumniRecords = pgTable("alumni_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  graduationYear: integer("graduation_year").notNull(),
  deletedAt: timestamp("deleted_at"),
});

// 5. PENGURUS / YAYASAN
export const organizationMemberships = pgTable("organization_memberships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  roleName: text("role_name").notNull(), // cth: "Mufattisy", "Pimpinan"
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).default("ACTIVE"),
  supervisedLevel: text("supervised_level"), // Cth: "Tsanawiyyah", "Aliyyah"
  deletedAt: timestamp("deleted_at"),
});
