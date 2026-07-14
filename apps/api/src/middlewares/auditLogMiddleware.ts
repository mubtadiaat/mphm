import { Context, Next } from "hono";
import { createDb, auditLogs } from "@mphm/db";
import type { AppEnv } from "../types";

// ============================================================
// AUTOMATED FORENSICS AUDIT LOG ENGINE
// ============================================================
// Blueprint #08: Developer dilarang menuliskan fungsi pencatatan
// log audit secara manual di dalam controller. Middleware ini
// mencegat SEMUA operasi POST/PUT/DELETE secara otomatis.
//
// Features:
// - Before/After data pattern untuk PUT/DELETE
// - Background execution via c.executionCtx.waitUntil()
// - Capture user, IP, User Agent, module, action
export const auditLogMiddleware = (moduleName: string) => {
  return async (c: Context<AppEnv>, next: Next) => {
    const method = c.req.method;

    // Hanya audit operasi yang mengubah data
    if (method !== "POST" && method !== "PUT" && method !== "DELETE") {
      return await next();
    }

    // Capture pre-execution info
    const user = c.get("user");
    const ipAddress =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";
    const userAgent = c.req.header("user-agent") || "unknown";

    // Capture request body untuk afterData (clone karena body hanya bisa dibaca sekali)
    let requestBody: string | null = null;
    try {
      const clonedReq = c.req.raw.clone();
      requestBody = await clonedReq.text();
    } catch {
      // Body mungkin kosong atau tidak bisa dibaca
    }

    // Jalankan business logic handler
    await next();

    // Hanya audit jika response sukses (2xx)
    if (c.res.status >= 200 && c.res.status < 300) {
      // Capture afterData dari response
      let afterData: string | null = null;
      try {
        const clonedRes = c.res.clone();
        const resBody = await clonedRes.json() as any;
        afterData = JSON.stringify(resBody?.data || resBody);
      } catch {
        afterData = requestBody; // Fallback ke request body
      }

      // Map HTTP method ke action label
      const actionMap: Record<string, string> = {
        POST: "INSERT",
        PUT: "UPDATE",
        DELETE: "DELETE",
      };

      // Background execution — tidak blocking response
      const auditPromise = (async () => {
        try {
          const db = createDb(c.env.DB);
          await db.insert(auditLogs).values({
            userId: user?.userId || "anonymous",
            role: user?.role || "unknown",
            module: moduleName,
            action: actionMap[method] || method,
            beforeData: c.get("auditBeforeData") ? JSON.stringify(c.get("auditBeforeData")) : null,
            afterData,
            ipAddress,
            userAgent,
          });
        } catch (err) {
          console.error("[AUDIT LOG ERROR]", err);
        }
      })();

      // Gunakan waitUntil jika tersedia (Cloudflare Workers)
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(auditPromise);
      }
    }
  };
};
