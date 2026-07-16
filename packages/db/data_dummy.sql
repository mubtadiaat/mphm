-- SQL Script untuk Dummy Data (Mundzir, Mufattisy, Mustahiq, 15 Siswi, Wali Santri, Pengurus/Keamanan)
-- Dijalankan pada D1 menggunakan wrangler d1 execute

-- ============================================================
-- 1. DATA PENGURUS & STAF (Orang Dewasa)
-- ============================================================
INSERT INTO people (id, nik, full_name, gender, birth_place, birth_date, address, phone_number, created_at) VALUES 
('person-mundzir', '3200000000000001', 'Ust. Ahmad Mundzir', 'L', 'Bandung', '1985-05-12', 'Jl. Merdeka No.1', '081200000001', strftime('%s', 'now')),
('person-mufattisy', '3200000000000002', 'Ust. Budi Mufattisy', 'L', 'Jakarta', '1986-06-15', 'Jl. Sudirman No.2', '081200000002', strftime('%s', 'now')),
('person-mustahiq', '3200000000000003', 'Usth. Siti Mustahiq', 'P', 'Surabaya', '1990-08-20', 'Jl. Diponegoro No.3', '081200000003', strftime('%s', 'now')),
('person-keamanan', '3200000000000004', 'Bpk. Joko Keamanan', 'L', 'Yogyakarta', '1980-01-10', 'Jl. Malioboro No.4', '081200000004', strftime('%s', 'now')),
('person-wali-1', '3200000000000005', 'Bpk. Hasan Wali', 'L', 'Semarang', '1975-12-05', 'Jl. Pahlawan No.5', '081200000005', strftime('%s', 'now'));

-- ============================================================
-- 2. USER ACCOUNTS (Akun Login)
-- ============================================================
-- Password hash menggunakan bcrypt sederhana untuk kata sandi "password123"
INSERT INTO user_accounts (id, person_id, username, password_hash, role, is_active, created_at) VALUES
('acc-mundzir', 'person-mundzir', 'mundzir01', '$2a$10$X8H.h.OQ5lD9R3K.gO9a.OM9S0T6v.q8I8V4uJq2i5Z9C', 'Mundzir', 1, strftime('%s', 'now')),
('acc-mufattisy', 'person-mufattisy', 'mufattisy01', '$2a$10$X8H.h.OQ5lD9R3K.gO9a.OM9S0T6v.q8I8V4uJq2i5Z9C', 'Mufattisy', 1, strftime('%s', 'now')),
('acc-mustahiq', 'person-mustahiq', 'mustahiq01', '$2a$10$X8H.h.OQ5lD9R3K.gO9a.OM9S0T6v.q8I8V4uJq2i5Z9C', 'Mustahiq', 1, strftime('%s', 'now')),
('acc-keamanan', 'person-keamanan', 'keamanan01', '$2a$10$X8H.h.OQ5lD9R3K.gO9a.OM9S0T6v.q8I8V4uJq2i5Z9C', 'Petugas Keamanan', 1, strftime('%s', 'now')),
('acc-wali-1', 'person-wali-1', 'wali01', '$2a$10$X8H.h.OQ5lD9R3K.gO9a.OM9S0T6v.q8I8V4uJq2i5Z9C', 'Wali Santri', 1, strftime('%s', 'now'));

-- ============================================================
-- 3. ORGANISASI & PROFIL GURU/WALI
-- ============================================================
INSERT INTO organization_memberships (id, person_id, role_name, status) VALUES
('org-mundzir', 'person-mundzir', 'Mundzir', 'ACTIVE'),
('org-mufattisy', 'person-mufattisy', 'Mufattisy', 'ACTIVE'),
('org-keamanan', 'person-keamanan', 'Sie Keamanan', 'ACTIVE');

INSERT INTO teacher_profiles (id, person_id, teacher_code, status) VALUES
('teacher-mustahiq', 'person-mustahiq', 'UST-001', 'ACTIVE');

INSERT INTO guardian_profiles (id, person_id, family_card_number, relation) VALUES
('guardian-1', 'person-wali-1', '3200001111111111', 'AYAH');

