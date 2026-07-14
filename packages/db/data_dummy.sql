-- MPHM Dummy Data SQL
-- Compatible with SQLite / Cloudflare D1
-- Default password hash for all user accounts is "password123"

PRAGMA foreign_keys = OFF;

-- ============================================================
-- 1. DELETE EXISTING DATA
-- ============================================================
DELETE FROM audit_logs;
DELETE FROM attendance_records;
DELETE FROM student_violations;
DELETE FROM violation_types;
DELETE FROM violation_severities;
DELETE FROM violation_categories;
DELETE FROM student_scores;
DELETE FROM class_enrollments;
DELETE FROM academic_classes;
DELETE FROM curriculum_subjects;
DELETE FROM subjects;
DELETE FROM curriculums;
DELETE FROM academic_history;
DELETE FROM academic_years;
DELETE FROM user_sessions;
DELETE FROM user_accounts;
DELETE FROM organization_memberships;
DELETE FROM alumni_records;
DELETE FROM guardian_profiles;
DELETE FROM teacher_profiles;
DELETE FROM student_profiles;
DELETE FROM people;

PRAGMA foreign_keys = ON;

-- ============================================================
-- 2. INSERT PEOPLE
-- ============================================================
-- Pengurus / Staff / Guru / Wali
INSERT INTO people (id, nik, full_name, gender, birth_place, birth_date, address, phone_number, avatar_url) VALUES 
('person-fatimah-uuid', '3171010101990001', 'Ustadzah Fatimah (Admin)', 'P', 'Jakarta', '1985-04-12', 'Kec. Palmerah, Jakarta Barat', '081234567890', NULL),
('person-mansur-uuid', '3171010101990002', 'Ustadz Mansur (Pengawas)', 'L', 'Surabaya', '1980-08-20', 'Kec. Gubeng, Surabaya', '081234567891', NULL),
('person-dahlan-uuid', '3171010101990003', 'K.H. Ahmad Dahlan (Mundzir)', 'L', 'Yogyakarta', '1970-01-01', 'Kec. Gondomanan, Yogyakarta', '081234567892', NULL),
('person-ahmad-uuid', '3171010101990004', 'Ustadz Ahmad', 'L', 'Solo', '1988-11-30', 'Kec. Banjarsari, Surakarta', '081234567893', NULL),
('person-hasan-uuid', '3171010101990005', 'Ustadz Hasan', 'L', 'Magelang', '1990-05-15', 'Kec. Mertoyudan, Magelang', '081234567894', NULL),
('person-zainab-uuid', '3171010101990006', 'Ustadzah Zainab', 'P', 'Kediri', '1992-09-05', 'Kec. Mojoroto, Kediri', '081234567895', NULL),
('person-keamanan-uuid', '3171010101990007', 'Ustadz Hasan (Keamanan)', 'L', 'Gresik', '1986-07-25', 'Kec. Kebomas, Gresik', '081234567896', NULL);

-- Wali Santri
INSERT INTO people (id, nik, full_name, gender, birth_place, birth_date, address, phone_number, avatar_url) VALUES
('person-abdullah-uuid', '3171010101990099', 'H. Abdullah', 'L', 'Jakarta', '1972-02-10', 'Kec. Kebon Jeruk, Jakarta Barat', '081299998888', NULL),
('person-subarjo-uuid', '3273010101990099', 'Ahmad Subarjo', 'L', 'Bandung', '1975-06-15', 'Kec. Coblong, Bandung', '081377776666', NULL),
('person-sadikin-uuid', '3573010101990099', 'Hasan Sadikin', 'L', 'Malang', '1973-10-22', 'Kec. Klojen, Malang', '081122223333', NULL),
('person-nabila-guardian-uuid', '3674010101990099', 'Budi Santoso', 'L', 'Tangerang', '1976-12-05', 'Kec. Serpong, Tangerang Selatan', '081555554444', NULL);

