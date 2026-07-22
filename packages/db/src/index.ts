import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Re-export semua schema untuk kemudahan import
export * from "./schema";

// Factory function: Buat Drizzle instance dari env Vercel
export function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

// Type helper untuk return type createDb
export type Database = ReturnType<typeof createDb>;
