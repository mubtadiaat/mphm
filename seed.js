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
  console.log("🚀 Memulai proses seeding data komprehensif MPHM Enterprise 2026/2027...");

  // 1. System Settings
  console.log("📦 1/9 Creating System Settings...");
  await sql`
    INSERT INTO system_settings (key, value, updated_at)
    VALUES 
      ('activeAcademicYear', '2026/2027', NOW()),
      ('systemName', 'MPHM Enterprise', NOW()),
      ('systemMaintenance', 'false', NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
  `;

  // 2. Academic Years (Tahun Ajaran 2026/2027)
  console.log("📅 2/9 Creating Academic Years...");
  const ayId2026 = "ay-2026-2027-id";
  const ayId2025 = "ay-2025-2026-id";

  await sql`
    INSERT INTO academic_years (id, name, is_active)
    VALUES 
      (${ayId2026}, '2026/2027', true),
      (${ayId2025}, '2025/2026', false)
    ON CONFLICT (id) DO NOTHING;
  `;

  // 3. Subjects
  console.log("📚 3/9 Creating Subjects...");
  const subj1 = "subj-nahwu-01";
  const subj2 = "subj-shorof-01";
  const subj3 = "subj-fiqih-01";
  const subj4 = "subj-aqidah-01";
  const subj5 = "subj-hadits-01";

  await sql`
    INSERT INTO subjects (id, code, name, subject_type)
    VALUES 
      (${subj1}, 'NHW-01', 'Al-Jurumiyyah (Nahwu)', 'MAPEL'),
      (${subj2}, 'SRF-01', 'Kaelani & Nazham Maqsud (Shorof)', 'MAPEL'),
      (${subj3}, 'FQH-01', 'Fathul Qorib (Fiqih)', 'MAPEL'),
      (${subj4}, 'AQD-01', 'Aqidatul Awam (Aqidah)', 'MAPEL'),
      (${subj5}, 'HDT-01', 'Arba''in Nawawiyyah (Hadits)', 'MAPEL')
    ON CONFLICT (code) DO NOTHING;
  `;

  // 4. Curriculum
  console.log("📜 4/9 Creating Curriculums...");
  const currId = "curr-ibtida-2026";
  await sql`
    INSERT INTO curriculums (id, name, institution_level)
    VALUES (${currId}, 'Kurikulum Standar Ibtida''iyyah 2026', 'Ibtida''iyyah')
    ON CONFLICT (id) DO NOTHING;
  `;

  // 5. Staff, Teacher, Mufattisy, Pimpinan, Keamanan & Accounts
  console.log("👥 5/9 Creating Staff, Teacher & User Accounts...");
  const adminP = "p-admin-01";
  const sekPondokP = "p-sek-pondok-01";
  const sekMadrasahP = "p-sek-madrasah-01";
  const mustahiqP = "p-mustahiq-01";
  const mufattisyP = "p-mufattisy-01";
  const pimpinanP = "p-pimpinan-01";
  const keamananP = "p-keamanan-01";
  const waliP = "p-wali-01";

  await sql`
    INSERT INTO people (id, full_name, gender, phone_number, address)
    VALUES 
      (${adminP}, 'Ustadz H. Ahmad Fauzi, S.Pd.I', 'L', '081234567890', 'Komplek Pesantren Blok A1'),
      (${sekPondokP}, 'Sekretariat Pondok P3HM', 'P', '081234567891', 'Kantor Pengurus Pondok'),
      (${sekMadrasahP}, 'Sekretariat Madrasah MPHM', 'P', '081234567892', 'Kantor Pengurus Madrasah'),
      (${mustahiqP}, 'Ustadz Muhammad Ridwan, Lc', 'L', '081298765432', 'Komplek Pengajar Blok B2'),
      (${mufattisyP}, 'Ustadz Dr. H. Zayd Syarif', 'L', '081311223344', 'Komplek Pengurus Pusat'),
      (${pimpinanP}, 'KH. Abdullah Ma''sum', 'L', '081122334455', 'Kediaman Pengasuh'),
      (${keamananP}, 'Ustadz Syamsuddin', 'L', '081566778899', 'Pos Keamanan Utama'),
      (${waliP}, 'Bapak H. Mansur (Wali Santri)', 'L', '085677889900', 'Jl. Raya Kediri No. 45')
    ON CONFLICT (id) DO NOTHING;
  `;

  await sql`
    INSERT INTO user_accounts (id, person_id, username, email, password_hash, role, status)
    VALUES 
      ('u-admin-01', ${adminP}, 'admin_mphm', 'admin@m.p3hm.my.id', 'admin123', 'Sekretariat', 'ACTIVE'),
      ('u-sek-pondok-01', ${sekPondokP}, 'sek_pondok', 'pondok@m.p3hm.my.id', 'admin123', 'sek.pondok', 'ACTIVE'),
      ('u-sek-madrasah-01', ${sekMadrasahP}, 'sek_madrasah', 'madrasah@m.p3hm.my.id', 'admin123', 'sek.madrasah', 'ACTIVE'),
      ('u-mustahiq-01', ${mustahiqP}, 'mustahiq01', 'mustahiq@mphm.or.id', 'mphm123', 'Mustahiq', 'ACTIVE'),
      ('u-mufattisy-01', ${mufattisyP}, 'mufattisy01', 'mufattisy@mphm.or.id', 'mphm123', 'Mufattisy', 'ACTIVE'),
      ('u-pimpinan-01', ${pimpinanP}, 'pimpinan01', 'pimpinan@mphm.or.id', 'mphm123', 'Mundzir', 'ACTIVE'),
      ('u-keamanan-01', ${keamananP}, 'keamanan01', 'keamanan@mphm.or.id', 'mphm123', 'Keamanan', 'ACTIVE'),
      ('u-wali-01', ${waliP}, 'wali01', 'wali01@gmail.com', 'mphm123', 'Wali Santri', 'ACTIVE')
    ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email;
  `;

  await sql`
    INSERT INTO teacher_profiles (id, person_id, teacher_code, status)
    VALUES ('t-mustahiq-01', ${mustahiqP}, 'GURU-2026-001', 'ACTIVE')
    ON CONFLICT (person_id) DO NOTHING;
  `;

  await sql`
    INSERT INTO guardian_profiles (id, person_id, family_card_number, relation)
    VALUES ('g-wali-01', ${waliP}, '3506123456780001', 'AYAH')
    ON CONFLICT (id) DO NOTHING;
  `;

  // 6. Dormitory Rooms
  console.log("🏠 6/9 Creating Dormitory Rooms...");
  const room1 = "room-aisyah-1";
  const room2 = "room-aisyah-2";
  const room3 = "room-fatimah-1";
  const room4 = "room-khadijah-1";

  await sql`
    INSERT INTO rooms (id, name, building_name, capacity, supervisor_id)
    VALUES 
      (${room1}, 'Asrama Aisyah 1', 'Gedung Aisyah', 20, ${mustahiqP}),
      (${room2}, 'Asrama Aisyah 2', 'Gedung Aisyah', 20, ${mustahiqP}),
      (${room3}, 'Asrama Fatimah 1', 'Gedung Fatimah', 25, ${mufattisyP}),
      (${room4}, 'Asrama Khadijah 1', 'Gedung Khadijah', 25, ${mufattisyP})
    ON CONFLICT (id) DO NOTHING;
  `;

  // 7. Academic Classes (Kelas Akademik 2026/2027)
  console.log("🏫 7/9 Creating Academic Classes...");
  const class1A = "c-1-ibtida-a";
  const class2A = "c-2-ibtida-a";
  const class1Tsanawi = "c-1-tsanawi-a";

  await sql`
    INSERT INTO academic_classes (id, academic_year_id, name, full_name, institution_level, level_number, mustahiq_id, curriculum_id)
    VALUES 
      (${class1A}, ${ayId2026}, '1 Ibtida''iyyah A', 'Kelas 1 Ibtida''iyyah A (Putra)', 'Ibtida''iyyah', 1, ${mustahiqP}, ${currId}),
      (${class2A}, ${ayId2026}, '2 Ibtida''iyyah A', 'Kelas 2 Ibtida''iyyah A (Putra)', 'Ibtida''iyyah', 2, ${mustahiqP}, ${currId}),
      (${class1Tsanawi}, ${ayId2026}, '1 Tsanawiyyah A', 'Kelas 1 Tsanawiyyah A (Putra)', 'Tsanawiyyah', 1, ${mufattisyP}, NULL)
    ON CONFLICT (id) DO NOTHING;
  `;

  // 8. Santri (Student Profiles) & Enrollments
  console.log("👨‍🎓 8/9 Creating Santri, Enrollments & Scores...");
  const santriData = [
    { id: "s-01", personId: "p-s-01", name: "Muhammad Ahmad Zaki", stambuk: "2026001", nis: "NIS-2026-001", nisn: "0081234561", roomId: room1 },
    { id: "s-02", personId: "p-s-02", name: "Ali Zainal Abidin", stambuk: "2026002", nis: "NIS-2026-002", nisn: "0081234562", roomId: room1 },
    { id: "s-03", personId: "p-s-03", name: "Umar Al-Faruq", stambuk: "2026003", nis: "NIS-2026-003", nisn: "0081234563", roomId: room2 },
    { id: "s-04", personId: "p-s-04", name: "Bilal Ramadhan", stambuk: "2026004", nis: "NIS-2026-004", nisn: "0081234564", roomId: room2 },
    { id: "s-05", personId: "p-s-05", name: "Usman Nurul Huda", stambuk: "2026005", nis: "NIS-2026-005", nisn: "0081234565", roomId: room3 },
  ];

  for (const s of santriData) {
    await sql`
      INSERT INTO people (id, full_name, gender, birth_place, birth_date, address)
      VALUES (${s.personId}, ${s.name}, 'L', 'Kediri', '2012-05-14', 'Jl. Santri Kediri')
      ON CONFLICT (id) DO NOTHING;
    `;

    await sql`
      INSERT INTO student_profiles (id, person_id, stambuk_number, nis, nisn, enrollment_year, status, room_id)
      VALUES (${s.id}, ${s.personId}, ${s.stambuk}, ${s.nis}, ${s.nisn}, 2026, 'ACTIVE', ${s.roomId})
      ON CONFLICT (nis) DO NOTHING;
    `;

    await sql`
      INSERT INTO class_enrollments (id, class_id, student_id, status)
      VALUES (${"enr-" + s.id}, ${class1A}, ${s.id}, 'ACTIVE')
      ON CONFLICT (class_id, student_id) DO NOTHING;
    `;

    // Nilai Kwartal 1 & 2
    await sql`
      INSERT INTO student_scores (id, class_id, student_id, subject_id, kwartal, score)
      VALUES 
        (${"sc-1-" + s.id}, ${class1A}, ${s.id}, ${subj1}, 1, 85.0),
        (${"sc-2-" + s.id}, ${class1A}, ${s.id}, ${subj2}, 1, 90.0),
        (${"sc-3-" + s.id}, ${class1A}, ${s.id}, ${subj3}, 1, 88.0)
      ON CONFLICT (class_id, student_id, subject_id, kwartal) DO NOTHING;
    `;

    // Kehadiran Bulan Ini
    await sql`
      INSERT INTO student_attendances (id, student_id, month, year, sick, permitted, unexcused)
      VALUES (${"att-" + s.id}, ${s.id}, 7, 2026, 0, 1, 0)
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // 9. Violation Types & Sample Violations
  console.log("⚠️ 9/9 Creating Violation Types & Initial Violations...");
  await sql`
    INSERT INTO violation_types (id, name, category, severity, points)
    VALUES 
      ('V-01', 'Terlambat Berjamaah Subuh', 'Kedisiplinan', 'RINGAN', 5),
      ('V-02', 'Tidak Membawa Al-Quran', 'Akademik', 'RINGAN', 5),
      ('V-03', 'Keluar Komplek Tanpa Izin', 'Kedisiplinan', 'BERAT', 25)
    ON CONFLICT (id) DO NOTHING;
  `;

  await sql`
    INSERT INTO student_violations (id, student_id, violation_type_id, penalty, notes)
    VALUES ('v-01', 's-02', 'V-01', 'Ta''zir Kebersihan Halaman', 'Terlambat mengikuti Jamaah Subuh')
    ON CONFLICT (id) DO NOTHING;
  `;

  // Audit Log Initial Entry
  await sql`
    INSERT INTO audit_logs (id, action, entity, after_state)
    VALUES ('log-init-01', 'INITIAL_SEED', 'SYSTEM', 'Initialized complete relational database seed for 2026/2027')
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log("======================================================");
  console.log("🎉 DATABASE MPHM ENTERPRISE BERHASIL DISINKRONKAN DAN DIISI!");
  console.log("======================================================");
}

seed().catch(err => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