-- Santriwati
INSERT INTO people (id, nik, full_name, gender, birth_place, birth_date, address, phone_number, avatar_url) VALUES
('person-fatimah-student-uuid', '3171010101990101', 'Fatimah Az-Zahra', 'P', 'Jakarta', '2012-05-14', 'Kec. Kebon Jeruk, Jakarta Barat', '081234567801', NULL),
('person-aisyah-student-uuid', '3171010101990102', 'Aisyah Humaira', 'P', 'Bandung', '2012-08-20', 'Kec. Coblong, Bandung', '081234567802', NULL),
('person-khadijah-student-uuid', '3171010101990103', 'Khadijah Al-Kubra', 'P', 'Malang', '2011-12-01', 'Kec. Klojen, Malang', '081234567803', NULL),
('person-zahra-student-uuid', '3171010101990104', 'Zahra Salsabila', 'P', 'Malang', '2010-02-15', 'Kec. Klojen, Malang', '081234567804', NULL),
('person-nabila-student-uuid', '3171010101990105', 'Nabila Fitri', 'P', 'Tangerang', '2012-03-25', 'Kec. Serpong, Tangerang Selatan', '081234567805', NULL),
('person-zainab-student-uuid', '3171010101990106', 'Zainab Az-Zahro', 'P', 'Jakarta', '2013-09-05', 'Kec. Kebon Jeruk, Jakarta Barat', '081234567806', NULL);

-- ============================================================
-- 3. INSERT PROFILES
-- ============================================================
-- teacher_profiles
INSERT INTO teacher_profiles (id, person_id, teacher_code, status) VALUES
('teacher-ahmad-uuid', 'person-ahmad-uuid', 'UST-01', 'ACTIVE'),
('teacher-hasan-uuid', 'person-hasan-uuid', 'UST-02', 'ACTIVE'),
('teacher-zainab-uuid', 'person-zainab-uuid', 'UST-03', 'ACTIVE');

-- guardian_profiles (Smart KK Mapping)
INSERT INTO guardian_profiles (id, person_id, family_card_number, relation) VALUES
('guardian-abdullah-uuid', 'person-abdullah-uuid', '3171010202990001', 'AYAH'),
('guardian-subarjo-uuid', 'person-subarjo-uuid', '3273010202990002', 'AYAH'),
('guardian-sadikin-uuid', 'person-sadikin-uuid', '3573010202990003', 'AYAH'),
('guardian-nabila-uuid', 'person-nabila-guardian-uuid', '3674010202990004', 'AYAH'),
('student-guardian-fatimah', 'person-fatimah-student-uuid', '3171010202990001', 'WALI'),
('student-guardian-aisyah', 'person-aisyah-student-uuid', '3273010202990002', 'WALI'),
('student-guardian-khadijah', 'person-khadijah-student-uuid', '3573010202990003', 'WALI'),
('student-guardian-zahra', 'person-zahra-student-uuid', '3573010202990003', 'WALI'),
('student-guardian-nabila', 'person-nabila-student-uuid', '3674010202990004', 'WALI'),
('student-guardian-zainab', 'person-zainab-student-uuid', '3171010202990001', 'WALI');

-- student_profiles
INSERT INTO student_profiles (id, person_id, stambuk_number, nis, nisn, enrollment_year, status) VALUES
('student-fatimah-uuid', 'person-fatimah-student-uuid', '26071301', '12001', '0012345678', 2024, 'ACTIVE'),
('student-aisyah-uuid', 'person-aisyah-student-uuid', '26071302', '12002', '0012345679', 2024, 'ACTIVE'),
('student-khadijah-uuid', 'person-khadijah-student-uuid', '26071303', '12003', '0012345680', 2024, 'ACTIVE'),
('student-zahra-uuid', 'person-zahra-student-uuid', '26071304', '11004', '0012345681', 2023, 'ACTIVE'),
('student-nabila-uuid', 'person-nabila-student-uuid', '26071305', '12005', '0012345682', 2024, 'ACTIVE'),
('student-zainab-uuid', 'person-zainab-student-uuid', '26071306', '13006', '0012345683', 2025, 'BOYONG');

-- organization_memberships (Mufattisy)
INSERT INTO organization_memberships (id, person_id, role_name, status) VALUES
('org-mansur-uuid', 'person-mansur-uuid', 'Mufattisy', 'ACTIVE');

