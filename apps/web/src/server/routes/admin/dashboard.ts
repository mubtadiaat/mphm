import { Hono } from "hono";
import { createDb, studentProfiles, studentScores, subjects, attendanceRecords, studentViolations, academicClasses, academicYears, classEnrollments } from "@mphm/db";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { eq, and, sql } from "drizzle-orm";

const dashboardAdmin = new Hono<AppEnv>();

dashboardAdmin.use("*", requireRole(["Sekretariat", "Mundzir", "Mufattisy"]));

dashboardAdmin.get("/stats", async (c) => {
  const academicYearId = c.req.query("academicYearId") || undefined;
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
      status: attendanceRecords.status,
      count: sql<number>`count(*)`
    })
    .from(attendanceRecords)
    .where(eq(attendanceRecords.academicYearId, targetYearId))
    .groupBy(attendanceRecords.status)
    ;
  
  let totalAttendance = 0;
  let presentCount = 0;
  for (const row of attendanceRes) {
    totalAttendance += row.count;
    if (row.status === "HADIR" || row.status === "SAKIT" || row.status === "IZIN") {
      presentCount += row.count;
    }
  }
  const attendanceRate = totalAttendance > 0 ? parseFloat(((presentCount / totalAttendance) * 100).toFixed(1)) : 100.0;

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
