import { pgTable, text, integer, index, uniqueIndex, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { academicYears, academicClasses } from "./academic_ops";
import { studentProfiles } from "./profiles";

// ============================================================
// ATTENDANCE RECORDS (Absensi berbasis Hissoh)
// ============================================================
// Kehadiran direkam berdasarkan 2 sesi madrasah pesantren:
// - Hissoh Ula (Sesi 1)
// - Hissoh Tsani (Sesi 2)
// Status: HADIR (default jika tidak ada record), SAKIT, IZIN, ALFA
export const attendanceRecords = pgTable("attendance_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  academicYearId: text("academic_year_id").notNull().references(() => academicYears.id, { onDelete: "restrict" }),
  classId: text("class_id").notNull().references(() => academicClasses.id, { onDelete: "restrict" }),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "restrict" }),
  date: text("date").notNull(), // Format YYYY-MM-DD
  session: text("session", { enum: ["HISSOH_ULA", "HISSOH_TSANI"] }).notNull(),
  status: text("status", { enum: ["HADIR", "SAKIT", "IZIN", "ALFA"] }).notNull().default("HADIR"),
  notes: text("notes"), // Catatan opsional (misal: keterangan sakit)
  recordedBy: text("recorded_by").notNull(), // userId yang merekam
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  // Satu siswa hanya boleh punya 1 record per tanggal per sesi
  uniqueAttendance: uniqueIndex("unique_attendance_record").on(
    table.classId, table.studentId, table.date, table.session
  ),
  dateIdx: index("attendance_date_idx").on(table.date),
  classDateIdx: index("attendance_class_date_idx").on(table.classId, table.date),
  studentIdx: index("attendance_student_idx").on(table.studentId),
  yearIdx: index("attendance_year_idx").on(table.academicYearId),
}));
