import { Hono } from "hono";
import { createDb, studentViolations, violationTypes, violationCategories, violationSeverities, academicYears } from "@mphm/db";
import { eq, and, count, desc, sql } from "drizzle-orm";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";

const keamananDashboard = new Hono<AppEnv>();

keamananDashboard.get("/stats", requireRole(["Petugas Keamanan"]), async (c) => {
  const db = createDb(c.env.DB);
  
  // Cari active academic year
  const activeYear = await db
    .select({ id: academicYears.id })
    .from(academicYears)
    .where(eq(academicYears.isActive, true))
    .get();

  const targetYearId = activeYear?.id || "";

  // 1. Total violations today
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayViolationsData = await db
    .select({ count: count(studentViolations.id) })
    .from(studentViolations)
    .where(
      and(
        eq(studentViolations.academicYearId, targetYearId),
        eq(studentViolations.incidentDate, today)
      )
    )
    .get();

  // 2. Total violations this month
  const thisMonthPattern = today.substring(0, 7) + '%';
  const monthViolationsData = await db
    .select({ count: count(studentViolations.id) })
    .from(studentViolations)
    .where(
      and(
        eq(studentViolations.academicYearId, targetYearId),
        sql`incident_date LIKE ${thisMonthPattern}`
      )
    )
    .get();

  // 3. Breakdown by severity (for this year)
  const severityBreakdown = await db
    .select({
      severity: violationSeverities.name,
      count: count(studentViolations.id)
    })
    .from(studentViolations)
    .innerJoin(violationTypes, eq(studentViolations.violationTypeId, violationTypes.id))
    .innerJoin(violationSeverities, eq(violationTypes.severityId, violationSeverities.id))
    .where(eq(studentViolations.academicYearId, targetYearId))
    .groupBy(violationSeverities.name)
    .all();

  return c.json({
    status: "Success",
    data: {
      todayViolations: todayViolationsData?.count || 0,
      monthViolations: monthViolationsData?.count || 0,
      severityBreakdown: severityBreakdown || [],
    }
  });
});

export default keamananDashboard;