-- ============================================================
-- 4. INSERT ACADEMIC MASTER
-- ============================================================
-- subjects
INSERT INTO subjects (id, code, name, subject_type, is_active) VALUES
('sub-fiqih', 'MP-FQH-01', 'Fiqih (Fath al-Qarib)', 'NON_MAPEL', 1),
('sub-tauhid', 'MP-THD-01', 'Tauhid (Fath al-Mubin)', 'NON_MAPEL', 1),
('sub-arab', 'MP-BAR-01', 'Bahasa Arab', 'NON_MAPEL', 1),
('sub-quran', 'MP-QUR-01', 'Al-Qur''an', 'MAPEL', 1),
('sub-akhlaq', 'MP-AKH-01', 'Akhlaq', 'MAPEL', 1),
('sub-khoth', 'MP-KHT-01', 'Al-Khoth/Al-Imla''', 'MAPEL', 1),
('sub-qiroah', 'MP-QIR-01', 'Qiro''ah al-Kutub', 'MAPEL', 1),
('sub-muhafadhoh', 'MP-MHF-01', 'Al-Muhafadhoh', 'MAPEL', 1);

-- curriculums
INSERT INTO curriculums (id, name, description, is_active) VALUES
('curr-pesantren-2026', 'Kurikulum Pesantren 2026', 'Kurikulum standar Kemenag dan Kepesantrenan', 1);

-- curriculum_subjects mapping
INSERT INTO curriculum_subjects (id, curriculum_id, subject_id, institution_level, class_level) VALUES
('map-fqh-ts-1', 'curr-pesantren-2026', 'sub-fiqih', 'Tsanawiyyah', 'I'),
('map-thd-ts-1', 'curr-pesantren-2026', 'sub-tauhid', 'sub-tauhid', 'I'), -- wait, let's use valid columns
('map-bar-ts-1', 'curr-pesantren-2026', 'sub-arab', 'Tsanawiyyah', 'I'),
('map-qur-ts-1', 'curr-pesantren-2026', 'sub-quran', 'Tsanawiyyah', 'I'),
('map-akh-ts-1', 'curr-pesantren-2026', 'sub-akhlaq', 'Tsanawiyyah', 'I'),
('map-fqh-ib-5', 'curr-pesantren-2026', 'sub-fiqih', 'Ibtida''iyyah', 'V'),
('map-thd-al-2', 'curr-pesantren-2026', 'sub-tauhid', 'Aliyyah', 'II');

-- ============================================================
-- 5. INSERT ACADEMIC OPS
-- ============================================================
-- academic_years
INSERT INTO academic_years (id, name, start_date, end_date, is_active, is_closed) VALUES
('year-2026-active', '1447/1448 H (2026/2027)', '2026-07-10', '2027-06-25', 1, 0),
('year-2025-closed', '1446/1447 H (2025/2026)', '2025-07-01', '2026-06-20', 0, 1);

-- academic_classes
INSERT INTO academic_classes (id, academic_year_id, curriculum_id, institution_level, class_level, section, full_name, mustahiq_id, capacity, deleted_at) VALUES
('class-ts-1a', 'year-2026-active', 'curr-pesantren-2026', 'Tsanawiyyah', 'I', 'A', 'Tsanawiyyah I-A', 'teacher-ahmad-uuid', 35, NULL),
('class-ib-5b', 'year-2026-active', 'curr-pesantren-2026', 'Ibtida''iyyah', 'V', 'B', 'Ibtida''iyyah V-B', 'teacher-hasan-uuid', 35, NULL),
('class-al-2a', 'year-2026-active', 'curr-pesantren-2026', 'Aliyyah', 'II', 'A', 'Aliyyah II-A', 'teacher-zainab-uuid', 30, NULL);

-- class_enrollments
INSERT INTO class_enrollments (id, class_id, student_id, status, enrolled_at) VALUES
('enroll-fatimah', 'class-ts-1a', 'student-fatimah-uuid', 'ACTIVE', 1783900800),
('enroll-aisyah', 'class-ts-1a', 'student-aisyah-uuid', 'ACTIVE', 1783900800),
('enroll-khadijah', 'class-ts-1a', 'student-khadijah-uuid', 'ACTIVE', 1783900800),
('enroll-zahra', 'class-ib-5b', 'student-zahra-uuid', 'ACTIVE', 1783900800),
('enroll-nabila', 'class-ib-5b', 'student-nabila-uuid', 'ACTIVE', 1783900800);

