import { pgTable, text, integer, index, uniqueIndex, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { academicYears, academicClasses } from "./academic_ops";
import { studentProfiles } from "./profiles";

// ============================================================
// ATTENDANCE RECORDS (Rekap Bulanan Hijriyyah)
// ============================================================
// Kehadiran direkap di akhir bulan.
export const attendanceRecords = pgTable("attendance_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  academicYearId: text("academic_year_id").notNull().references(() => academicYears.id, { onDelete: "restrict" }),
  classId: text("class_id").notNull().references(() => academicClasses.id, { onDelete: "restrict" }),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "restrict" }),
  hijriMonth: text("hijri_month").notNull(), // Cth: "Muharram", "Safar"
  hijriYear: integer("hijri_year").notNull(), // Cth: 1447
  sickDays: integer("sick_days").notNull().default(0), // Sakit
  excusedDays: integer("excused_days").notNull().default(0), // Izin
  unexcusedDays: integer("unexcused_days").notNull().default(0), // Alfa
  notes: text("notes"), // Catatan wali kelas
  recordedBy: text("recorded_by").notNull(), // userId yang merekam
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  // Satu siswa hanya boleh punya 1 record per bulan Hijriyyah dalam 1 kelas
  uniqueAttendance: uniqueIndex("unique_attendance_record").on(
    table.classId, table.studentId, table.hijriMonth, table.hijriYear
  ),
  monthIdx: index("attendance_month_idx").on(table.hijriMonth, table.hijriYear),
  studentIdx: index("attendance_student_idx").on(table.studentId),
  yearIdx: index("attendance_year_idx").on(table.academicYearId),
}));
