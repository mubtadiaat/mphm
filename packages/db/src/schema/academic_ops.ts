import { pgTable, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { studentProfiles, teacherProfiles } from "./profiles";
import { curriculums, subjects } from "./academic";
import { violationCategories, violationSeverities } from "./disciplinary_master";

// 1. ACADEMIC YEARS
export const academicYears = pgTable("academic_years", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // Cth: "2025/2026"
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  isClosed: boolean("is_closed").default(false), // Terkunci setelah Promotion Engine
});

// 2. ACADEMIC CLASSES
export const academicClasses = pgTable("academic_classes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  academicYearId: text("academic_year_id").notNull().references(() => academicYears.id, { onDelete: "restrict" }),
  curriculumId: text("curriculum_id").notNull().references(() => curriculums.id, { onDelete: "restrict" }),
  institutionLevel: text("institution_level").notNull(),
  classLevel: text("class_level").notNull(),
  section: text("section").notNull(), // Cth: "A", "Tahfidz"
  fullName: text("full_name").notNull(), // Generated: "Tsanawiyyah I-A"
  mustahiqId: text("mustahiq_id").notNull().references(() => teacherProfiles.id, { onDelete: "restrict" }), // 1 Wali Kelas
  capacity: integer("capacity").notNull().default(35),
  deletedAt: timestamp("deleted_at"), // Soft Delete
});

// 3. CLASS ENROLLMENTS
export const classEnrollments = pgTable("class_enrollments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  classId: text("class_id").notNull().references(() => academicClasses.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "restrict" }),
  status: text("status", { enum: ["ACTIVE", "MOVED", "DROPPED"] }).default("ACTIVE"),
  enrolledAt: timestamp("enrolled_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

// 4. STUDENT SCORES (Penilaian Kwartal)
export const studentScores = pgTable("student_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  classId: text("class_id").notNull().references(() => academicClasses.id, { onDelete: "restrict" }),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "restrict" }),
  subjectId: text("subject_id").notNull().references(() => subjects.id, { onDelete: "restrict" }),
  kwartal: integer("kwartal").notNull(), // 1, 2, 3, atau 4
  score: real("score").notNull(), // Menyimpan desimal (6.5)
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});

// 5. VIOLATION TYPES (Master Pelanggaran)
export const violationTypes = pgTable("violation_types", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").notNull().references(() => violationCategories.id, { onDelete: "restrict" }),
  severityId: text("severity_id").notNull().references(() => violationSeverities.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  description: text("description"), // Blueprint #06: atribut Deskripsi
  points: integer("points"),
  isActive: boolean("is_active").default(true), // Soft Delete Mutlak
});

// 6. STUDENT VIOLATIONS (Perekodan Insiden)
export const studentViolations = pgTable("student_violations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  academicYearId: text("academic_year_id").notNull().references(() => academicYears.id, { onDelete: "restrict" }),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "restrict" }),
  violationTypeId: text("violation_type_id").notNull().references(() => violationTypes.id, { onDelete: "restrict" }),
  incidentDate: text("incident_date").notNull(),
  incidentTime: text("incident_time"), // Blueprint #06: waktu kejadian
  location: text("location"), // Blueprint #06: lokasi insiden
  description: text("description"),
  reportedBy: text("reported_by").notNull(), // Blueprint #06: userId pelapor
  evidenceUrl: text("evidence_url"), // URL CLOUDINARY
  status: text("status").default("RECORDED"),
  createdAt: timestamp("created_at").default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

// 7. ACADEMIC HISTORY (Riwayat Immutable Kenaikan Kelas — Append-Only)
export const academicHistory = pgTable("academic_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "restrict" }),
  academicYearId: text("academic_year_id").notNull(),
  institutionLevel: text("institution_level").notNull(),
  classId: text("class_id").notNull(),
  status: text("status", {
    enum: ["PROMOTED", "RETAINED", "GRADUATED", "KHIDMAH", "TRANSFERRED", "DROPPED"]
  }).notNull(),
  promotionTransactionId: text("promotion_transaction_id"), // Blueprint #05: ID transaksi promosi batch
  overrideReason: text("override_reason"), // Alasan jika ada intervensi
  recordedAt: timestamp("recorded_at").default(sql`now()`),
});
