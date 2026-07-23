import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purgeOldAuditLogs } from "@/lib/auditLog";

export async function GET(req: NextRequest) {
  try {
    // 1. Purge logs older than 24 hours
    await purgeOldAuditLogs();

    // 2. Fetch logs within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ status: "Success", data: logs });
  } catch (err: any) {
    console.error("AUDIT_LOGS_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