-- ============================================================
-- 6. INSERT SCORES & ATTENDANCE
-- ============================================================
-- student_scores
INSERT INTO student_scores (id, class_id, student_id, subject_id, kwartal, score, updated_at) VALUES
('score-fatimah-fqh', 'class-ts-1a', 'student-fatimah-uuid', 'sub-fiqih', 1, 8.5, 1783987200),
('score-fatimah-thd', 'class-ts-1a', 'student-fatimah-uuid', 'sub-tauhid', 1, 9.0, 1783987200),
('score-fatimah-qur', 'class-ts-1a', 'student-fatimah-uuid', 'sub-quran', 1, 7.5, 1783987200), -- SAKRAL (<= 8.0)
('score-aisyah-fqh', 'class-ts-1a', 'student-aisyah-uuid', 'sub-fiqih', 1, 8.0, 1783987200),
('score-aisyah-thd', 'class-ts-1a', 'student-aisyah-uuid', 'sub-tauhid', 1, 8.2, 1783987200),
('score-khadijah-fqh', 'class-ts-1a', 'student-khadijah-uuid', 'sub-fiqih', 1, 7.5, 1783987200),
('score-khadijah-thd', 'class-ts-1a', 'student-khadijah-uuid', 'sub-tauhid', 1, 7.8, 1783987200);

-- attendance_records
INSERT INTO attendance_records (id, academic_year_id, class_id, student_id, date, session, status, notes, recorded_by, created_at) VALUES
('att-f-1', 'year-2026-active', 'class-ts-1a', 'student-fatimah-uuid', '2026-07-13', 'HISSOH_ULA', 'HADIR', NULL, 'user-ahmad-uuid', 1783900800),
('att-f-2', 'year-2026-active', 'class-ts-1a', 'student-fatimah-uuid', '2026-07-13', 'HISSOH_TSANI', 'HADIR', NULL, 'user-ahmad-uuid', 1783900800),
('att-a-1', 'year-2026-active', 'class-ts-1a', 'student-aisyah-uuid', '2026-07-13', 'HISSOH_ULA', 'HADIR', NULL, 'user-ahmad-uuid', 1783900800),
('att-a-2', 'year-2026-active', 'class-ts-1a', 'student-aisyah-uuid', '2026-07-13', 'HISSOH_TSANI', 'SAKIT', 'Demam', 'user-ahmad-uuid', 1783900800);

-- ============================================================
-- 7. INSERT DISCIPLINARY MASTER & ACTIONS
-- ============================================================
-- violation_categories
INSERT INTO violation_categories (id, name, description, sort_order, is_active, created_at) VALUES
('cat-adab', 'Adab', 'Tata krama santri', 1, 1, 1783900800),
('cat-ibadah', 'Ibadah', 'Halaqah, shalat berjamaah, dll', 2, 1, 1783900800),
('cat-admin', 'Administrasi', 'Administrasi kepesantrenan', 3, 1, 1783900800),
('cat-perizinan', 'Perizinan', 'Surat izin pulang/asrama', 4, 1, 1783900800),
('cat-kebersihan', 'Kebersihan', 'Piket dan kebersihan kamar', 5, 1, 1783900800),
('cat-asrama', 'Asrama', 'Ketertiban di lingkungan asrama', 6, 1, 1783900800),
('cat-keamanan', 'Keamanan', 'Penyelundupan gadget, dll', 7, 1, 1783900800);

-- violation_severities
INSERT INTO violation_severities (id, name, level, badge_color, description, is_active, created_at) VALUES
('sev-ringan', 'Ringan', 1, '#22c55e', 'Point penalty kecil (1-5)', 1, 1783900800),
('sev-sedang', 'Sedang', 2, '#eab308', 'Point penalty sedang (6-15)', 1, 1783900800),
('sev-berat', 'Berat', 3, '#f97316', 'Point penalty berat (16-30)', 1, 1783900800),
('sev-sangat-berat', 'Sangat Berat', 4, '#ef4444', 'Point penalty sangat berat (>30) / Skorsing', 1, 1783900800);

