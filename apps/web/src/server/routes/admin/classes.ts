import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb, academicClasses, teacherProfiles, people, academicYears, organizationMemberships, studentProfiles, classEnrollments, curriculums } from "@mphm/db";
import { AcademicService } from "../../services/academic.service";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { eq, isNull, and } from "drizzle-orm";

const classesAdmin = new Hono<AppEnv>();

classesAdmin.use("*", requireRole(["Sekretariat", "Mufattisy", "Mundzir", "Mustahiq"]));

classesAdmin.get("/", async (c) => {
  const academicYearId = c.req.query("academicYearId") || undefined;
  const db = createDb();
  const user = c.get("user");

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

  const conditions = [
    isNull(academicClasses.deletedAt),
    eq(academicClasses.academicYearId, targetYearId)
  ];

  if (user?.role === "Mufattisy" && user.supervisedLevel) {
    conditions.push(eq(academicClasses.institutionLevel, user.supervisedLevel));
  }

  const list = await db
    .select({
      id: academicClasses.id,
      name: academicClasses.fullName,
      capacity: academicClasses.capacity,
      institutionLevel: academicClasses.institutionLevel,
      classLevel: academicClasses.classLevel,
      section: academicClasses.section,
      mustahiqId: academicClasses.mustahiqId,
      mustahiq: people.fullName,
    })
    .from(academicClasses)
    .innerJoin(teacherProfiles, eq(academicClasses.mustahiqId, teacherProfiles.id))
    .innerJoin(people, eq(teacherProfiles.personId, people.id))
    .where(and(...conditions))
    ;

  // Ambil daftar Mufattisy aktif untuk dipetakan secara in-memory
  const mufattisyList = await db
    .select({
      fullName: people.fullName,
      supervisedLevel: organizationMemberships.supervisedLevel
    })
    .from(organizationMemberships)
    .innerJoin(people, eq(organizationMemberships.personId, people.id))
    .where(
      and(
        eq(organizationMemberships.role, "Mufattisy"),
        eq(organizationMemberships.status, "ACTIVE"),
        isNull(organizationMemberships.deletedAt)
      )
    )
    ;

  const enrichedList = list.map(cls => {
    const muf = mufattisyList.find(m => m.supervisedLevel === cls.institutionLevel);
    return {
      ...cls,
      mufattisy: muf?.fullName || "Belum Ditentukan"
    };
  });

  return c.json({ status: "Success", data: enrichedList });
});

// ============================================================
// GET SINGLE CLASS DETAILS & STUDENTS
// ============================================================
classesAdmin.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

  const db = createDb();

  // 1. Ambil detail kelas
  const cls = await db
    .select({
      id: academicClasses.id,
      name: academicClasses.fullName,
      capacity: academicClasses.capacity,
      institutionLevel: academicClasses.institutionLevel,
      classLevel: academicClasses.classLevel,
      section: academicClasses.section,
      mustahiqId: academicClasses.mustahiqId,
      mustahiq: people.fullName,
    })
    .from(academicClasses)
    .innerJoin(teacherProfiles, eq(academicClasses.mustahiqId, teacherProfiles.id))
    .innerJoin(people, eq(teacherProfiles.personId, people.id))
    .where(and(eq(academicClasses.id, id), isNull(academicClasses.deletedAt)))
    .then((res: any) => res[0]);

  if (!cls) {
    return c.json({ status: "Error", message: "Kelas tidak ditemukan." }, 404);
  }

  // 2. Hubungkan Mufattisy
  const mufattisy = await db
    .select({ fullName: people.fullName })
    .from(organizationMemberships)
    .innerJoin(people, eq(organizationMemberships.personId, people.id))
    .where(
      and(
        eq(organizationMemberships.role, "Mufattisy"),
        eq(organizationMemberships.supervisedLevel, cls.institutionLevel),
        eq(organizationMemberships.status, "ACTIVE"),
        isNull(organizationMemberships.deletedAt)
      )
    )
    .then((res: any) => res[0]);

  // 3. Ambil daftar santri aktif di kelas tersebut
  const students = await db
    .select({
      studentId: studentProfiles.id,
      nis: studentProfiles.nis,
      nisn: studentProfiles.nisn,
      fullName: people.fullName,
      avatarUrl: people.avatarUrl,
      gender: people.gender,
    })
    .from(classEnrollments)
    .innerJoin(studentProfiles, eq(classEnrollments.studentId, studentProfiles.id))
    .innerJoin(people, eq(studentProfiles.personId, people.id))
    .where(
      and(
        eq(classEnrollments.classId, id),
        eq(classEnrollments.status, "ACTIVE"),
        isNull(classEnrollments.deletedAt)
      )
    )
    ;

  return c.json({
    status: "Success",
    data: {
      class: {
        ...cls,
        mufattisy: mufattisy?.fullName || "Belum Ditentukan"
      },
      students
    }
  });
});

