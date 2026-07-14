import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

// 1. MASTER MATA PELAJARAN (Global Pool)
export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(), // Cth: "MP-FQH-01"
  name: text("name").notNull(), // Cth: "Fath al-Mubin"
  subjectType: text("subject_type", { enum: ["MAPEL", "NON_MAPEL"] }).default("NON_MAPEL"),
  isActive: integer("is_active", { mode: "boolean" }).default(true), // Soft Delete Mutlak
});

// 2. MASTER KURIKULUM (Wadah Silabus)
export const curriculums = sqliteTable("curriculums", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // Cth: "Kurikulum Pesantren 2026"
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

// 3. PEMETAAN SILABUS (Curriculum Subjects Mapping)
export const curriculumSubjects = sqliteTable("curriculum_subjects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  curriculumId: text("curriculum_id").notNull().references(() => curriculums.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").notNull().references(() => subjects.id, { onDelete: "restrict" }), // ANTI HAPUS
  institutionLevel: text("institution_level").notNull(), // Enum: Ibtida'iyyah, Tsanawiyyah, dll
  classLevel: text("class_level").notNull(), // Enum: I, II, III, dll
}, (table) => ({
  uniqueMapping: uniqueIndex("unique_curriculum_mapping").on(
    table.curriculumId, table.subjectId, table.institutionLevel, table.classLevel
  ),
}));
