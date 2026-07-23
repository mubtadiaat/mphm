import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  userId?: string | null;
  action: string; // e.g. "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "POST", "PUT"
  entity: string; // e.g. "AUTH", "USER", "SANTRI", "CLASS", "ROOM", "VIOLATION", "SCORE"
  entityId?: string | null;
  beforeState?: Record<string, any> | string | null;
  afterState?: Record<string, any> | string | null;
}

/**
 * Creates an audit log entry AND purges logs older than 24 hours (rolling 24-hour retention).
 */
export async function createAuditLog(params: LogAuditParams) {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Asynchronously purge logs older than 24 hours
    prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    }).catch(err => console.error("AUDIT_LOG_PURGE_ERROR:", err));

    // 2. Create the new audit record
    const beforeStr = params.beforeState 
      ? (typeof params.beforeState === "string" ? params.beforeState : JSON.stringify(params.beforeState))
      : null;
    const afterStr = params.afterState 
      ? (typeof params.afterState === "string" ? params.afterState : JSON.stringify(params.afterState))
      : null;

    await prisma.auditLog.create({
      data: {
        userId: params.userId || "SYSTEM",
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        beforeState: beforeStr,
        afterState: afterStr,
      },
    });
  } catch (err: any) {
    console.error("CREATE_AUDIT_LOG_ERROR:", err?.message || err);
  }
}

/**
 * Cleans up audit logs older than 24 hours.
 */
export async function purgeOldAuditLogs() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });
  } catch (err: any) {
    console.error("PURGE_AUDIT_LOGS_ERROR:", err?.message || err);
  }
}
