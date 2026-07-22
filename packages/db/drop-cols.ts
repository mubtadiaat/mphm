import "dotenv/config";
import { sql } from "drizzle-orm";
import { createDb } from "./src/index";

async function main() {
  const db = createDb();
  
  try {
    await db.execute(sql`ALTER TABLE "organization_memberships" RENAME COLUMN "role_name" TO "role";`);
    await db.execute(sql`ALTER TABLE "organization_memberships" ADD COLUMN IF NOT EXISTS "service_year" text DEFAULT '2024/2025' NOT NULL;`);
    console.log("Renamed role_name to role and added service_year");
  } catch (e: any) { console.log(e.message) }
  
  console.log("Done.");
  process.exit(0);
}

main();
