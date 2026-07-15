PRAGMA foreign_keys = OFF;
DELETE FROM user_sessions;
DELETE FROM user_accounts;
DELETE FROM organization_memberships;
DELETE FROM alumni_records;
DELETE FROM guardian_profiles;
DELETE FROM teacher_profiles;
DELETE FROM student_profiles;
DELETE FROM people;

INSERT INTO people (id, nik, full_name, gender, phone_number) VALUES 
('person-admin-mphm-uuid', '0000000000000000', 'Admin MPHM', 'L', '080000000000');

INSERT INTO user_accounts (id, person_id, username, password_hash, role, is_active, created_at) VALUES
('user-admin-mphm-uuid', 'person-admin-mphm-uuid', 'admin_mphm', 'fc282fb6321b981ecc0eb2b6e1337c20:3b8a09f8f669a4511a91d1429aa081fc82346c61b6603315f0a58476ba417b2b', 'Sekretariat', 1, 1783900800);

PRAGMA foreign_keys = ON;
