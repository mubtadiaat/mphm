DROP INDEX IF EXISTS `people_nik_unique`;--> statement-breakpoint
ALTER TABLE alumni_records ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE guardian_profiles ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE organization_memberships ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE student_profiles ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE teacher_profiles ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE class_enrollments ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE student_scores ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE student_violations ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE user_accounts ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `people` DROP COLUMN `nik`;