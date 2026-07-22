import { Hono } from "hono";
import { createDb, academicClasses, classEnrollments, studentProfiles, people } from "@mphm/db";
import { eq, and } from "drizzle-orm";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";

const classMustahiq = new Hono<AppEnv>();

classMustahiq.use("*", requireRole(["Mustahiq"]));

// ============================================================
// GET MY ASSIGNED CLASS DETAILS & ENROLLED STUDENTS
// ============================================================
classMustahiq.get("/my-class", async (c) => {
  const user = c.get("user");
  const db = createDb();

  if (!user.assignedClassId) {
    return c.json({ status: "Error", message: "Anda tidak ditugaskan ke kelas manapun di tahun ajaran aktif ini." }, 404);
  }

  // 1. Ambil detail kelas
  const cls = await db
    .select()
    .from(academicClasses)
    .where(eq(academicClasses.id, user.assignedClassId))
    .then((res: any) => res[0]);

  if (!cls) {
    return c.json({ status: "Error", message: "Kelas tidak ditemukan." }, 404);
  }

  // 2. Ambil daftar santri aktif di kelas tersebut
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
        eq(classEnrollments.classId, user.assignedClassId),
        eq(classEnrollments.status, "ACTIVE")
      )
    )
    ;

  return c.json({
    status: "Success",
    data: {
      classInfo: cls,
      class: cls,
      students
    }
  });
});

export default classMustahiq;
