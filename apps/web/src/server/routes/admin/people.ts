import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, academicYears, people, studentProfiles, teacherProfiles, guardianProfiles, organizationMemberships, alumniRecords, userAccounts } from "@mphm/db";
import { PeopleService } from "../../services/people.service";
import { deleteFromCloudinary } from "../../utils/cloudinary";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { sql, eq, isNull, and } from "drizzle-orm";

const peopleAdmin = new Hono<AppEnv>();

// Protect writing endpoints to Sekretariat only
peopleAdmin.post("*", requireRole(["Sekretariat"]));
peopleAdmin.put("*", requireRole(["Sekretariat"]));
peopleAdmin.delete("*", requireRole(["Sekretariat"]));

// Allow GET (read) endpoints for Sekretariat, Mundzir, Mufattisy, and Petugas Keamanan
peopleAdmin.get("*", requireRole(["Sekretariat", "Mundzir", "Mufattisy", "Petugas Keamanan"]));

const createPersonSchema = z.object({
  nik: z.string().optional(),
  fullName: z.string().min(1),
  gender: z.enum(["L", "P"]),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const assignProfileSchema = z.object({
  role: z.enum(["student", "teacher", "guardian", "pengurus"]),
  // Student specific
  nis: z.string().optional(),
  nisn: z.string().optional(),
  enrollmentYear: z.number().optional(),
  // Teacher specific
  teacherCode: z.string().optional(),
  // Guardian specific
  familyCardNumber: z.string().optional(),
  relation: z.enum(["AYAH", "IBU", "WALI"]).optional(),
  // Pengurus specific
  roleName: z.string().optional(),
  supervisedLevel: z.string().nullable().optional(),
});

// ============================================================
// 1. GET ALL PEOPLE (WITH PAGINATION & SEARCH)
// ============================================================
peopleAdmin.get("/", async (c) => {
  try {
  const user = c.get("user");
  const query = c.req.query("q") || undefined;
  const role = c.req.query("role") || undefined;
  const academicYearId = c.req.query("academicYearId") || undefined;
  const limit = parseInt(c.req.query("limit") || "1000"); // increase default limit for list to make sure we show all in demo
  const offset = parseInt(c.req.query("offset") || "0");
  
  const status = c.req.query("status") || undefined;
  const classFilter = c.req.query("classFilter") || undefined;
  
  const db = createDb();

  // Default filter: hanya yang belum dihapus
  let whereClause = isNull(people.deletedAt);

  if (role === "student") {
    // Resolve target academic year ID secara aman
    let targetYearId = academicYearId;
    if (!targetYearId) {
      const activeYear = await db
        .select({ id: academicYears.id })
        .from(academicYears)
        .where(eq(academicYears.isActive, true))
        .limit(1);
      targetYearId = activeYear[0]?.id;
    }

    if (!targetYearId) {
      return c.json({ data: [], total: 0 });
    }

    // Parameterized query — aman dari SQL injection
    const searchPattern = query ? `%${query}%` : null;
    let statusPattern = null;
    if (status === "aktif") statusPattern = "ACTIVE";
    else if (status === "mutasi") statusPattern = "MUTASI"; // special handling below
    else if (status === "alumni") statusPattern = "GRADUATED";
    else if (status === "khidmah") statusPattern = "KHIDMAH";

    const classPattern = classFilter ? `%${classFilter}%` : null;

    // Count Total first
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM student_profiles sp
      JOIN people p ON p.id = sp.person_id
      LEFT JOIN class_enrollments ce ON ce.student_id = sp.id AND ce.status = 'ACTIVE' AND ce.deleted_at IS NULL
      LEFT JOIN academic_classes ac ON ac.id = ce.class_id AND ac.deleted_at IS NULL
      WHERE ac.academic_year_id = ${targetYearId}
      AND p.deleted_at IS NULL
      AND sp.deleted_at IS NULL
      AND (${user?.role === "Mufattisy" ? 1 : 0} = 0 OR ac.institution_level = ${user?.supervisedLevel || ""})
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR sp.stambuk_number LIKE ${searchPattern})
      AND (
        ${statusPattern} IS NULL 
        OR (${statusPattern} = 'ACTIVE' AND sp.status = 'ACTIVE')
        OR (${statusPattern} = 'GRADUATED' AND sp.status = 'GRADUATED')
        OR (${statusPattern} = 'KHIDMAH' AND sp.status = 'KHIDMAH')
        OR (${statusPattern} = 'MUTASI' AND sp.status IN ('BOYONG', 'DROPPED'))
      )
      AND (${classPattern} IS NULL OR ac.full_name LIKE ${classPattern})
    `);
    const totalCount = (countResult[0] as { total: number })?.total || 0;

    const result = await db.execute(sql`
      SELECT 
        sp.id as id,
        p.full_name as name,
        sp.stambuk_number as stambuk,
        p.nik as nik,
        ac.full_name as class,
        pm.full_name as mustahiq,
        om.role_name as mufattisy,
        p.address as address,
        sp.status as status,
        p.gender as gender,
        p.birth_place as birthPlace,
        p.birth_date as birthDate,
        p.phone_number as phoneNumber,
        p.avatar_url as avatarUrl,
        sp.nis as nis,
        sp.nisn as nisn,
        sp.enrollment_year as enrollmentYear,
        pg.full_name as guardianName,
        pg.nik as guardianNik,
        pg.phone_number as guardianPhone,
        gpf.relation as guardianRelation,
        gpf.family_card_number as familyCardNumber
      FROM student_profiles sp
      JOIN people p ON p.id = sp.person_id
      LEFT JOIN class_enrollments ce ON ce.student_id = sp.id AND ce.status = 'ACTIVE' AND ce.deleted_at IS NULL
      LEFT JOIN academic_classes ac ON ac.id = ce.class_id AND ac.deleted_at IS NULL
      LEFT JOIN teacher_profiles tp ON tp.id = ac.mustahiq_id AND tp.deleted_at IS NULL
      LEFT JOIN people pm ON pm.id = tp.person_id AND pm.deleted_at IS NULL
      LEFT JOIN organization_memberships om ON om.person_id = pm.id AND om.deleted_at IS NULL
      LEFT JOIN guardian_profiles gps ON gps.family_card_number IN (
        SELECT family_card_number FROM guardian_profiles WHERE person_id = p.id AND deleted_at IS NULL
      ) AND gps.relation IN ('AYAH', 'IBU', 'WALI') AND gps.person_id != p.id AND gps.deleted_at IS NULL
      LEFT JOIN people pg ON pg.id = gps.person_id AND pg.deleted_at IS NULL
      LEFT JOIN guardian_profiles gpf ON gpf.person_id = gps.person_id AND gpf.deleted_at IS NULL
      WHERE ac.academic_year_id = ${targetYearId}
      AND p.deleted_at IS NULL
      AND sp.deleted_at IS NULL
      AND (${user?.role === "Mufattisy" ? 1 : 0} = 0 OR ac.institution_level = ${user?.supervisedLevel || ""})
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR sp.stambuk_number LIKE ${searchPattern})
      AND (
        ${statusPattern} IS NULL 
        OR (${statusPattern} = 'ACTIVE' AND sp.status = 'ACTIVE')
        OR (${statusPattern} = 'GRADUATED' AND sp.status = 'GRADUATED')
        OR (${statusPattern} = 'KHIDMAH' AND sp.status = 'KHIDMAH')
        OR (${statusPattern} = 'MUTASI' AND sp.status IN ('BOYONG', 'DROPPED'))
      )
      AND (${classPattern} IS NULL OR ac.full_name LIKE ${classPattern})
      LIMIT ${limit} OFFSET ${offset}
    `);
    const list = result || [];
    return c.json({ status: "Success", data: list, total: totalCount });
  }

  if (role === "teacher") {
    const searchPattern = query ? `%${query}%` : null;
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM teacher_profiles tp
      JOIN people p ON p.id = tp.person_id
      WHERE p.deleted_at IS NULL
      AND tp.deleted_at IS NULL
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR tp.teacher_code LIKE ${searchPattern})
    `);
    const totalCount = (countResult[0] as { total: number })?.total || 0;

    const result = await db.execute(sql`
      SELECT 
        tp.id as id,
        tp.person_id as personId,
        p.full_name as name,
        tp.teacher_code as teacherCode,
        p.nik as nik,
        p.phone_number as phone,
        tp.status as status,
        p.gender as gender,
        p.avatar_url as avatarUrl
      FROM teacher_profiles tp
      JOIN people p ON p.id = tp.person_id
      WHERE p.deleted_at IS NULL
      AND tp.deleted_at IS NULL
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR tp.teacher_code LIKE ${searchPattern})
      LIMIT ${limit} OFFSET ${offset}
    `);
    const list = result || [];
    return c.json({ status: "Success", data: list, total: totalCount });
  }

  if (role === "pengurus") {
    const searchPattern = query ? `%${query}%` : null;
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM organization_memberships om
      JOIN people p ON p.id = om.person_id
      WHERE p.deleted_at IS NULL
      AND om.deleted_at IS NULL
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR om.role_name LIKE ${searchPattern})
    `);
    const totalCount = (countResult[0] as { total: number })?.total || 0;

    const result = await db.execute(sql`
      SELECT 
        om.id as id,
        om.person_id as personId,
        p.full_name as name,
        om.role_name as role,
        om.supervised_level as supervisedLevel,
        p.phone_number as phone,
        om.status as status,
        p.gender as gender,
        p.avatar_url as avatarUrl
      FROM organization_memberships om
      JOIN people p ON p.id = om.person_id
      WHERE p.deleted_at IS NULL
      AND om.deleted_at IS NULL
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR om.role_name LIKE ${searchPattern})
      LIMIT ${limit} OFFSET ${offset}
    `);
    const list = result || [];
    return c.json({ status: "Success", data: list, total: totalCount });
  }

  if (role === "guardian") {
    const searchPattern = query ? `%${query}%` : null;
    
    // For guardians, we want DISTINCT family cards.
    // Count distinct family cards
    const countResult = await db.execute(sql`
      SELECT COUNT(DISTINCT gp.family_card_number) as total
      FROM guardian_profiles gp
      JOIN people p ON p.id = gp.person_id
      WHERE gp.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR gp.family_card_number LIKE ${searchPattern})
    `);
    const totalCount = (countResult[0] as { total: number })?.total || 0;

    const result = await db.execute(sql`
      SELECT 
        gp.family_card_number as familyCardNumber,
        p.full_name as guardianName,
        p.phone_number as phone,
        gp.relation as relation,
        p.nik as nik,
        COUNT(DISTINCT sp.id) as childrenCount
      FROM guardian_profiles gp
      JOIN people p ON p.id = gp.person_id
      LEFT JOIN guardian_profiles gp_child ON gp_child.family_card_number = gp.family_card_number AND gp_child.relation = 'ANAK'
      LEFT JOIN student_profiles sp ON sp.person_id = gp_child.person_id
      WHERE gp.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern} OR gp.family_card_number LIKE ${searchPattern})
      GROUP BY gp.family_card_number
      LIMIT ${limit} OFFSET ${offset}
    `);
    const list = result || [];
    return c.json({ status: "Success", data: list, total: totalCount });
  }
  
  const peopleService = new PeopleService(db);
  const list = await peopleService.listPeople(query, limit, offset);
  return c.json({ status: "Success", data: list });
  } catch (err: any) {
    console.error("PEOPLE_GET_ERROR:", err.message, err.stack);
    return c.json({ status: "Error", message: err.message }, 500);
  }
});

// ============================================================
// 1B. PUT PERSON (UPDATE DETAILS)
// ============================================================
peopleAdmin.put("/:id", zValidator("json", createPersonSchema.partial()), async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);
  const data = c.req.valid("json");
  const db = createDb();
  const peopleService = new PeopleService(db);

  // We need to map camelCase to snake_case or whatever format updatePerson accepts
  // In people.service.ts, the updatePerson accepts Partial<typeof people.$inferInsert>
  // Let's make sure updatePerson works correctly. We map the variables:
  const oldPerson = await db.select({ avatarUrl: people.avatarUrl }).from(people).where(eq(people.id, id)).then((res: any) => res[0]);

  const updateData: any = {};
  if (data.nik !== undefined) updateData.nik = data.nik;
  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.birthPlace !== undefined) updateData.birthPlace = data.birthPlace;
  if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

  const person = await peopleService.updatePerson(id, updateData);
  if (!person) {
    return c.json({ status: "Error", message: "Data orang tidak ditemukan." }, 404);
  }

  // Jika avatar diubah atau dihapus, hancurkan foto lama di Cloudinary secara async
  if (oldPerson && oldPerson.avatarUrl && data.avatarUrl !== undefined && data.avatarUrl !== oldPerson.avatarUrl) {
    const p = deleteFromCloudinary(oldPerson.avatarUrl, c.env).catch(console.error);
    if (c.executionCtx?.waitUntil) {
      c.executionCtx.waitUntil(p);
    }
  }

  return c.json({ status: "Success", message: "Profil berhasil diperbarui.", data: person });
});

// ============================================================
// 2. GET PERSON 360 PROFILE
// ============================================================
peopleAdmin.get("/:id/360", async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

  const db = createDb();
  const peopleService = new PeopleService(db);

  const profile360 = await peopleService.getPerson360(id);
  if (!profile360) {
    return c.json({ status: "Error", message: "Data orang tidak ditemukan." }, 404);
  }

  return c.json({ status: "Success", data: profile360 });
});

// ============================================================
// 3. CREATE NEW PERSON
// ============================================================
peopleAdmin.post("/", zValidator("json", createPersonSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb();
  const peopleService = new PeopleService(db);

  const person = await peopleService.createPerson(data);
  return c.json({ status: "Success", message: "Profil dasar orang berhasil dibuat.", data: person });
});

// ============================================================
// 4. ASSIGN PROFILE ROLE (student/teacher/guardian)
// ============================================================
peopleAdmin.post("/:id/assign-role", zValidator("json", assignProfileSchema), async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);
  const data = c.req.valid("json");

  const db = createDb();
  const peopleService = new PeopleService(db);

  let profile;
  if (data.role === "student") {
    if (!data.nis || !data.enrollmentYear) {
      return c.json({ status: "Error", message: "nis dan enrollmentYear diperlukan untuk profil santri." }, 400);
    }
    profile = await peopleService.createStudentProfile(id, data.nis, data.enrollmentYear, data.nisn);
  } else if (data.role === "teacher") {
    if (!data.teacherCode) {
      return c.json({ status: "Error", message: "teacherCode diperlukan untuk profil pengajar." }, 400);
    }
    profile = await peopleService.createTeacherProfile(id, data.teacherCode);
  } else if (data.role === "guardian") {
    if (!data.familyCardNumber || !data.relation) {
      return c.json({ status: "Error", message: "familyCardNumber dan relation diperlukan untuk profil wali." }, 400);
    }
    profile = await peopleService.createGuardianProfile(id, data.familyCardNumber, data.relation);
  } else if (data.role === "pengurus") {
    if (!data.roleName) {
      return c.json({ status: "Error", message: "roleName diperlukan untuk profil pengurus." }, 400);
    }
    profile = await db.insert(organizationMemberships).values({
      personId: id,
      roleName: data.roleName,
      supervisedLevel: data.supervisedLevel || null,
      status: "ACTIVE",
    }).returning().then((res: any) => res[0]);
  }

  return c.json({ status: "Success", message: `Profil peran ${data.role} berhasil dipasang.`, data: profile });
});

// ============================================================
// 5. DELETE PERSON (SOFT DELETE)
// ============================================================
peopleAdmin.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

  const db = createDb();
  
  // Soft delete main person
  await db.update(people).set({ deletedAt: sql`(strftime('%s', 'now'))` }).where(eq(people.id, id));
  
  // Soft delete all profiles
  await db.update(studentProfiles).set({ deletedAt: sql`(strftime('%s', 'now'))` }).where(eq(studentProfiles.personId, id));
  await db.update(teacherProfiles).set({ deletedAt: sql`(strftime('%s', 'now'))` }).where(eq(teacherProfiles.personId, id));
  await db.update(guardianProfiles).set({ deletedAt: sql`(strftime('%s', 'now'))` }).where(eq(guardianProfiles.personId, id));
  await db.update(organizationMemberships).set({ deletedAt: sql`(strftime('%s', 'now'))` }).where(eq(organizationMemberships.personId, id));
  await db.update(alumniRecords).set({ deletedAt: sql`(strftime('%s', 'now'))` }).where(eq(alumniRecords.personId, id));
  await db.update(userAccounts).set({ deletedAt: sql`(strftime('%s', 'now'))` }).where(eq(userAccounts.personId, id));

  return c.json({ status: "Success", message: "Data berhasil dipindahkan ke Recycling Bin." });
});

// ============================================================
// 6. CRON ENDPOINT: HARD DELETE RECYCLE BIN (Older than 48 hours)
// ============================================================
peopleAdmin.delete("/cleanup/recycle-bin", async (c) => {
  const db = createDb();
  // Menghapus record yang `deletedAt` nya lebih dari 48 jam yang lalu
  const threshold = Math.floor(Date.now() / 1000) - (48 * 60 * 60);

  // Hapus semua data profile yang soft-deleted melewati batas waktu
  await db.delete(studentProfiles).where(sql`deleted_at < ${threshold}`);
  await db.delete(teacherProfiles).where(sql`deleted_at < ${threshold}`);
  await db.delete(guardianProfiles).where(sql`deleted_at < ${threshold}`);
  await db.delete(organizationMemberships).where(sql`deleted_at < ${threshold}`);
  await db.delete(alumniRecords).where(sql`deleted_at < ${threshold}`);
  await db.delete(userAccounts).where(sql`deleted_at < ${threshold}`);
  
  // Ambil daftar URL avatar orang-orang yang akan dihapus permanen
  const deletedPeople = await db.select({ avatarUrl: people.avatarUrl })
    .from(people)
    .where(sql`deleted_at < ${threshold}`);

  // Eksekusi penghapusan di database
  await db.delete(people).where(sql`deleted_at < ${threshold}`);

  // Hapus semua gambar dari Cloudinary di background
  if (deletedPeople.length > 0) {
    const promises = deletedPeople
      .filter((p) => p.avatarUrl)
      .map((p) => deleteFromCloudinary(p.avatarUrl as string, c.env).catch(console.error));
    
    if (promises.length > 0 && c.executionCtx?.waitUntil) {
      c.executionCtx.waitUntil(Promise.all(promises));
    }
  }

  return c.json({ status: "Success", message: "Recycling bin berhasil dibersihkan." });
});

export default peopleAdmin;