-- ============================================================
-- 4. 15 DATA SANTRI / SISWI
-- ============================================================
INSERT INTO people (id, nik, full_name, gender, birth_place, birth_date, address) VALUES
('santri-01', '320101', 'Aisyah Putri', 'P', 'Bandung', '2008-01-01', 'Asrama 1'),
('santri-02', '320102', 'Khadijah Zahra', 'P', 'Jakarta', '2008-02-02', 'Asrama 1'),
('santri-03', '320103', 'Fatimah Nisa', 'P', 'Surabaya', '2008-03-03', 'Asrama 1'),
('santri-04', '320104', 'Zainab Qolby', 'P', 'Malang', '2008-04-04', 'Asrama 2'),
('santri-05', '320105', 'Ruqayyah Jamil', 'P', 'Bogor', '2008-05-05', 'Asrama 2'),
('santri-06', '320106', 'Ummu Kultsum', 'P', 'Cianjur', '2008-06-06', 'Asrama 2'),
('santri-07', '320107', 'Safiyah Ananda', 'P', 'Sukabumi', '2008-07-07', 'Asrama 3'),
('santri-08', '320108', 'Hafshah Mufida', 'P', 'Tasikmalaya', '2008-08-08', 'Asrama 3'),
('santri-09', '320109', 'Maimunah Laila', 'P', 'Cirebon', '2008-09-09', 'Asrama 3'),
('santri-10', '320110', 'Asma Nadia', 'P', 'Garut', '2008-10-10', 'Asrama 4'),
('santri-11', '320111', 'Sarah Fitria', 'P', 'Purwakarta', '2008-11-11', 'Asrama 4'),
('santri-12', '320112', 'Hajar Syifa', 'P', 'Karawang', '2008-12-12', 'Asrama 4'),
('santri-13', '320113', 'Maryam Rindu', 'P', 'Bekasi', '2009-01-13', 'Asrama 5'),
('santri-14', '320114', 'Nusaibah Binti', 'P', 'Depok', '2009-02-14', 'Asrama 5'),
('santri-15', '320115', 'Syifa Ulya', 'P', 'Tangerang', '2009-03-15', 'Asrama 5');

INSERT INTO student_profiles (id, person_id, stambuk_number, nis, nisn, enrollment_year, status) VALUES
('prof-01', 'santri-01', 'ST-2023-001', 'NIS-001', 'NISN-001', 2023, 'ACTIVE'),
('prof-02', 'santri-02', 'ST-2023-002', 'NIS-002', 'NISN-002', 2023, 'ACTIVE'),
('prof-03', 'santri-03', 'ST-2023-003', 'NIS-003', 'NISN-003', 2023, 'ACTIVE'),
('prof-04', 'santri-04', 'ST-2023-004', 'NIS-004', 'NISN-004', 2023, 'ACTIVE'),
('prof-05', 'santri-05', 'ST-2023-005', 'NIS-005', 'NISN-005', 2023, 'ACTIVE'),
('prof-06', 'santri-06', 'ST-2023-006', 'NIS-006', 'NISN-006', 2023, 'ACTIVE'),
('prof-07', 'santri-07', 'ST-2023-007', 'NIS-007', 'NISN-007', 2023, 'ACTIVE'),
('prof-08', 'santri-08', 'ST-2023-008', 'NIS-008', 'NISN-008', 2023, 'ACTIVE'),
('prof-09', 'santri-09', 'ST-2023-009', 'NIS-009', 'NISN-009', 2023, 'ACTIVE'),
('prof-10', 'santri-10', 'ST-2023-010', 'NIS-010', 'NISN-010', 2023, 'ACTIVE'),
('prof-11', 'santri-11', 'ST-2023-011', 'NIS-011', 'NISN-011', 2023, 'ACTIVE'),
('prof-12', 'santri-12', 'ST-2023-012', 'NIS-012', 'NISN-012', 2023, 'ACTIVE'),
('prof-13', 'santri-13', 'ST-2023-013', 'NIS-013', 'NISN-013', 2023, 'ACTIVE'),
('prof-14', 'santri-14', 'ST-2023-014', 'NIS-014', 'NISN-014', 2023, 'ACTIVE'),
('prof-15', 'santri-15', 'ST-2023-015', 'NIS-015', 'NISN-015', 2023, 'ACTIVE');

-- ============================================================
-- 5. RELASI SANTRI DENGAN WALI SANTRI
-- ============================================================
-- Relasikan 1 wali ke beberapa santri dummy (misal 3 santri pertama)
-- (Pastikan tabel student_guardian_relations ada. Jika schema menggunakan pola lain, sesuaikan)
-- INSERT INTO student_guardian_relations (id, student_id, guardian_id, is_primary) VALUES
-- ('rel-01', 'santri-01', 'person-wali-1', 1),
-- ('rel-02', 'santri-02', 'person-wali-1', 1),
-- ('rel-03', 'santri-03', 'person-wali-1', 1);
