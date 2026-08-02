import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purgeOldAuditLogs } from "@/lib/auditLog";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || undefined;

    // 1. Purge logs older than 24 hours
    await purgeOldAuditLogs();

    // 2. Fetch logs within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [logs, userAccounts] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 300,
      }),
      (prisma.userAccount as any).findMany({
        select: { username: true, role: true, institution: true, person: { select: { fullName: true } } }
      })
    ]);

    const userRoleMap = new Map<string, { role: string; fullName: string; institution: string }>();
    userAccounts.forEach((u: any) => {
      userRoleMap.set(u.username, { role: u.role, fullName: u.person?.fullName || u.username, institution: u.institution || "ALL" });
    });

    const formattedLogs = logs.map(l => {
      let role = "Sekretariat";
      let fullName = l.userId || "System Admin";
      let institution = "ALL";
      const uInfo = l.userId ? userRoleMap.get(l.userId) : null;

      if (uInfo) {
        role = uInfo.role;
        fullName = uInfo.fullName;
        institution = uInfo.institution;
      } else if (l.afterState) {
        try {
          const parsed = JSON.parse(l.afterState);
          if (parsed.role) role = parsed.role;
          if (parsed.institution) institution = parsed.institution;
        } catch {
          // ignore
        }
      }

      if (l.userId === "mphm2026") {
        role = "sek.madrasah";
        institution = "MADRASAH";
      }
      if (l.userId === "p3hm2026") {
        role = "sek.pondok";
        institution = "PONDOK";
      }

      let moduleName = l.entity;
      if (l.entity === "AUTH") moduleName = "Otentikasi System";
      else if (l.entity === "USER_ACCOUNT" || l.entity === "USER") moduleName = "Manajemen Akun Users";
      else if (l.entity === "SYSTEM_SETTINGS" || l.entity === "SETTINGS") moduleName = "Konfigurasi Sistem";
      else if (l.entity === "PENGURUS" || l.entity === "ORGANIZATION") moduleName = "Manajemen SDM Pengurus";
      else if (l.entity === "SANTRI" || l.entity === "STUDENT") moduleName = "Master Data Santri";

      let detailsText = l.afterState || l.beforeState || `${l.action} pada ${l.entity}`;
      if (l.action === "LOGIN") detailsText = `Sesi login aktif untuk pengguna ${l.userId} (${role})`;
      else if (l.action === "LOGOUT") detailsText = `Sesi logout berhasil untuk pengguna ${l.userId}`;

      return {
        id: l.id,
        timestamp: l.createdAt.toISOString(),
        createdAt: l.createdAt.toISOString(),
        userId: l.userId || "SYSTEM",
        fullName,
        role,
        institution,
        module: moduleName,
        entity: l.entity,
        action: l.action,
        details: detailsText,
        targetPath: `/sekretariat/${l.entity.toLowerCase()}`
      };
    });

    // 100% data isolation between Pondok and Madrasah
    const filteredLogs = formattedLogs.filter(log => {
      if (scope === "pondok" || scope === "PONDOK") {
        if (log.institution === "MADRASAH" || log.role === "sek.madrasah" || log.role === "mustahiq") return false;
        if (log.entity === "CLASSES" || log.entity === "CURRICULUM" || log.entity === "SUBJECTS" || log.entity === "TEACHER") return false;
      } else if (scope === "madrasah" || scope === "MADRASAH") {
        if (log.institution === "PONDOK" || log.role === "sek.pondok") return false;
        if (log.entity === "ROOM" || log.entity === "ROOMS" || log.entity === "VIOLATION" || log.entity === "PERMIT" || log.entity === "ALUMNI") return false;
      }
      return true;
    });

    return NextResponse.json({ status: "Success", data: filteredLogs });
  } catch (err: any) {
    console.error("AUDIT_LOGS_GET_ERROR:", err.message);
    return NextResponse.json(
      { status: "Error", message: err.message },
      { status: 500 }
    );
  }
}
