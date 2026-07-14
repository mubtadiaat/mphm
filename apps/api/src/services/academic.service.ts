import { eq, and, sql } from "drizzle-orm";
import type { Database } from "@mphm/db";
import { 
  academicYears, 
  academicClasses, 
  classEnrollments, 
  studentProfiles,
  curriculums,
  curriculumSubjects,
  subjects
} from "@mphm/db";

export class AcademicService {
  constructor(private db: Database) {}

  // ============================================================
  // CREATE CLASS WITH AUTO GENERATED NAMING & CAPACITY GUARD
  // ============================================================
  async createClass(data: {
    academicYearId: string;
    curriculumId: string;
    institutionLevel: string;
    classLevel: string;
    section: string;
    mustahiqId: string;
    capacity?: number;
  }) {
    // Auto-Generated Naming: "Tsanawiyyah I-A"
    const fullName = `${data.institutionLevel} ${data.classLevel}-${data.section}`;

    // Validasi satu Mustahiq hanya memegang 1 kelas per tahun ajaran
    const existingClassWithMustahiq = await this.db
      .select()
      .from(academicClasses)
      .where(
        and(
          eq(academicClasses.academicYearId, data.academicYearId),
          eq(academicClasses.mustahiqId, data.mustahiqId)
        )
      )
      .get();

    if (existingClassWithMustahiq) {
      throw new Error(`Mustahiq sudah ditugaskan ke kelas lain (${existingClassWithMustahiq.fullName}) di tahun ajaran ini.`);
    }

    return await this.db
      .insert(academicClasses)
      .values({
        academicYearId: data.academicYearId,
        curriculumId: data.curriculumId,
        institutionLevel: data.institutionLevel,
        classLevel: data.classLevel,
        section: data.section,
        fullName,
        mustahiqId: data.mustahiqId,
        capacity: data.capacity ?? 35,
      })
      .returning()
      .get();
  }

  // ============================================================
  // BATCH ENROLLMENT WITH CAPACITY GUARD (Dual-List Transfer)
  // ============================================================
  async enrollStudentsToClass(classId: string, studentIds: string[]) {
    const targetClass = await this.db
      .select()
      .from(academicClasses)
      .where(eq(academicClasses.id, classId))
      .get();

    if (!targetClass) {
      throw new Error("Kelas tujuan tidak ditemukan.");
    }

    // Hitung kapasitas terisi saat ini
    const currentEnrolled = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.status, "ACTIVE")
        )
      )
      .get();

    const enrolledCount = currentEnrolled?.count || 0;
    if (enrolledCount + studentIds.length > targetClass.capacity) {
      throw new Error(`Kapasitas rombel tidak mencukupi. Kapasitas maksimum: ${targetClass.capacity}, Terisi: ${enrolledCount}, Tambahan: ${studentIds.length}`);
    }

    const insertedEnrollments = [];
    for (const studentId of studentIds) {
      // Nonaktifkan enrollment aktif siswa di kelas lain pada tahun ajaran yang sama jika ada
      // Tapi untuk simplicity rombel awal kita asumsikan siswa belum punya kelas aktif lain
      const res = await this.db
        .insert(classEnrollments)
        .values({
          classId,
          studentId,
          status: "ACTIVE",
          enrolledAt: new Date(),
        })
        .returning()
        .get();
      insertedEnrollments.push(res);
    }

    return insertedEnrollments;
  }

  // ============================================================
  // CLONE ACADEMIC YEAR (Background Worker Triggered)
  // ============================================================
  async cloneAcademicYear(sourceYearId: string, targetYearName: string, startDate: string, endDate: string) {
    // 1. Buat tahun ajaran baru
    const targetYear = await this.db
      .insert(academicYears)
      .values({
        name: targetYearName,
        startDate,
        endDate,
        isActive: false,
        isClosed: false,
      })
      .returning()
      .get();

    // 2. Duplikasi kelas akademik (tanpa salin siswa)
    const sourceClasses = await this.db
      .select()
      .from(academicClasses)
      .where(eq(academicClasses.academicYearId, sourceYearId))
      .all();

    for (const sClass of sourceClasses) {
      await this.db.insert(academicClasses).values({
        academicYearId: targetYear.id,
        curriculumId: sClass.curriculumId,
        institutionLevel: sClass.institutionLevel,
        classLevel: sClass.classLevel,
        section: sClass.section,
        fullName: sClass.fullName,
        mustahiqId: sClass.mustahiqId,
        capacity: sClass.capacity,
      });
    }

    return targetYear;
  }
}
