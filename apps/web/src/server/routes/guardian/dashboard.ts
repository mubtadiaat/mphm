import { Hono } from "hono";
import { createDb, studentProfiles, guardianProfiles, people, studentScores, subjects, attendanceRecords, studentViolations } from "@mphm/db";
import { eq, and, sql, count, inArray } from "drizzle-orm";
import type { AppEnv } from "../../types";
import { requireRole, requireDataScope } from "../../middlewares/rbacMiddleware";
import { PeopleService } from "../../services/people.service";

const guardianPortal = new Hono<AppEnv>();

guardianPortal.use("*", requireRole(["Wali Santri"]), requireDataScope("GUARDIAN"));

// ============================================================
// 1. GET ALL CHILDREN CONNECTED VIA KK MAPPING
// ============================================================
guardianPortal.get("/children", async (c) => {
  const user = c.get("user");
  const db = createDb();

  if (!user.familyCardNumber) {
    return c.json({ status: "Error", message: "Nomor KK tidak terikat pada akun Anda." }, 400);
  }

  const result = await db.execute(sql`
    SELECT 
      sp.id as id,
      p.full_name as name,
      sp.stambuk_number as stambuk,
      ac.full_name as class,
      sp.nis as nis,
      sp.nisn as nisn,
      sp.enrollment_year as enrollmentYear,
      sp.status as status
    FROM student_profiles sp
    INNER JOIN people p ON sp.person_id = p.id
    INNER JOIN guardian_profiles gp ON gp.family_card_number = ${user.familyCardNumber}
    LEFT JOIN class_enrollments ce ON ce.student_id = sp.id AND ce.status = 'ACTIVE'
    LEFT JOIN academic_classes ac ON ce.class_id = ac.id
    WHERE sp.status = 'ACTIVE'
  `);
  
  return c.json({ status: "Success", data: (result as any).rows || [] });
});

// ============================================================
// STATS OVERVIEW
// ============================================================
guardianPortal.get("/stats", async (c) => {
  const user = c.get("user");
  const db = createDb();

  if (!user.familyCardNumber) {
    return c.json({ status: "Error", message: "Nomor KK tidak terikat pada akun Anda." }, 400);
  }

  // 1. Get all active children connected
  const childrenResult = await db.execute(sql`
    SELECT sp.id as studentId
    FROM guardian_profiles gp
    INNER JOIN people p ON gp.person_id = p.id
    INNER JOIN student_profiles sp ON sp.person_id = p.id
    WHERE gp.family_card_number = ${user.familyCardNumber}
      AND sp.status = 'ACTIVE'
  `);
  const childrenIds = (childrenResult?.rows || []).map((r: any) => r.studentId as string);
  
  if (childrenIds.length === 0) {
    return c.json({ 
      status: "Success", 
      data: { totalChildren: 0, totalViolations: 0, averageAttendance: 100 } 
    });
  }

  // 2. Count total violations for all children in 1 query (optimized)
  const vRes = await db
    .select({ count: count(studentViolations.id) })
    .from(studentViolations)
    .where(inArray(studentViolations.studentId, childrenIds))
    .then((res: any) => res[0]);
  const totalViolations = vRes?.count || 0;

  // 3. Calculate average attendance for all children in 1 query (optimized)
  const aRes = await db
    .select({
      sick: sql<number>`sum(sick_days)`,
      excused: sql<number>`sum(excused_days)`,
      unexcused: sql<number>`sum(unexcused_days)`,
      totalMonths: sql<number>`count(*)`
    })
    .from(attendanceRecords)
    .where(inArray(attendanceRecords.studentId, childrenIds))
    .then((res: any) => res[0]);
      
  const totalPossibleDays = (aRes?.totalMonths || 0) * 30; // Approx 30 days per month
  const totalAbsences = (aRes?.sick || 0) + (aRes?.excused || 0) + (aRes?.unexcused || 0);
  const presentAtt = Math.max(0, totalPossibleDays - totalAbsences);
  const totalAtt = totalPossibleDays;
  
  const averageAttendance = totalAtt > 0 ? parseFloat(((presentAtt / totalAtt) * 100).toFixed(1)) : 100;

  return c.json({
    status: "Success",
    data: {
      totalChildren: childrenIds.length,
      totalViolations,
      averageAttendance,
    }
  });
});

