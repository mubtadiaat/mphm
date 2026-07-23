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

async function seed() {
  console.log("🚀 Memulai pembersihan total (TRUNCATE) dan pembenihan database terintegrasi 100%...");

  // 0. Clean All Tables
  console.log("🧹 0/10 Wiping existing data (TRUNCATE CASCADE)...");
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
  console.log("📦 1/10 Creating System Settings...");
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
  console.log("📅 2/10 Creating Academic Years...");
  const ayId2026 = "ay-2026-2027-id";
  const ayId2025 = "ay-2025-2026-id";

  await sql`
    INSERT INTO academic_years (id, name, is_active)
    VALUES 
      (${ayId2026}, '2026/2027', true),
      (${ayId2025}, '2025/2026', false);
  `;

  // 3. Subjects
  console.log("📚 3/10 Creating Subjects...");
  const subj1 = "subj-nahwu-01";
  const subj2 = "subj-shorof-01";
  const subj3 = "subj-fiqih-01";
  const subj4 = "subj-aqidah-01";
  const subj5 = "subj-hadits-01";
  const subj6 = "subj-akhlaq-01";

  await sql`
    INSERT INTO subjects (id, code, name, subject_type)
    VALUES 
      (${subj1}, 'NHW-01', 'Al-Jurumiyyah (Nahwu)', 'MAPEL'),
      (${subj2}, 'SRF-01', 'Kaelani & Nazham Maqsud (Shorof)', 'MAPEL'),
      (${subj3}, 'FQH-01', 'Fathul Qorib (Fiqih)', 'MAPEL'),
      (${subj4}, 'AQD-01', 'Aqidatul Awam (Aqidah)', 'MAPEL'),
      (${subj5}, 'HDT-01', 'Arba''in Nawawiyyah (Hadits)', 'MAPEL'),
      (${subj6}, 'AKH-01', 'Akhlaq Lil Banat (Akhlaq)', 'NON_MAPEL');
  `;

  // 4. Curriculum
  console.log("📜 4/10 Creating Curriculums & Mapping...");
  const currIdIbtida = "curr-ibtida-2026";
  const currIdTsanawi = "curr-tsanawi-2026";
  const currIdAliyyah = "curr-aliyyah-2026";

  await sql`
    INSERT INTO curriculums (id, name, institution_level)
    VALUES 
      (${currIdIbtida}, 'Kurikulum Standar Ibtida''iyyah 2026', 'Ibtida''iyyah'),
      (${currIdTsanawi}, 'Kurikulum Standar Tsanawiyyah 2026', 'Tsanawiyyah'),
      (${currIdAliyyah}, 'Kurikulum Standar Aliyyah 2026', 'Aliyyah');
  `;

  await sql`
    INSERT INTO curriculum_subjects (id, curriculum_id, subject_id, order_number)
    VALUES 
      ('cs-1', ${currIdIbtida}, ${subj1}, 1),
      ('cs-2', ${currIdIbtida}, ${subj2}, 2),
      ('cs-3', ${currIdIbtida}, ${subj3}, 3),
      ('cs-4', ${currIdIbtida}, ${subj4}, 4),
      ('cs-5', ${currIdIbtida}, ${subj6}, 5),
      ('cs-6', ${currIdTsanawi}, ${subj1}, 1),
      ('cs-7', ${currIdTsanawi}, ${subj3}, 2),
      ('cs-8', ${currIdTsanawi}, ${subj5}, 3);
  `;

  // 5. Staff, Teachers & Pengurus
  console.log("👥 5/10 Creating People & User Accounts...");
  const adminP = "p-admin-01";
  const sekPondokP = "p-sek-pondok-01";
  const sekMadrasahP = "p-sek-madrasah-01";
  const mustahiq1P = "p-mustahiq-01";
  const mustahiq2P = "p-mustahiq-02";
  const mufattisyP = "p-mufattisy-01";
  const pimpinanP = "p-pimpinan-01";
  const keamananP = "p-keamanan-01";
  const waliP = "p-wali-01";

  await sql`
    INSERT INTO people (id, full_name, gender, phone_number, address)
    VALUES 
      (${adminP}, 'Ustadz H. Ahmad Fauzi, S.Pd.I', 'L', '081234567890', 'Komplek Pesantren Blok A1, Kediri'),
      (${sekPondokP}, 'Ustadzah Siti Aminah, S.Ag', 'P', '081234567891', 'Kantor Pengurus Pondok Putri, Kediri'),
      (${sekMadrasahP}, 'Ustadzah Fatimah Azzahra, M.Pd', 'P', '081234567892', 'Kantor Pengurus Madrasah Diniyyah, Kediri'),
      (${mustahiq1P}, 'Ustadz Muhammad Ridwan, Lc', 'L', '081298765432', 'Komplek Pengajar Blok B2, Kediri'),
      (${mustahiq2P}, 'Ustadz Abdul Halim, M.H', 'L', '081298765433', 'Komplek Pengajar Blok B3, Kediri'),
      (${mufattisyP}, 'Ustadz Dr. H. Zayd Syarif', 'L', '081311223344', 'Komplek Pengurus Pusat, Kediri'),
      (${pimpinanP}, 'KH. Abdullah Ma''sum', 'L', '081122334455', 'Kediaman Pengasuh Utama, Kediri'),
      (${keamananP}, 'Ustadz Syamsuddin', 'L', '081566778899', 'Pos Keamanan Gerbang Utama, Kediri'),
      (${waliP}, 'Bapak H. Mansur', 'L', '085677889900', 'Jl. Raya Nganjuk No. 45, Nganjuk');
  `;

  await sql`
    INSERT INTO user_accounts (id, person_id, username, email, password_hash, role, status)
    VALUES 
      ('u-admin-01', ${adminP}, 'admin_mphm', 'admin@m.p3hm.my.id', 'admin123', 'sek.pondok', 'ACTIVE'),
      ('u-sek-pondok-01', ${sekPondokP}, 'sek_pondok', 'pondok@m.p3hm.my.id', 'admin123', 'sek.pondok', 'ACTIVE'),
      ('u-sek-madrasah-01', ${sekMadrasahP}, 'sek_madrasah', 'madrasah@m.p3hm.my.id', 'admin123', 'sek.madrasah', 'ACTIVE'),
      ('u-mustahiq-01', ${mustahiq1P}, 'mustahiq01', 'mustahiq@mphm.or.id', 'mphm123', 'Mustahiq', 'ACTIVE'),
      ('u-mufattisy-01', ${mufattisyP}, 'mufattisy01', 'mufattisy@mphm.or.id', 'mphm123', 'Mufattisy', 'ACTIVE'),
      ('u-pimpinan-01', ${pimpinanP}, 'pimpinan01', 'pimpinan@mphm.or.id', 'mphm123', 'Mundzir', 'ACTIVE'),
      ('u-keamanan-01', ${keamananP}, 'keamanan01', 'keamanan@mphm.or.id', 'mphm123', 'Keamanan', 'ACTIVE'),
      ('u-wali-01', ${waliP}, 'wali01', 'wali01@gmail.com', 'mphm123', 'Wali Santri', 'ACTIVE');
  `;

  await sql`
    INSERT INTO teacher_profiles (id, person_id, teacher_code, status)
    VALUES 
      ('t-mustahiq-01', ${mustahiq1P}, 'GURU-2026-001', 'ACTIVE'),
      ('t-mustahiq-02', ${mustahiq2P}, 'GURU-2026-002', 'ACTIVE');
  `;

  await sql`
    INSERT INTO guardian_profiles (id, person_id, family_card_number, relation)
    VALUES ('g-wali-01', ${waliP}, '3506123456780001', 'AYAH');
  `;

  await sql`
    INSERT INTO organization_memberships (id, person_id, role, service_year, status)
    VALUES 
      ('om-01', ${mufattisyP}, 'Mufattisy', '2026/2027', 'ACTIVE'),
      ('om-02', ${pimpinanP}, 'Mundzir', '2026/2027', 'ACTIVE'),
      ('om-03', ${keamananP}, 'Keamanan', '2026/2027', 'ACTIVE');
  `;

  // 6. Dormitory Rooms
  console.log("🏠 6/10 Creating Dormitory Rooms...");
  const room1 = "room-aisyah-1";
  const room2 = "room-aisyah-2";
  const room3 = "room-khadijah-1";
  const room4 = "room-fatimah-1";

  await sql`
    INSERT INTO rooms (id, name, building_name, capacity, supervisor_id)
    VALUES 
      (${room1}, 'Asrama Aisyah 1', 'Gedung Aisyah', 20, ${mustahiq1P}),
      (${room2}, 'Asrama Aisyah 2', 'Gedung Aisyah', 20, ${mustahiq2P}),
      (${room3}, 'Asrama Khadijah 1', 'Gedung Khadijah', 25, ${mufattisyP}),
      (${room4}, 'Asrama Fatimah 1', 'Gedung Fatimah', 25, ${sekPondokP});
  `;

  // 7. Academic Classes (Semua Kelas Terisi Mustahiq dari DB)
  console.log("🏫 7/10 Creating Academic Classes...");
  const class1A = "c-1-ibtida-a";
  const class1B = "c-1-ibtida-b";
  const class2A = "c-2-ibtida-a";
  const class1Tsanawi = "c-1-tsanawi-a";
  const class1Aliyyah = "c-1-aliyyah-a";

  await sql`
    INSERT INTO academic_classes (id, academic_year_id, name, full_name, institution_level, level_number, mustahiq_id, curriculum_id)
    VALUES 
      (${class1A}, ${ayId2026}, '1 Ibtida''iyyah A', 'Kelas 1 Ibtida''iyyah A (Putri)', 'Ibtida''iyyah', 1, ${mustahiq1P}, ${currIdIbtida}),
      (${class1B}, ${ayId2026}, '1 Ibtida''iyyah B', 'Kelas 1 Ibtida''iyyah B (Putri)', 'Ibtida''iyyah', 1, ${mustahiq2P}, ${currIdIbtida}),
      (${class2A}, ${ayId2026}, '2 Ibtida''iyyah A', 'Kelas 2 Ibtida''iyyah A (Putri)', 'Ibtida''iyyah', 2, ${mustahiq1P}, ${currIdIbtida}),
      (${class1Tsanawi}, ${ayId2026}, '1 Tsanawiyyah A', 'Kelas 1 Tsanawiyyah A (Putri)', 'Tsanawiyyah', 1, ${mufattisyP}, ${currIdTsanawi}),
      (${class1Aliyyah}, ${ayId2026}, '1 Aliyyah A', 'Kelas 1 Aliyyah A (Putri)', 'Aliyyah', 1, ${pimpinanP}, ${currIdAliyyah});
  `;

  // 8. Santri Profiles & Class Enrollments
  console.log("👨‍🎓 8/10 Creating Santri Profiles & Enrollments...");
  const santriList = [
    { id: "s-01", personId: "p-s-01", name: "Aisyah Nabila", stambuk: "2026001", nis: "NIS-2026-001", nisn: "0081234561", roomId: room1, classId: class1A },
    { id: "s-02", personId: "p-s-02", name: "Zahra Almira", stambuk: "2026002", nis: "NIS-2026-002", nisn: "0081234562", roomId: room1, classId: class1A },
    { id: "s-03", personId: "p-s-03", name: "Khadijah Nurul Jannah", stambuk: "2026003", nis: "NIS-2026-003", nisn: "0081234563", roomId: room2, classId: class1B },
    { id: "s-04", personId: "p-s-04", name: "Maryam Humaira", stambuk: "2026004", nis: "NIS-2026-004", nisn: "0081234564", roomId: room2, classId: class2A },
    { id: "s-05", personId: "p-s-05", name: "Safiyyah Mawaddah", stambuk: "2026005", nis: "NIS-2026-005", nisn: "0081234565", roomId: room3, classId: class1Tsanawi },
    { id: "s-06", personId: "p-s-06", name: "Ruqayyah Al-Thahirah", stambuk: "2026006", nis: "NIS-2026-006", nisn: "0081234566", roomId: room4, classId: class1Aliyyah },
  ];

  for (const s of santriList) {
    await sql`
      INSERT INTO people (id, full_name, gender, birth_place, birth_date, address, phone_number)
      VALUES (${s.personId}, ${s.name}, 'P', 'Kediri', '2012-05-14', 'Jl. KH. Abdul Karim No. 12, Lirboyo, Kediri', '081234009988');
    `;

    await sql`
      INSERT INTO student_profiles (id, person_id, stambuk_number, nis, nisn, enrollment_year, status, room_id)
      VALUES (${s.id}, ${s.personId}, ${s.stambuk}, ${s.nis}, ${s.nisn}, 2026, 'ACTIVE', ${s.roomId});
    `;

    await sql`
      INSERT INTO class_enrollments (id, class_id, student_id, status)
      VALUES (${"enr-" + s.id}, ${s.classId}, ${s.id}, 'ACTIVE');
    `;

    // Nilai Kwartal 1, 2, 3
    await sql`
      INSERT INTO student_scores (id, class_id, student_id, subject_id, kwartal, score)
      VALUES 
        (${"sc-1-" + s.id}, ${s.classId}, ${s.id}, ${subj1}, 1, 8.5),
        (${"sc-2-" + s.id}, ${s.classId}, ${s.id}, ${subj2}, 1, 8.0),
        (${"sc-3-" + s.id}, ${s.classId}, ${s.id}, ${subj3}, 1, 9.0),
        (${"sc-4-" + s.id}, ${s.classId}, ${s.id}, ${subj4}, 1, 8.5);
    `;

    // Kehadiran Presensi
    await sql`
      INSERT INTO student_attendances (id, student_id, month, year, sick, permitted, unexcused)
      VALUES (${"att-" + s.id}, ${s.id}, 7, 2026, 0, 1, 0);
    `;
  }

  // 9. Violation Types & Violations
  console.log("⚠️ 9/10 Creating Violation Types & Violations...");
  const vType1 = "V-01";
  const vType2 = "V-02";
  const vType3 = "V-03";

  await sql`
    INSERT INTO violation_types (id, name, category, severity, points)
    VALUES 
      (${vType1}, 'Terlambat Mengikuti Jamaah Subuh', 'Kedisiplinan', 'RINGAN', 5),
      (${vType2}, 'Tidak Membawa Kitab Fathul Qorib', 'Akademik', 'RINGAN', 5),
      (${vType3}, 'Keluar Komplek Tanpa Surat Izin Resmi', 'Kedisiplinan', 'BERAT', 25);
  `;

  await sql`
    INSERT INTO student_violations (id, student_id, violation_type_id, penalty, notes)
    VALUES 
      ('v-01', 's-02', ${vType1}, 'Ta''zir Kebersihan Halaman Asrama', 'Terlambat 10 menit saat azan Subuh'),
      ('v-02', 's-03', ${vType2}, 'Membaca Ulang Nazham Shorof', 'Lupa membawa kitab saat pengajian');
  `;

  // 10. Student Permits
  console.log("🎫 10/10 Creating Student Permits...");
  await sql`
    INSERT INTO student_permits (id, student_id, permit_type, reason, start_date, end_date, status, approved_by_id, notes)
    VALUES 
      ('perm-01', 's-01', 'PULANG', 'Acara Pernikahan Kakak Kandung', '2026-07-25', '2026-07-28', 'APPROVED', ${pimpinanP}, 'Diizinkan pulang dengan pendampingan wali'),
      ('perm-02', 's-04', 'SAMBANGAN', 'Kunjungan Orang Tua & Pengiriman Bekal', '2026-07-24', '2026-07-24', 'PENDING', NULL, 'Menunggu persetujuan Pengurus Pondok');
  `;

  // Khidmah Assignment
  await sql`
    INSERT INTO khidmah_assignments (id, person_id, location, role_task, start_date, status)
    VALUES ('khid-01', ${adminP}, 'Kantor Sekretariat Utama MPHM', 'Kepala Tata Usaha Akademik', '2025-06-01', 'ACTIVE');
  `;

  // Initial Audit Log Entry
  await sql`
    INSERT INTO audit_logs (id, action, entity, after_state)
    VALUES ('log-init-01', 'INITIAL_RELATIONAL_SEED', 'SYSTEM', 'Initialized complete interconnected database seed 2026/2027');
  `;

  console.log("======================================================");
  console.log("🎉 DATABASE TERENKRIPSI BERHASIL DI-RESET DAN DIISI DENGAN DATA 100% TERHUBUNG!");
  console.log("======================================================");
}

seed().catch(err => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
