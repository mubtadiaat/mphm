ALTER TABLE people ADD `nik` text;--> statement-breakpoint
CREATE UNIQUE INDEX `people_nik_unique` ON `people` (`nik`);