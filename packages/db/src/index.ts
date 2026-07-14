import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Re-export semua schema untuk kemudahan import
export * from "./schema";

// Factory function: Buat Drizzle instance dari D1 binding
// Usage di Hono route: const db = createDb(c.env.DB);
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Type helper untuk return type createDb
export type Database = ReturnType<typeof createDb>;