const createClassSchema = z.object({
  academicYearId: z.string().uuid().optional(),
  curriculumId: z.string().uuid().optional(),
  institutionLevel: z.string(),
  classLevel: z.string(),
  section: z.string(),
  mustahiqId: z.string().uuid(),
  capacity: z.number().int().positive().optional(),
});

const enrollBatchSchema = z.object({
  studentIds: z.array(z.string().uuid()),
});

// ============================================================
// 1. CREATE CLASS WITH AUTO GENERATED NAMING & CAPACITY CHECK
// ============================================================
classesAdmin.post("/", zValidator("json", createClassSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb();
  const academicService = new AcademicService(db);

  try {
    let academicYearId: string;
    if (data.academicYearId) {
      academicYearId = data.academicYearId;
    } else {
      const activeYear = await db
        .select({ id: academicYears.id })
        .from(academicYears)
        .where(eq(academicYears.isActive, true))
        .then((res: any) => res[0]);
      if (!activeYear) {
        throw new Error("Tahun ajaran aktif tidak ditemukan.");
      }
      academicYearId = activeYear.id;
    }

    let curriculumId: string;
    if (data.curriculumId) {
      curriculumId = data.curriculumId;
    } else {
      const activeCurr = await db
        .select({ id: curriculums.id })
        .from(curriculums)
        .where(eq(curriculums.isActive, true))
        .then((res: any) => res[0]);
      if (!activeCurr) {
        // Fallback ke kurikulum pertama jika tidak ada yang ditandai aktif
        const anyCurr = await db
          .select({ id: curriculums.id })
          .from(curriculums)
          .then((res: any) => res[0]);
        if (!anyCurr) {
          throw new Error("Kurikulum tidak ditemukan di database.");
        }
        curriculumId = anyCurr.id;
      } else {
        curriculumId = activeCurr.id;
      }
    }

    const cls = await academicService.createClass({
      ...data,
      academicYearId,
      curriculumId,
    });
    return c.json({ status: "Success", message: "Kelas berhasil dibuat", data: cls });
  } catch (err: any) {
    return c.json({ status: "Error", message: err.message }, 400);
  }
});

// ============================================================
// 2. BATCH ENROLL STUDENTS TO CLASS (ROMBEL)
// ============================================================
classesAdmin.post("/:id/enroll", zValidator("json", enrollBatchSchema), async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);
  
  const { studentIds } = c.req.valid("json");
  const db = createDb();
  const academicService = new AcademicService(db);

  try {
    const enrollments = await academicService.enrollStudentsToClass(id, studentIds);
    return c.json({ status: "Success", message: `${studentIds.length} siswa berhasil didaftarkan ke kelas ini.`, data: enrollments });
  } catch (err: any) {
    return c.json({ status: "Error", message: err.message }, 400);
  }
});

// ============================================================
// 3. SOFT DELETE KELAS (deletedAt)
// ============================================================
classesAdmin.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ status: "Error", message: "id is required" }, 400);

  const db = createDb();
  
  const deleted = await db
    .update(academicClasses)
    .set({ deletedAt: new Date() })
    .where(eq(academicClasses.id, id))
    .returning()
    .then((res: any) => res[0]);

  if (!deleted) {
    return c.json({ status: "Error", message: "Kelas tidak ditemukan" }, 404);
  }

  return c.json({ status: "Success", message: "Kelas dinonaktifkan (Soft Delete)." });
});

export default classesAdmin;
