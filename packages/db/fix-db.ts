import "dotenv/config";
import { sql } from "drizzle-orm";
import { createDb } from "./src/index";

async function main() {
  const db = createDb();
  
  console.log("Dropping old columns to avoid Drizzle push conflicts...");
  try {
    await db.execute(sql`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "gender";`);
    console.log("Dropped rooms.gender");
  } catch (e: any) { console.log(e.message) }

  try {
    await db.execute(sql`ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "hijri_month" text;`);
    await db.execute(sql`ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "hijri_year" integer;`);
    await db.execute(sql`ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "sick_days" integer DEFAULT 0 NOT NULL;`);
    await db.execute(sql`ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "excused_days" integer DEFAULT 0 NOT NULL;`);
    await db.execute(sql`ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "unexcused_days" integer DEFAULT 0 NOT NULL;`);
    
    // Fill required columns for existing records
    await db.execute(sql`UPDATE "attendance_records" SET "hijri_month" = 'Muharram', "hijri_year" = 1447 WHERE "hijri_month" IS NULL;`);
    await db.execute(sql`ALTER TABLE "attendance_records" ALTER COLUMN "hijri_month" SET NOT NULL;`);
    await db.execute(sql`ALTER TABLE "attendance_records" ALTER COLUMN "hijri_year" SET NOT NULL;`);
    
    console.log("Added new columns to attendance_records");
  } catch (e: any) { console.log(e.message) }

  // Recreate index
  try {
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "unique_attendance_record" ON "attendance_records" ("class_id", "student_id", "hijri_month", "hijri_year");`);
    console.log("Created unique index");
  } catch (e: any) { console.log(e.message) }
  
  console.log("Done.");
  process.exit(0);
}

main();
