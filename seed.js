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

const sql = neon(connectionString);async function seed() {
  console.log("🚀 Memulai pembersihan total (TRUNCATE) dan registrasi 2 akun Sekretariat resmi...");

  // 0. Clean All Tables
  console.log("🧹 Wiping existing data (TRUNCATE CASCADE)...");
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
      organization_memberships, 
      user_accounts, 
      people, 
      academic_years,
      audit_logs,
      system_settings
    CASCADE;
  `;

  // 1. System Settings
  console.log("📦 Creating System Settings...");
  await sql`
    INSERT INTO system_settings (key, value, updated_at)
    VALUES 
      ('activeAcademicYear', '2026/2027', NOW()),
      ('systemName', 'MPHM Enterprise', NOW()),
      ('systemMaintenance', 'false', NOW()),
      ('showMustahiqScores', 'true', NOW()),
      ('showMustahiqAttendance', 'true', NOW()),
      ('showGuardianScores', 'true', NOW()),
      ('showGuardianDiscipline', 'true', NOW()),
      ('showKeamananLookup', 'true', NOW());
  `;

  // 2. Academic Years
  console.log("📅 Creating Academic Year 2026/2027...");
  const ayId2026 = "ay-2026-2027-id";
  await sql`
    INSERT INTO academic_years (id, name, is_active)
    VALUES (${ayId2026}, '2026/2027', true);
  `;

  // 3. Create 2 Sekretariat People & User Accounts
  console.log("👥 Creating 2 Official Secretariat Accounts...");
  const personMadrasahId = "p-sek-madrasah-2026";
  const personPondokId = "p-sek-pondok-2026";

  await sql`
    INSERT INTO people (id, full_name, gender, phone_number, address)
    VALUES 
      (${personMadrasahId}, 'Sekretariat Madrasah Diniyyah (MPHM)', 'P', '081234567890', 'Kediri'),
      (${personPondokId}, 'Sekretariat Pondok Pesantren (P3HM)', 'P', '081234567891', 'Kediri');
  `;

  await sql`
    INSERT INTO user_accounts (id, person_id, username, email, password_hash, role, status)
    VALUES 
      ('u-mphm2026', ${personMadrasahId}, 'mphm2026', 'sekretariat.madrasah@mphm.or.id', 'mubtadiaat26', 'sek.madrasah', 'ACTIVE'),
      ('u-p3hm20026', ${personPondokId}, 'p3hm20026', 'sekretariat.pondok@p3hm.or.id', 'mubtadiaat26', 'sek.pondok', 'ACTIVE');
  `;

  console.log("======================================================");
  console.log("🎉 SEED BERHASIL!");
  console.log("1. mphm2026  (sek.madrasah) | Pass: mubtadiaat26");
  console.log("2. p3hm20026 (sek.pondok)   | Pass: mubtadiaat26");
  console.log("======================================================");
}

seed().catch(err => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
