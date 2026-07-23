const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');

const envPath = path.resolve(__dirname, './apps/web/.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const connectionString = envConfig.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL missing from apps/web/.env.local");
  process.exit(1);
}

const sql = neon(connectionString);

async function cleanData() {
  console.log("🧹 Memulai pembersihan data dummy / simulasi database...");

  // 1. Wipe operational & transaction tables
  await sql`
    TRUNCATE TABLE 
      student_permits, 
      student_violations, 
      violation_types, 
      student_attendances, 
      student_scores, 
      class_enrollments, 
      academic_certificates, 
      khidmah_assignments, 
      custom_tables, 
      rooms, 
      academic_classes, 
      curriculum_subjects,
      curriculums, 
      subjects, 
      teacher_profiles, 
      guardian_profiles, 
      student_profiles, 
      organization_memberships
    CASCADE;
  `;

  // 2. Remove dummy user accounts except core sekretariat & admin
  await sql`
    DELETE FROM user_accounts 
    WHERE username NOT IN ('sek_pondok', 'sek_madrasah', 'admin_mphm');
  `;

  // 3. Remove non-admin people
  await sql`
    DELETE FROM people 
    WHERE id NOT IN (
      SELECT person_id FROM user_accounts WHERE username IN ('sek_pondok', 'sek_madrasah', 'admin_mphm')
    );
  `;

  console.log("======================================================");
  console.log("🎉 PEMBERSIHAN BERHASIL! Seluruh data dummy (santri, nilai, kelas, asrama, perizinan, pelanggaran, dsb) telah dihapus.");
  console.log("🔑 Hanya akun Administrator & Sekretariat utama yang dipertahankan untuk input manual / import real.");
  console.log("======================================================");
}

cleanData().catch(err => {
  console.error("❌ Error cleaning database:", err);
  process.exit(1);
});
