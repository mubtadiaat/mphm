import { Hono } from "hono";
import { createDb, classEnrollments, studentProfiles, studentScores, studentViolations, subjects, academicClasses, academicYears } from "@mphm/db";
import { eq, and, avg, count } from "drizzle-orm";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";

const mustahiqDashboard = new Hono<AppEnv>();

mustahiqDashboard.get("/stats", requireRole(["Mustahiq"]), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user");

  if (!user.assignedClassId) {
    return c.json({
      status: "Success",
      data: {
        totalSantri: 0,
        averageGpa: 0,
        totalViolations: 0,
      }
    });
  }

  // Cari active academic year
  const activeYear = await db
    .select({ id: academicYears.id })
    .from(academicYears)
    .where(eq(academicYears.isActive, true))
    .get();

  const targetYearId = activeYear?.id || "";

  // 1. Total Santri in the assigned class
  const santriData = await db
    .select({ count: count(classEnrollments.id) })
    .from(classEnrollments)
    .innerJoin(studentProfiles, eq(classEnrollments.studentId, studentProfiles.id))
    .where(
      and(
        eq(classEnrollments.classId, user.assignedClassId),
        eq(classEnrollments.status, "ACTIVE"),
        eq(studentProfiles.status, "ACTIVE")
      )
    )
    .get();

  // 2. Average GPA in the assigned class (only NON_MAPEL subjects)
  const gpaData = await db
    .select({ average: avg(studentScores.score) })
    .from(studentScores)
    .innerJoin(subjects, eq(studentScores.subjectId, subjects.id))
    .where(
      and(
        eq(studentScores.classId, user.assignedClassId),
        eq(subjects.subjectType, "NON_MAPEL")
      )
    )
    .get();

  // 3. Total violations by students in this class this year
  const violationData = await db
    .select({ count: count(studentViolations.id) })
    .from(studentViolations)
    .innerJoin(classEnrollments, eq(studentViolations.studentId, classEnrollments.studentId))
    .where(
      and(
        eq(classEnrollments.classId, user.assignedClassId),
        eq(classEnrollments.status, "ACTIVE"),
        eq(studentViolations.academicYearId, targetYearId)
      )
    )
    .get();

  return c.json({
    status: "Success",
    data: {
      totalSantri: santriData?.count || 0,
      averageGpa: Math.round((Number(gpaData?.average || 0)) * 100) / 100,
      totalViolations: violationData?.count || 0,
    }
  });
});

export default mustahiqDashboard;
