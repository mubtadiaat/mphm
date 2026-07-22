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
    hijriMonth: string;
    hijriYear: number;
    records: { studentId: string; sickDays: number; excusedDays: number; unexcusedDays: number; notes?: string }[];
    recordedBy: string;
  }) {
    // 1. Fetch all existing attendance records for this class/date/session in a single query
    const existingRecords = await this.db
      .select({ id: attendanceRecords.id, studentId: attendanceRecords.studentId })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.classId, data.classId),
          eq(attendanceRecords.hijriMonth, data.hijriMonth),
          eq(attendanceRecords.hijriYear, data.hijriYear)
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
              sickDays: record.sickDays,
              excusedDays: record.excusedDays,
              unexcusedDays: record.unexcusedDays,
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
              hijriMonth: data.hijriMonth,
              hijriYear: data.hijriYear,
              sickDays: record.sickDays,
              excusedDays: record.excusedDays,
              unexcusedDays: record.unexcusedDays,
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
    const res = await this.db
      .select({
        sick: sql<number>`sum(sick_days)`,
        excused: sql<number>`sum(excused_days)`,
        unexcused: sql<number>`sum(unexcused_days)`,
        totalMonths: sql<number>`count(*)`
      })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.academicYearId, academicYearId)
        )
      )
      .then((res: any) => res[0]);

    const totalSessions = (res?.totalMonths || 0) * 30; // Approx 30 days per month
    const sakit = res?.sick || 0;
    const izin = res?.excused || 0;
    const alfa = res?.unexcused || 0;
    const hadir = Math.max(0, totalSessions - (sakit + izin + alfa));
    const attendanceRate = totalSessions > 0 ? parseFloat((hadir / totalSessions).toFixed(4)) : 1.0;

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
