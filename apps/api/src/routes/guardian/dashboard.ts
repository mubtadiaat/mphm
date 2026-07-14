import { Hono } from "hono";
import { createDb, studentProfiles, guardianProfiles, people, studentScores, subjects, attendanceRecords, studentViolations } from "@mphm/db";
import { eq, and, sql, count } from "drizzle-orm";
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
  const db = createDb(c.env.DB);

  if (!user.familyCardNumber) {
    return c.json({ status: "Error", message: "Nomor KK tidak terikat pada akun Anda." }, 400);
  }

  // Smart KK Mapping: Cari semua student_profiles yang memiliki guardian_profile 
  // dengan family_card_number yang sama dengan wali yang login.
  // Logika: guardian_profiles (KK wali) → cari student_profiles yang person_id-nya 
  // juga punya guardian_profiles dengan KK yang sama (karena santri juga dicatat di KK).
  const result = await db.run(sql`
    SELECT 
      sp.id as studentId,
      sp.nis as nis,
      p.full_name as fullName,
      p.gender as gender,
      p.avatar_url as avatarUrl,
      ac.full_name as class,
      pm.full_name as mustahiq
    FROM guardian_profiles gp_child
    INNER JOIN people p ON gp_child.person_id = p.id
    INNER JOIN student_profiles sp ON sp.person_id = p.id
    LEFT JOIN class_enrollments ce ON ce.student_id = sp.id AND ce.status = 'ACTIVE'
    LEFT JOIN academic_classes ac ON ce.class_id = ac.id
    LEFT JOIN teacher_profiles tp ON ac.mustahiq_id = tp.id
    LEFT JOIN people pm ON tp.person_id = pm.id
    WHERE gp_child.family_card_number = ${user.familyCardNumber}
      AND sp.status = 'ACTIVE'
  `);
  const children = result.results || [];

  return c.json({ status: "Success", data: children });
});

// ============================================================
// 1.5 GET AGGREGATED STATS FOR DASHBOARD
// ============================================================
guardianPortal.get("/stats", async (c) => {
  const user = c.get("user");
  const db = createDb(c.env.DB);

  if (!user.familyCardNumber) {
    return c.json({ 
      status: "Success", 
      data: { totalChildren: 0, totalViolations: 0, averageAttendance: 100 } 
    });
  }

  // 1. Find all student IDs for this guardian
  const childrenResult = await db.run(sql`
    SELECT sp.id as studentId
    FROM guardian_profiles gp
    INNER JOIN people p ON gp.person_id = p.id
    INNER JOIN student_profiles sp ON sp.person_id = p.id
    WHERE gp.family_card_number = ${user.familyCardNumber}
      AND sp.status = 'ACTIVE'
  `);
  
  const childrenIds = (childrenResult.results || []).map((r: any) => r.studentId as string);
  
  if (childrenIds.length === 0) {
    return c.json({ 
      status: "Success", 
      data: { totalChildren: 0, totalViolations: 0, averageAttendance: 100 } 
    });
  }

  // 2. Count total violations for all children
  let totalViolations = 0;
  for (const id of childrenIds) {
    const vRes = await db.select({ count: count(studentViolations.id) })
      .from(studentViolations)
      .where(eq(studentViolations.studentId, id))
      .get();
    totalViolations += vRes?.count || 0;
  }

  // 3. Calculate average attendance for all children
  let totalAtt = 0;
  let presentAtt = 0;
  
  for (const id of childrenIds) {
    const aRes = await db.select({
        status: attendanceRecords.status,
        count: count(attendanceRecords.id)
      })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, id))
      .groupBy(attendanceRecords.status)
      .all();
      
    for (const row of aRes) {
      totalAtt += row.count;
      if (row.status === "HADIR" || row.status === "SAKIT" || row.status === "IZIN") {
        presentAtt += row.count;
      }
    }
  }
  
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
  const db = createDb(c.env.DB);

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
    .get();

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
  const db = createDb(c.env.DB);

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
    .get();

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
    .all();

  // 3. Tarik statistik absensi
  const attendanceRows = await db
    .select({
      status: attendanceRecords.status,
      count: sql<number>`count(*)`
    })
    .from(attendanceRecords)
    .where(eq(attendanceRecords.studentId, studentId))
    .groupBy(attendanceRecords.status)
    .all();

  let totalAtt = 0;
  let presentAtt = 0;
  let sakit = 0;
  let izin = 0;
  let alfa = 0;

  for (const row of attendanceRows) {
    totalAtt += row.count;
    if (row.status === "HADIR") presentAtt += row.count;
    if (row.status === "SAKIT") { presentAtt += row.count; sakit += row.count; }
    if (row.status === "IZIN") { presentAtt += row.count; izin += row.count; }
    if (row.status === "ALFA") { alfa += row.count; }
  }

  const attendanceRate = totalAtt > 0 ? parseFloat(((presentAtt / totalAtt) * 100).toFixed(1)) : 100.0;

  // 4. Tarik pelanggaran
  const violationsRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(studentViolations)
    .where(eq(studentViolations.studentId, studentId))
    .get();
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
