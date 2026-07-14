import { eq, and, sql } from "drizzle-orm";
import type { Database } from "@mphm/db";
import { attendanceRecords } from "@mphm/db";

export class AttendanceService {
  constructor(private db: Database) {}

  // ============================================================
  // RECORD ATTENDANCE FOR A CLASS (BATCH UPSERT)
  // ============================================================
  async saveClassAttendance(data: {
    academicYearId: string;
    classId: string;
    date: string; // Format YYYY-MM-DD
    session: "HISSOH_ULA" | "HISSOH_TSANI";
    records: { studentId: string; status: "HADIR" | "SAKIT" | "IZIN" | "ALFA"; notes?: string }[];
    recordedBy: string;
  }) {
    const savedRecords = [];

    for (const record of data.records) {
      // Cari record absensi yang sudah ada
      const existing = await this.db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.classId, data.classId),
            eq(attendanceRecords.studentId, record.studentId),
            eq(attendanceRecords.date, data.date),
            eq(attendanceRecords.session, data.session)
          )
        )
        .get();

      if (existing) {
        const res = await this.db
          .update(attendanceRecords)
          .set({
            status: record.status,
            notes: record.notes || null,
            recordedBy: data.recordedBy,
          })
          .where(eq(attendanceRecords.id, existing.id))
          .returning()
          .get();
        savedRecords.push(res);
      } else {
        const res = await this.db
          .insert(attendanceRecords)
          .values({
            academicYearId: data.academicYearId,
            classId: data.classId,
            studentId: record.studentId,
            date: data.date,
            session: data.session,
            status: record.status,
            notes: record.notes || null,
            recordedBy: data.recordedBy,
          })
          .returning()
          .get();
        savedRecords.push(res);
      }
    }

    return savedRecords;
  }

  // ============================================================
  // COMPUTE STUDENT ATTENDANCE STATS (Untuk Kenaikan Kelas)
  // ============================================================
  async getStudentAttendanceStats(studentId: string, academicYearId: string) {
    const records = await this.db
      .select({
        status: attendanceRecords.status
      })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.academicYearId, academicYearId)
        )
      )
      .all();

    const totalSessions = records.length;
    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alfa: 0,
        attendanceRate: 1.0 // default fully present jika belum ada record
      };
    }

    let hadir = 0, sakit = 0, izin = 0, alfa = 0;
    for (const record of records) {
      if (record.status === "HADIR") hadir++;
      else if (record.status === "SAKIT") sakit++;
      else if (record.status === "IZIN") izin++;
      else if (record.status === "ALFA") alfa++;
    }

    // Kehadiran rate = (Hadir + Sakit + Izin) / Total. Alfa dihitung absen murni.
    const attendanceRate = parseFloat(((hadir + sakit + izin) / totalSessions).toFixed(4));

    return {
      totalSessions,
      hadir,
      sakit,
      izin,
      alfa,
      attendanceRate
    };
  }
}
