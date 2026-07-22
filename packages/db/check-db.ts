import "dotenv/config";
import { sql } from "drizzle-orm";
import { createDb } from "./src/index";

async function main() {
  const db = createDb();
  
  try {
    const res = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'organization_memberships';
    `);
    console.log("organization_memberships columns:", res.rows.map(r => r.column_name));
  } catch (e: any) { console.log(e.message) }
  
  console.log("Done.");
  process.exit(0);
}

main();
