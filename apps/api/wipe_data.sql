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
-- 2. INSERT SYSTEM DEFAULTS
-- ============================================================

-- Admin Person
INSERT INTO people (id, nik, full_name, gender, phone_number) VALUES 
('person-admin-mphm-uuid', '0000000000000000', 'Admin MPHM', 'L', '080000000000');

-- Admin User Account (password is madrasahp3hm123)
INSERT INTO user_accounts (id, person_id, username, password_hash, role, is_active, created_at) VALUES
('user-admin-mphm-uuid', 'person-admin-mphm-uuid', 'admin_mphm', 'fc282fb6321b981ecc0eb2b6e1337c20:3b8a09f8f669a4511a91d1429aa081fc82346c61b6603315f0a58476ba417b2b', 'Sekretariat', 1, 1783900800);

-- Active Academic Year (1448/1449 H)
INSERT INTO academic_years (id, name, start_date, end_date, is_active, is_closed) VALUES
('year-2026-active', '1448/1449 H', '2026-07-10', '2027-06-25', 1, 0);

-- Curriculums
INSERT INTO curriculums (id, name, description, is_active) VALUES
('curr-pesantren-2026', 'Kurikulum Pesantren 2026', 'Kurikulum standar Kemenag dan Kepesantrenan', 1);

