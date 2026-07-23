"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { RoleTypes } from "../../config/navigation.config";
import { DashboardShell } from "../../components/navigation/DashboardShell";

// Mapping dari role backend ke role key frontend dan base path dashboard
const ROLE_MAP: Record<string, { key: RoleTypes; basePath: string }> = {
  sekretariat:        { key: "sek.pondok",    basePath: "/sekretariat" },
  "sek.pondok":       { key: "sek.pondok",    basePath: "/sekretariat" },
  "sek.madrasah":     { key: "sek.madrasah",  basePath: "/sekretariat" },
  mufattisy:          { key: "mufattisy",     basePath: "/mufattisy" },
  mundzir:            { key: "mundzir",       basePath: "/pimpinan" },
  pimpinan:           { key: "mundzir",       basePath: "/pimpinan" },
  mustahiq:           { key: "mustahiq",      basePath: "/mustahiq" },
  keamanan:           { key: "keamanan",      basePath: "/keamanan" },
  "petugas keamanan": { key: "keamanan",      basePath: "/keamanan" },
  "wali santri":      { key: "wali_santri",   basePath: "/guardian" },
  wali_santri:        { key: "wali_santri",   basePath: "/guardian" },
  guardian:           { key: "wali_santri",   basePath: "/guardian" },
};

// Semua base path dashboard yang valid
const ALL_DASHBOARD_PATHS = Object.values(ROLE_MAP).map((r) => r.basePath);

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Tentukan role & base path user
  const backendRole = user ? String(user.role).trim().toLowerCase() : null;
  const roleInfo = backendRole ? ROLE_MAP[backendRole] : null;
  const role: RoleTypes = roleInfo?.key ?? "sek.pondok";
  const correctBasePath = roleInfo?.basePath ?? "/sekretariat";

  useEffect(() => {
    if (isLoading) return;

    // Jika user tidak login, redirect ke halaman login
    if (!user) {
      router.replace("/");
      return;
    }

    // Jika role tidak dikenal, redirect ke login
    if (!roleInfo) {
      router.replace("/?error=invalid_role");
      return;
    }

    // User mengakses dashboard yang bukan milik role-nya → redirect ke dashboard yang benar
    const isOnCorrectPath = pathname === correctBasePath || pathname.startsWith(correctBasePath + "/");

    if (!isOnCorrectPath) {
      const isOnAnyDashboard = ALL_DASHBOARD_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );

      if (isOnAnyDashboard) {
        router.replace(correctBasePath);
      }
    }
  }, [isLoading, user, roleInfo, pathname, correctBasePath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse">Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user || !roleInfo) {
    return null;
  }

  return (
    <DashboardShell role={role}>
      {children}
    </DashboardShell>
  );
}

