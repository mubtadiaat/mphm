CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`nik` text,
	`full_name` text NOT NULL,
	`gender` text NOT NULL,
	`birth_place` text,
	`birth_date` text,
	`address` text,
	`phone_number` text,
	`avatar_url` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `alumni_records` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`graduation_year` integer NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `guardian_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`family_card_number` text NOT NULL,
	`relation` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `organization_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`role_name` text NOT NULL,
	`status` text DEFAULT 'ACTIVE',
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`stambuk_number` text NOT NULL,
	`nis` text NOT NULL,
	`nisn` text,
	`enrollment_year` integer NOT NULL,
	`status` text DEFAULT 'ACTIVE',
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `teacher_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`teacher_code` text NOT NULL,
	`status` text DEFAULT 'ACTIVE',
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `curriculum_subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`curriculum_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`institution_level` text NOT NULL,
	`class_level` text NOT NULL,
	FOREIGN KEY (`curriculum_id`) REFERENCES `curriculums`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `curriculums` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`subject_type` text DEFAULT 'NON_MAPEL',
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`module` text NOT NULL,
	`action` text NOT NULL,
	`before_data` text,
	`after_data` text,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `academic_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`academic_year_id` text NOT NULL,
	`curriculum_id` text NOT NULL,
	`institution_level` text NOT NULL,
	`class_level` text NOT NULL,
	`section` text NOT NULL,
	`full_name` text NOT NULL,
	`mustahiq_id` text NOT NULL,
	`capacity` integer DEFAULT 35 NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`curriculum_id`) REFERENCES `curriculums`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`mustahiq_id`) REFERENCES `teacher_profiles`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `academic_history` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`academic_year_id` text NOT NULL,
	`institution_level` text NOT NULL,
	`class_id` text NOT NULL,
	`status` text NOT NULL,
	`promotion_transaction_id` text,
	`override_reason` text,
	`recorded_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `academic_years` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_active` integer DEFAULT false,
	`is_closed` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `class_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`status` text DEFAULT 'ACTIVE',
	`enrolled_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`class_id`) REFERENCES `academic_classes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `student_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`kwartal` integer NOT NULL,
	`score` real NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`class_id`) REFERENCES `academic_classes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `student_violations` (
	`id` text PRIMARY KEY NOT NULL,
	`academic_year_id` text NOT NULL,
	`student_id` text NOT NULL,
	`violation_type_id` text NOT NULL,
	`incident_date` text NOT NULL,
	`incident_time` text,
	`location` text,
	`description` text,
	`reported_by` text NOT NULL,
	`evidence_url` text,
	`status` text DEFAULT 'RECORDED',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `violation_types` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`severity_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`points` integer,
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`category_id`) REFERENCES `violation_categories`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`severity_id`) REFERENCES `violation_severities`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `user_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true,
	`last_login_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_token` text NOT NULL,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`academic_year_id` text NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`date` text NOT NULL,
	`session` text NOT NULL,
	`status` text DEFAULT 'HADIR' NOT NULL,
	`notes` text,
	`recorded_by` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`class_id`) REFERENCES `academic_classes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `violation_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `violation_severities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`level` integer NOT NULL,
	`badge_color` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `people_nik_unique` ON `people` (`nik`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `people` (`full_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `student_profiles_stambuk_number_unique` ON `student_profiles` (`stambuk_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `student_profiles_nis_unique` ON `student_profiles` (`nis`);--> statement-breakpoint
CREATE UNIQUE INDEX `student_profiles_nisn_unique` ON `student_profiles` (`nisn`);--> statement-breakpoint
CREATE UNIQUE INDEX `teacher_profiles_teacher_code_unique` ON `teacher_profiles` (`teacher_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_curriculum_mapping` ON `curriculum_subjects` (`curriculum_id`,`subject_id`,`institution_level`,`class_level`);--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_code_unique` ON `subjects` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_accounts_username_unique` ON `user_accounts` (`username`);--> statement-breakpoint
CREATE INDEX `user_accounts_person_idx` ON `user_accounts` (`person_id`);--> statement-breakpoint
CREATE INDEX `user_accounts_role_idx` ON `user_accounts` (`role`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_session_token_unique` ON `user_sessions` (`session_token`);--> statement-breakpoint
CREATE INDEX `user_sessions_token_idx` ON `user_sessions` (`session_token`);--> statement-breakpoint
CREATE INDEX `user_sessions_user_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_expiry_idx` ON `user_sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_attendance_record` ON `attendance_records` (`class_id`,`student_id`,`date`,`session`);--> statement-breakpoint
CREATE INDEX `attendance_date_idx` ON `attendance_records` (`date`);--> statement-breakpoint
CREATE INDEX `attendance_class_date_idx` ON `attendance_records` (`class_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_student_idx` ON `attendance_records` (`student_id`);--> statement-breakpoint
CREATE INDEX `attendance_year_idx` ON `attendance_records` (`academic_year_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `violation_categories_name_unique` ON `violation_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `violation_severities_name_unique` ON `violation_severities` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `violation_severities_level_unique` ON `violation_severities` (`level`);