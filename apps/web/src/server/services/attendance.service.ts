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
    // 1. Fetch all existing attendance records for this class/date/session in a single query
    const existingRecords = await this.db
      .select({ id: attendanceRecords.id, studentId: attendanceRecords.studentId })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.classId, data.classId),
          eq(attendanceRecords.date, data.date),
          eq(attendanceRecords.session, data.session)
        )
      )
      ;

    const existingMap = new Map(existingRecords.map(r => [r.studentId, r.id]));
    const batchOps = [];

    for (const record of data.records) {
      const existingId = existingMap.get(record.studentId);

      if (existingId) {
        batchOps.push(
          this.db
            .update(attendanceRecords)
            .set({
              status: record.status,
              notes: record.notes || null,
              recordedBy: data.recordedBy,
            })
            .where(eq(attendanceRecords.id, existingId))
            .returning()
        );
      } else {
        batchOps.push(
          this.db
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
        );
      }
    }

    if (batchOps.length === 0) {
      return [];
    }

    // Execute atomic batch transaction
    const results = await this.db.batch(batchOps as any);
    // Flatten result arrays from batch operation returning() statements
    return results.flat();
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
      ;

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
