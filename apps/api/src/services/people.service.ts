import { eq, and, like, or, sql, isNull } from "drizzle-orm";
import type { Database } from "@mphm/db";
import { 
  people, 
  studentProfiles, 
  teacherProfiles, 
  guardianProfiles, 
  alumniRecords, 
  organizationMemberships 
} from "@mphm/db";

export class PeopleService {
  constructor(private db: Database) {}

  // ============================================================
  // GET PEOPLE WITH PROFILE AGGREGATION (Profile 360°)
  // ============================================================
  async getPerson360(personId: string) {
    const person = await this.db
      .select()
      .from(people)
      .where(and(eq(people.id, personId), isNull(people.deletedAt)))
      .get();

    if (!person) return null;

    // Ambil semua profil terkait secara paralel/terpisah
    const [student, teacher, guardian, alumni, orgMember] = await Promise.all([
      this.db.select().from(studentProfiles).where(and(eq(studentProfiles.personId, personId), isNull(studentProfiles.deletedAt))).get(),
      this.db.select().from(teacherProfiles).where(and(eq(teacherProfiles.personId, personId), isNull(teacherProfiles.deletedAt))).get(),
      this.db.select().from(guardianProfiles).where(and(eq(guardianProfiles.personId, personId), isNull(guardianProfiles.deletedAt))).get(),
      this.db.select().from(alumniRecords).where(and(eq(alumniRecords.personId, personId), isNull(alumniRecords.deletedAt))).get(),
      this.db.select().from(organizationMemberships).where(and(eq(organizationMemberships.personId, personId), isNull(organizationMemberships.deletedAt))).get(),
    ]);

    return {
      ...person,
      profiles: {
        student: student || null,
        teacher: teacher || null,
        guardian: guardian || null,
        alumni: alumni || null,
        membership: orgMember || null,
      }
    };
  }

  // ============================================================
  // LIST PEOPLE WITH SEARCH AND PAGINATION
  // ============================================================
  async listPeople(query?: string, limit = 10, offset = 0) {
    let sqlQuery = this.db.select().from(people).where(isNull(people.deletedAt));
    
    if (query) {
      // @ts-ignore
      sqlQuery = this.db.select().from(people).where(
        and(
          isNull(people.deletedAt),
          or(
            like(people.fullName, `%${query}%`),
            like(people.nik, `%${query}%`)
          )
        )
      );
    }

    const list = await sqlQuery.limit(limit).offset(offset).all();
    return list;
  }

  // ============================================================
  // CREATE PERSON WITH OPTIONAL POLYMORPHIC ROLES
  // ============================================================
  async createPerson(data: {
    nik?: string;
    fullName: string;
    gender: "L" | "P";
    birthPlace?: string;
    birthDate?: string;
    address?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  }) {
    return await this.db.insert(people).values({
      nik: data.nik || null,
      fullName: data.fullName,
      gender: data.gender,
      birthPlace: data.birthPlace || null,
      birthDate: data.birthDate || null,
      address: data.address || null,
      phoneNumber: data.phoneNumber || null,
      avatarUrl: data.avatarUrl || null,
      updatedAt: new Date(),
    }).returning().get();
  }

  // ============================================================
  // UPDATE PERSON
  // ============================================================
  async updatePerson(personId: string, data: Partial<typeof people.$inferInsert>) {
    return await this.db
      .update(people)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(people.id, personId))
      .returning()
      .get();
  }

  // ============================================================
  // MANAGE PROFILE ASSIGNMENT
  // ============================================================
  async createStudentProfile(personId: string, nis: string, enrollmentYear: number, nisn?: string) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;

    const todayCountRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(studentProfiles)
      .where(sql`stambuk_number LIKE ${datePrefix + '%'}`)
      .get();
      
    const counter = (todayCountRes?.count || 0) + 1;
    const stambukNumber = `${datePrefix}${String(counter).padStart(2, '0')}`;

    return await this.db.insert(studentProfiles).values({
      personId,
      stambukNumber,
      nis,
      nisn: nisn || null,
      enrollmentYear,
      status: "ACTIVE",
    }).returning().get();
  }

  async createTeacherProfile(personId: string, teacherCode: string) {
    return await this.db.insert(teacherProfiles).values({
      personId,
      teacherCode,
      status: "ACTIVE",
    }).returning().get();
  }

  async createGuardianProfile(personId: string, familyCardNumber: string, relation: "AYAH" | "IBU" | "WALI") {
    return await this.db.insert(guardianProfiles).values({
      personId,
      familyCardNumber,
      relation,
    }).returning().get();
  }
}