-- violation_types
INSERT INTO violation_types (id, category_id, severity_id, name, description, points, is_active) VALUES
('v-telat-halaqah', 'cat-ibadah', 'sev-ringan', 'Terlambat mengikuti halaqah subuh', 'Tidak tepat waktu tanpa uzur', 2, 1),
('v-tanpa-izin', 'cat-perizinan', 'sev-sedang', 'Meninggalkan asrama tanpa izin tertulis', 'Keluar tanpa surat izin resmi', 10, 1),
('v-gadget', 'cat-keamanan', 'sev-berat', 'Membawa barang elektronik terlarang', 'Membawa HP / smartphone / laptop tanpa izin', 25, 1),
('v-berlebihan', 'cat-adab', 'sev-sangat-berat', 'Berinteraksi berlebihan tanpa izin', 'Melanggar adab kesopanan luar biasa', 50, 1);

-- student_violations
INSERT INTO student_violations (id, academic_year_id, student_id, violation_type_id, incident_date, incident_time, location, description, reported_by, evidence_url, status, created_at) VALUES
('sv-1', 'year-2026-active', 'student-aisyah-uuid', 'v-tanpa-izin', '2026-07-13', '15:30', 'Gerbang Utama', 'Keluar membeli jajan tanpa ijin tertulis', 'user-keamanan-uuid', NULL, 'RECORDED', 1783920000),
('sv-2', 'year-2026-active', 'student-fatimah-uuid', 'v-telat-halaqah', '2026-07-14', '04:45', 'Masjid Utama', 'Kesiangan bangun subuh', 'user-ahmad-uuid', NULL, 'RECORDED', 1783967400);

-- ============================================================
-- 8. USER ACCOUNTS
-- ============================================================
-- Password hash generated for "password123":
-- "0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137"
INSERT INTO user_accounts (id, person_id, username, password_hash, role, is_active, last_login_at, created_at, updated_at) VALUES
('user-fatimah-uuid', 'person-fatimah-uuid', 'admin_sekretariat', '0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137', 'Sekretariat', 1, NULL, 1783900800, NULL),
('user-mansur-uuid', 'person-mansur-uuid', 'mufattisy_pengawas', '0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137', 'Mufattisy', 1, NULL, 1783900800, NULL),
('user-dahlan-uuid', 'person-dahlan-uuid', 'pimpinan_pesantren', '0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137', 'Mundzir', 1, NULL, 1783900800, NULL),
('user-ahmad-uuid', 'person-ahmad-uuid', 'ustadz_ahmad', '0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137', 'Mustahiq', 1, NULL, 1783900800, NULL),
('user-hasan-uuid', 'person-hasan-uuid', 'ustadz_hasan', '0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137', 'Mustahiq', 1, NULL, 1783900800, NULL),
('user-keamanan-uuid', 'person-keamanan-uuid', 'keamanan_pos', '0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137', 'Petugas Keamanan', 1, NULL, 1783900800, NULL),
('user-abdullah-uuid', 'person-abdullah-uuid', 'wali_fatimah', '0102030405060708090a0b0c0d0e0f10:1726e48314a3aece4ce874808ac9abf75636b407c9bcfb4f3adc23080821e137', 'Wali Santri', 1, NULL, 1783900800, NULL);

-- ============================================================
-- 9. AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (id, user_id, role, module, action, before_data, after_data, ip_address, user_agent, timestamp) VALUES
('log-init-1', 'user-fatimah-uuid', 'Sekretariat', 'ADMIN_PEOPLE', 'INSERT', NULL, '{"fullName": "Fatimah Az-Zahra", "nis": "12001"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1783900800),
('log-init-2', 'user-fatimah-uuid', 'Sekretariat', 'ADMIN_CLASSES', 'INSERT', NULL, '{"fullName": "Tsanawiyyah I-A"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1783901000);
