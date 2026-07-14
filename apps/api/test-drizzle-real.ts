import { createDb } from "@mphm/db";
import { sql } from "drizzle-orm";
import { env } from "process";
import { D1Database } from "@cloudflare/workers-types";
// Mock D1 to just see if it runs, or I can use the local D1 from wrangler.
// Actually, we can't easily run against local D1 from Node.js because D1 bindings are only available in wrangler dev.
