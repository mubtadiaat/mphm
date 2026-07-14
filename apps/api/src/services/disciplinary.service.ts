import { eq, and } from "drizzle-orm";
import type { Database } from "@mphm/db";
import { studentViolations, violationTypes, violationSeverities, academicHistory } from "@mphm/db";

export class DisciplinaryService {
  constructor(private db: Database) {}

  // ============================================================
  // RECORD INCIDENT
  // ============================================================
  async recordViolation(data: {
    academicYearId: string;
    studentId: string;
    violationTypeId: string;
    incidentDate: string;
    incidentTime?: string;
    location?: string;
    description?: string;
    evidenceUrl?: string;
    reportedBy: string;
  }) {
    // 1. Dapatkan poin severity dari master
    const vType = await this.db
      .select({
        id: violationTypes.id,
        severityId: violationTypes.severityId,
        points: violationTypes.points
      })
      .from(violationTypes)
      .where(eq(violationTypes.id, data.violationTypeId))
      .get();

    if (!vType) {
      throw new Error("Jenis pelanggaran tidak ditemukan.");
    }

    // 2. Simpan insiden pelanggaran
    const violation = await this.db
      .insert(studentViolations)
      .values({
        academicYearId: data.academicYearId,
        studentId: data.studentId,
        violationTypeId: data.violationTypeId,
        incidentDate: data.incidentDate,
        incidentTime: data.incidentTime || null,
        location: data.location || null,
        description: data.description || null,
        evidenceUrl: data.evidenceUrl || null,
        reportedBy: data.reportedBy,
        status: "RECORDED",
      })
      .returning()
      .get();

    // 3. Worst-Case Tier Shifting check
    const severity = await this.db
      .select()
      .from(violationSeverities)
      .where(eq(violationSeverities.id, vType.severityId))
      .get();

    // Jika level keparahan adalah "Sangat Berat" (level 4)
    if (severity && severity.level === 4) {
      // Trigger Tier Shifting: Cari history akademik tahun ini untuk di-downgrade otomatis ke RETAINED / ditandai penalti
      const history = await this.db
        .select()
        .from(academicHistory)
        .where(
          and(
            eq(academicHistory.studentId, data.studentId),
            eq(academicHistory.academicYearId, data.academicYearId)
          )
        )
        .get();

      if (history) {
        await this.db
          .update(academicHistory)
          .set({
            status: "RETAINED", // Otomatis penalti tinggal kelas jika Sangat Berat
            overrideReason: "WORST-CASE TIER SHIFTING: Penalti otomatis pelanggaran tingkat Sangat Berat.",
          })
          .where(eq(academicHistory.id, history.id));
      }
    }

    return violation;
  }

  // ============================================================
  // OVERRIDE PREDIKAT AKHLAQ (Trap Guard)
  // ============================================================
  async overrideAkhlaq(data: {
    studentId: string;
    academicYearId: string;
    newStatus: "PROMOTED" | "RETAINED" | "GRADUATED" | "KHIDMAH" | "TRANSFERRED" | "DROPPED";
    overrideReason: string;
  }) {
    if (data.overrideReason.length < 15) {
      throw new Error("Validation Error: Alasan pengubahan manual minimal 15 karakter.");
    }

    const history = await this.db
      .select()
      .from(academicHistory)
      .where(
        and(
          eq(academicHistory.studentId, data.studentId),
          eq(academicHistory.academicYearId, data.academicYearId)
        )
      )
      .get();

    if (!history) {
      throw new Error("Riwayat akademik siswa untuk tahun ajaran aktif tidak ditemukan.");
    }

    return await this.db
      .update(academicHistory)
      .set({
        status: data.newStatus,
        overrideReason: data.overrideReason,
      })
      .where(eq(academicHistory.id, history.id))
      .returning()
      .get();
  }
}
