import { createDb } from "@mphm/db";
import { sql } from "drizzle-orm";

async function test() {
  const db = createDb({} as any);
  try {
    const searchPattern = null;
    const targetYearId = "year-2026-active";
    const limit = 10;
    const offset = 0;
    
    const query = sql`
      SELECT 
        sp.id as id
      FROM student_profiles sp
      WHERE ${targetYearId} = 'test'
      AND (${searchPattern} IS NULL OR sp.stambuk_number LIKE ${searchPattern})
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Check what the SQL looks like
    console.log("SQL:", query.getSQL());
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