// ============================================================
// 2. GET CHILD PROFILE 360 (ONLY IF KK MATCHES)
// ============================================================
guardianPortal.get("/children/:studentId", async (c) => {
  const studentId = c.req.param("studentId");
  if (!studentId) return c.json({ status: "Error", message: "studentId is required" }, 400);
  
  const user = c.get("user");
  const db = createDb();

  // 1. Validasi kepemilikan KK: Pastikan studentId yang diminta berelasi dengan KK wali
  const verifyRelation = await db
    .select()
    .from(studentProfiles)
    .innerJoin(people, eq(studentProfiles.personId, people.id))
    .innerJoin(guardianProfiles, eq(guardianProfiles.personId, people.id))
    .where(
      and(
        eq(studentProfiles.id, studentId),
        eq(guardianProfiles.familyCardNumber, user.familyCardNumber!)
      )
    )
    .then((res: any) => res[0]);

  if (!verifyRelation) {
    return c.json({ status: "Error", message: "Akses ditolak. Santri ini tidak terdaftar di bawah KK Anda." }, 403);
  }

  // 2. Tarik profile 360
  const peopleService = new PeopleService(db);
  const profile360 = await peopleService.getPerson360(verifyRelation.student_profiles.personId);

  return c.json({ status: "Success", data: profile360 });
});

// ============================================================
// 3. GET CHILD ACADEMIC DETAILS
// ============================================================
guardianPortal.get("/children/:studentId/academic", async (c) => {
  const studentId = c.req.param("studentId");
  if (!studentId) return c.json({ status: "Error", message: "studentId is required" }, 400);

  const user = c.get("user");
  const db = createDb();

  // 1. Validasi kepemilikan KK
  const verifyRelation = await db
    .select()
    .from(studentProfiles)
    .innerJoin(people, eq(studentProfiles.personId, people.id))
    .innerJoin(guardianProfiles, eq(guardianProfiles.personId, people.id))
    .where(
      and(
        eq(studentProfiles.id, studentId),
        eq(guardianProfiles.familyCardNumber, user.familyCardNumber!)
      )
    )
    .then((res: any) => res[0]);

  if (!verifyRelation) {
    return c.json({ status: "Error", message: "Akses ditolak. Santri ini tidak terdaftar di bawah KK Anda." }, 403);
  }

  // 2. Tarik nilai
  const grades = await db
    .select({
      subject: subjects.name,
      score: studentScores.score,
      type: subjects.subjectType,
    })
    .from(studentScores)
    .innerJoin(subjects, eq(studentScores.subjectId, subjects.id))
    .where(eq(studentScores.studentId, studentId))
    ;

  // 3. Tarik statistik absensi
  const attendanceRes = await db
    .select({
      sick: sql<number>`sum(sick_days)`,
      excused: sql<number>`sum(excused_days)`,
      unexcused: sql<number>`sum(unexcused_days)`,
      totalMonths: sql<number>`count(*)`
    })
    .from(attendanceRecords)
    .where(eq(attendanceRecords.studentId, studentId))
    .then((res: any) => res[0]);

  const studentPossibleDays = (attendanceRes?.totalMonths || 0) * 30;
  const sakit = attendanceRes?.sick || 0;
  const izin = attendanceRes?.excused || 0;
  const alfa = attendanceRes?.unexcused || 0;
  const studentAbsences = sakit + izin + alfa;
  const studentPresent = Math.max(0, studentPossibleDays - studentAbsences);
  const attendanceRate = studentPossibleDays > 0 ? parseFloat(((studentPresent / studentPossibleDays) * 100).toFixed(1)) : 100.0;

  // 4. Tarik pelanggaran
  const violationsRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(studentViolations)
    .where(eq(studentViolations.studentId, studentId))
    .then((res: any) => res[0]);
  const violationsCount = violationsRes?.count || 0;

  return c.json({
    status: "Success",
    data: {
      grades,
      attendanceRate,
      sakit,
      izin,
      alfa,
      violationsCount,
      predikatAkhlaq: violationsCount > 2 ? "Jayyid Tsani" : "Jayyid Awwal"
    }
  });
});

export default guardianPortal;
