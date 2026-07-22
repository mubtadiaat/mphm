import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { subjects } from "./schema/academic";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const MAPEL_ALIYYAH_2 = [
  // MAPEL
  { code: "MP-ALY-001", name: "تفسير الجلالين", subjectType: "MAPEL" },
  { code: "MP-ALY-002", name: "إتمام الدراية", subjectType: "MAPEL" },
  { code: "MP-ALY-003", name: "رياض الصالحين", subjectType: "MAPEL" },
  { code: "MP-ALY-004", name: "كفاية العوام", subjectType: "MAPEL" },
  { code: "MP-ALY-005", name: "فتح المعين", subjectType: "MAPEL" },
  { code: "MP-ALY-006", name: "تسهيل الطرقات", subjectType: "MAPEL" },
  { code: "MP-ALY-007", name: "مبادئ قواعد الفقهية", subjectType: "MAPEL" },
  { code: "MP-ALY-008", name: "عدة الفارض", subjectType: "MAPEL" },
  { code: "MP-ALY-009", name: "الفية ابن مالك", subjectType: "MAPEL" },
  { code: "MP-ALY-010", name: "بداية الهداية", subjectType: "MAPEL" },
  
  // NON-MAPEL (The Holy 5)
  { code: "NM-ALY-001", name: "القرآن", subjectType: "NON_MAPEL" },
  { code: "NM-ALY-002", name: "الخط \\ الإملاء", subjectType: "NON_MAPEL" },
  { code: "NM-ALY-003", name: "قراءة الكتب", subjectType: "NON_MAPEL" },
  { code: "NM-ALY-004", name: "المحافظة", subjectType: "NON_MAPEL" },
  { code: "NM-ALY-005", name: "الأخلاق", subjectType: "NON_MAPEL" },
] as const;

async function seedMapel() {
  console.log("Seeding Mata Pelajaran (Arab) ke database...");
  try {
    for (const subject of MAPEL_ALIYYAH_2) {
      await db.insert(subjects).values({
        code: subject.code,
        name: subject.name,
        subjectType: subject.subjectType,
      }).onConflictDoNothing({ target: subjects.code });
      console.log(`Berhasil menyisipkan: ${subject.name} (${subject.subjectType})`);
    }
    console.log("Seeding selesai!");
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
  }
}

seedMapel();
