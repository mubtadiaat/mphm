CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`building_name` text NOT NULL,
	`capacity` integer DEFAULT 10 NOT NULL,
	`gender` text NOT NULL,
	`supervisor_id` text,
	`is_active` integer DEFAULT true,
	`deleted_at` integer,
	FOREIGN KEY (`supervisor_id`) REFERENCES `teacher_profiles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
ALTER TABLE student_profiles ADD `room_id` text REFERENCES rooms(id);--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_name_unique` ON `rooms` (`name`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/