import { Hono } from "hono";
import { createDb, studentProfiles, studentScores, subjects, attendanceRecords, studentViolations, academicClasses, academicYears, classEnrollments } from "@mphm/db";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { eq, and, sql } from "drizzle-orm";

const dashboardAdmin = new Hono<AppEnv>();

dashboardAdmin.use("*", requireRole(["Sekretariat", "Mundzir", "Mufattisy"]));

dashboardAdmin.get("/stats", async (c) => {
  const academicYearId = c.req.query("academicYearId") || undefined;
  const workspace = c.req.query("workspace") || "madrasah";
  const db = createDb();

  // Resolve target academic year
  let targetYearId: string = academicYearId || "";
  if (!targetYearId) {
    const activeYear = await db
      .select({ id: academicYears.id })
      .from(academicYears)
      .where(eq(academicYears.isActive, true))
      .then((res: any) => res[0]);
    targetYearId = activeYear?.id || "";
  }

  if (workspace === "pondok") {
    // 1. Total Santri Asrama (ACTIVE in academic year AND has roomId)
    const activePondokRes = await db
      .select({ count: sql<number>`count(distinct ${classEnrollments.studentId})` })
      .from(classEnrollments)
      .innerJoin(academicClasses, eq(classEnrollments.classId, academicClasses.id))
      .innerJoin(studentProfiles, eq(classEnrollments.studentId, studentProfiles.id))
      .where(and(
        eq(academicClasses.academicYearId, targetYearId),
        eq(classEnrollments.status, "ACTIVE"),
        sql`${studentProfiles.roomId} IS NOT NULL`
      ))
      .then((res: any) => res[0]);
    const totalStudents = activePondokRes?.count || 0;

    // 2. Total Kamar Aktif
    const roomsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(sql`rooms`)
      .where(eq(sql`is_active`, true))
      .then((res: any) => res[0]);
    const totalRooms = roomsRes?.count || 0;

    // 3. Total Santri Khidmah (ACTIVE in academic year AND status KHIDMAH)
    // Wait, KHIDMAH students might not be in classEnrollments. We just count student_profiles with KHIDMAH status.
    const khidmahRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentProfiles)
      .where(eq(studentProfiles.status, "KHIDMAH"))
      .then((res: any) => res[0]);
    const totalKhidmah = khidmahRes?.count || 0;

    // 4. Active violations (maybe we can filter by type later, for now all violations)
    const violationsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentViolations)
      .where(and(
        eq(studentViolations.status, "RECORDED"),
        eq(studentViolations.academicYearId, targetYearId)
      ))
      .then((res: any) => res[0]);
    const activeViolations = violationsRes?.count || 0;

    // 5. Room distributions
    const roomDistributions = await db
      .select({
        roomName: sql<string>`r.name`,
        buildingName: sql<string>`r.building_name`,
        studentCount: sql<number>`count(distinct sp.id)`
      })
      .from(sql`rooms r`)
      .innerJoin(sql`student_profiles sp`, sql`sp.room_id = r.id`)
      .innerJoin(sql`class_enrollments ce`, sql`ce.student_id = sp.id`)
      .innerJoin(sql`academic_classes ac`, sql`ac.id = ce.class_id`)
      .where(and(
        eq(sql`ac.academic_year_id`, targetYearId),
        eq(sql`ce.status`, "ACTIVE"),
        eq(sql`sp.status`, "ACTIVE")
      ))
      .groupBy(sql`r.name`, sql`r.building_name`)
      .then((res: any) => res);

    return c.json({
      status: "Success",
      data: {
        totalStudents,
        totalRooms,
        totalKhidmah,
        activeViolations,
        roomDistributions: roomDistributions.map((r: any) => ({
          roomName: r.roomName,
          buildingName: r.buildingName,
          studentCount: Number(r.studentCount)
        }))
      }
    });
  }

  // --- MADRASAH WORKSPACE ---
  // 1. Total students for targetYearId
  const activeStudentsCountRes = await db
    .select({ count: sql<number>`count(distinct ${classEnrollments.studentId})` })
    .from(classEnrollments)
    .innerJoin(academicClasses, eq(classEnrollments.classId, academicClasses.id))
    .where(and(
      eq(academicClasses.academicYearId, targetYearId),
      eq(classEnrollments.status, "ACTIVE")
    ))
    .then((res: any) => res[0]);
  const totalStudents = activeStudentsCountRes?.count || 0;

  // 2. Average GPA (exclude SAKRAL) for targetYearId
  const averageGpaRes = await db
    .select({ avg: sql<number>`avg(score)` })
    .from(studentScores)
    .innerJoin(subjects, eq(studentScores.subjectId, subjects.id))
    .innerJoin(academicClasses, eq(studentScores.classId, academicClasses.id))
    .where(and(
      eq(subjects.subjectType, "MAPEL"),
      eq(academicClasses.academicYearId, targetYearId)
    ))
    .then((res: any) => res[0]);
  const averageGpa = averageGpaRes?.avg ? parseFloat(averageGpaRes.avg.toFixed(2)) : 0.0;

  // 3. Attendance Rate for targetYearId
  const attendanceRes = await db
    .select({
      sick: sql<number>`sum(sick_days)`,
      excused: sql<number>`sum(excused_days)`,
      unexcused: sql<number>`sum(unexcused_days)`,
      totalMonths: sql<number>`count(*)`
    })
    .from(attendanceRecords)
    .where(eq(attendanceRecords.academicYearId, targetYearId))
    .then((res: any) => res[0]);
  
  const totalPossibleDays = (attendanceRes?.totalMonths || 0) * 30; // Approx 30 days per month
  const totalAbsences = (attendanceRes?.sick || 0) + (attendanceRes?.excused || 0) + (attendanceRes?.unexcused || 0);
  const presentCount = Math.max(0, totalPossibleDays - totalAbsences);
  const attendanceRate = totalPossibleDays > 0 ? parseFloat(((presentCount / totalPossibleDays) * 100).toFixed(1)) : 100.0;

  // 4. Active violations for targetYearId
  const violationsRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(studentViolations)
    .where(and(
      eq(studentViolations.status, "RECORDED"),
      eq(studentViolations.academicYearId, targetYearId)
    ))
    .then((res: any) => res[0]);
  const activeViolations = violationsRes?.count || 0;

  // 5. Class performance (group by institution level) for targetYearId
  const performances = await db
    .select({
      level: academicClasses.institutionLevel,
      score: sql<number>`avg(${studentScores.score})`,
      active: sql<number>`count(distinct ${studentProfiles.id})`
    })
    .from(academicClasses)
    .leftJoin(classEnrollments, and(eq(classEnrollments.classId, academicClasses.id), eq(classEnrollments.status, "ACTIVE")))
    .leftJoin(studentProfiles, and(eq(classEnrollments.studentId, studentProfiles.id), eq(studentProfiles.status, "ACTIVE")))
    .leftJoin(studentScores, eq(studentScores.classId, academicClasses.id))
    .leftJoin(subjects, and(eq(studentScores.subjectId, subjects.id), eq(subjects.subjectType, "NON_MAPEL")))
    .where(eq(academicClasses.academicYearId, targetYearId))
    .groupBy(academicClasses.institutionLevel)
    ;

  const formattedPerformances = performances.map((row: any) => ({
    level: row.level,
    score: row.score ? parseFloat(Number(row.score).toFixed(2)) : 0.0,
    active: row.active || 0
  }));

  return c.json({
    status: "Success",
    data: {
      totalStudents,
      averageGpa,
      attendanceRate,
      activeViolations,
      performances: formattedPerformances
    }
  });
});

export default dashboardAdmin;
