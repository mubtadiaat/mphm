import { Hono } from "hono";
import { createDb, auditLogs } from "@mphm/db";
import type { AppEnv } from "../../types";
import { requireRole } from "../../middlewares/rbacMiddleware";
import { desc } from "drizzle-orm";

const auditLogsAdmin = new Hono<AppEnv>();

auditLogsAdmin.use("*", requireRole(["Sekretariat"]));

auditLogsAdmin.get("/", async (c) => {
  const db = createDb();
  const list = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.timestamp))
    ;
  return c.json({ status: "Success", data: list });
});

export default auditLogsAdmin;
