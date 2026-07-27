"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NAVIGATION_CONFIG, SEKRETARIAT_MADRASAH_NAV, SEKRETARIAT_PONDOK_NAV, RoleTypes, NavMenu } from "../../config/navigation.config";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { Database, Lock } from "lucide-react";
import { useRoleUIConfig } from "@/lib/useRoleUIConfig";
import { useToast } from "@/components/shared/ToastContext";
import { apiRequest } from "@/lib/api";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

interface CustomNavItem {
  label: string;
  href: string;
  icon: typeof Database;
}

interface RegistryTable {
  key: string;
  name: string;
}

interface OnboardingStatus {
  hasMundzir: boolean;
  hasMufattisy: boolean;
  hasMustahiq: boolean;
  hasClasses: boolean;
  hasSantri: boolean;
  hasRooms: boolean;
}

export function Sidebar({ role }: { role: RoleTypes }) {
  const pathname = usePathname();
  const [customItems, setCustomItems] = useState<CustomNavItem[]>([]);
  const { activeWorkspace } = useWorkspace();
  const { config, accentColorClasses } = useRoleUIConfig(role);
  const { toast } = useToast();
  const { isOnline, pendingSyncCount } = useOnlineStatus();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    hasMundzir: true,
    hasMufattisy: true,
    hasMustahiq: true,
    hasClasses: true,
    hasSantri: true,
    hasRooms: true,
  });
  const isSekretariatRole = role === "sek.pondok" || role === "sek.madrasah";

  const [loadingStatus, setLoadingStatus] = useState(!isSekretariatRole ? false : true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiRequest<{ data: OnboardingStatus }>("/api/admin/onboarding/status");
        if (res?.data) {
          setOnboardingStatus(res.data);
        }
      } catch (err) {
        console.error("Failed to load onboarding status", err);
      } finally {
        setLoadingStatus(false);
      }
    };
    if (isSekretariatRole) {
      fetchStatus();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("onboarding_status_changed", fetchStatus);
      return () => window.removeEventListener("onboarding_status_changed", fetchStatus);
    }
  }, [isSekretariatRole, pathname]);

  useEffect(() => {
    const loadCustomTables = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("custom_tables_registry");
        if (saved) {
          try {
            const list: RegistryTable[] = JSON.parse(saved);
            const mapped = list.map((table) => ({
              label: table.name,
              href: `/${role}/custom-${table.key}`,
              icon: Database
            }));
            queueMicrotask(() => setCustomItems(mapped));
          } catch {
            queueMicrotask(() => setCustomItems([]));
          }
        } else {
          queueMicrotask(() => setCustomItems([]));
        }
      }
    };

    loadCustomTables();
    if (typeof window !== "undefined") {
      window.addEventListener("custom_tables_changed", loadCustomTables);
      return () => window.removeEventListener("custom_tables_changed", loadCustomTables);
    }
  }, [role]);

  if (config.navigationStyle === "bottom_nav") {
    return null;
  }

  const isPondokWorkspace = role === "sek.pondok" || activeWorkspace === "pondok";

  const filteredStaticItems = isSekretariatRole
    ? (isPondokWorkspace ? SEKRETARIAT_PONDOK_NAV : SEKRETARIAT_MADRASAH_NAV)
    : (NAVIGATION_CONFIG[role] || []);

  let navItems: NavMenu[] = [];
  if (isSekretariatRole) {
    navItems = [...filteredStaticItems];
    if (customItems.length > 0) {
      navItems.push({
        group: "Tabel Kustom (Dinamis)",
        items: customItems
      });
    }
  } else {
    navItems = [...filteredStaticItems];
  }

  const isMenuLocked = (href: string): boolean => {
    if (!isSekretariatRole) return false;

    if (isPondokWorkspace) {
      if (href === "/sekretariat/santri" && !onboardingStatus.hasRooms) return true;
      if ((href === "/sekretariat/perizinan" || href === "/sekretariat/pelanggaran") && !onboardingStatus.hasSantri) return true;
    } else {
      if (href === "/sekretariat/santri" && !onboardingStatus.hasClasses) return true;
      if ((href === "/sekretariat/penilaian" || href === "/sekretariat/raport") && !onboardingStatus.hasSantri) return true;
    }
    return false;
  };

  const checkAccess = (e: React.MouseEvent, href: string) => {
    if (!isSekretariatRole || loadingStatus) return;

    if (isPondokWorkspace) {
      if (href === "/sekretariat/santri" && !onboardingStatus.hasRooms) {
        e.preventDefault();
        toast("Harap buat Data Kamar Asrama terlebih dahulu!", "warning", "Prasyarat Belum Lengkap");
        return;
      }
      if ((href === "/sekretariat/perizinan" || href === "/sekretariat/pelanggaran") && !onboardingStatus.hasSantri) {
        e.preventDefault();
        toast("Harap daftarkan Santriwati Asrama terlebih dahulu!", "warning", "Prasyarat Belum Lengkap");
        return;
      }
    } else {
      if (href === "/sekretariat/santri" && !onboardingStatus.hasClasses) {
        e.preventDefault();
        toast("Harap buat Rombel Kelas & tetapkan Mustahiq terlebih dahulu!", "warning", "Prasyarat Belum Lengkap");
        return;
      }
      if ((href === "/sekretariat/penilaian" || href === "/sekretariat/raport") && !onboardingStatus.hasSantri) {
        e.preventDefault();
        toast("Harap daftarkan / tarik data Siswi Diniyyah terlebih dahulu!", "warning", "Prasyarat Belum Lengkap");
        return;
      }
    }
  };


  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 hidden xl:flex flex-col text-slate-300 sticky top-0 h-screen overflow-hidden">
      <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-900/80 bg-slate-950/50">
        <Image src="/logo.png" alt="MPHM Logo" width={36} height={36} unoptimized className="drop-shadow-md rounded-md" />
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-white">
            {role === "sek.pondok" || activeWorkspace === "pondok" ? "P3HM Lirboyo" : "MPHM Lirboyo"}
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            {role === "sek.pondok" || activeWorkspace === "pondok" ? "sek.pondok" : role.replace("_", " ")}
          </span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          if ("group" in item) {
            // This is a NavGroup
            const groupItems = item.items;

            if (groupItems.length === 0) return null;

            return (
              <div key={item.group} className="pt-4 pb-1 first:pt-0">
                <div className="px-3 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {item.group}
                </div>
                <div className="space-y-1.5">
                  {groupItems.map((subItem) => {
                    const isActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={(e) => checkAccess(e, subItem.href)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                          isActive
                            ? `${accentColorClasses.bg} ${accentColorClasses.text} font-semibold shadow-inner border ${accentColorClasses.border}`
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        }`}
                      >
                        {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColorClasses.primary.split(" ")[0]} rounded-r-full`} />}
                        <subItem.icon 
                          strokeWidth={isActive ? 2 : 1.5} 
                          className={`w-5 h-5 z-10 transition-colors ${isActive ? accentColorClasses.text : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                        <span className="text-sm z-10 flex-1">{subItem.label}</span>
                        {isSekretariatRole && !loadingStatus && isMenuLocked(subItem.href) && (
                          <Lock className="w-3 h-3 text-red-400/70" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // This is a flat NavItem
          const isRoleBase = ["/sekretariat", "/mufattisy", "/pimpinan", "/mustahiq", "/keamanan", "/guardian"].includes(item.href);
          const isActive = isRoleBase 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => checkAccess(e, item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? `${accentColorClasses.bg} ${accentColorClasses.text} font-semibold shadow-inner border ${accentColorClasses.border}`
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColorClasses.primary.split(" ")[0]} rounded-r-full`} />}
              <item.icon 
                strokeWidth={isActive ? 2 : 1.5} 
                className={`w-5 h-5 z-10 transition-colors ${isActive ? accentColorClasses.text : "text-slate-500 group-hover:text-slate-300"}`}
              />
              <span className="text-sm z-10 flex-1">{item.label}</span>
              {isSekretariatRole && !loadingStatus && isMenuLocked(item.href) && (
                <Lock className="w-3 h-3 text-red-400/70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-900 bg-slate-950/50 mt-auto">
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800/50 flex flex-col items-center justify-center text-center gap-1.5 shadow-md">
          <div className="flex items-center justify-center gap-2">
            {/* PULSING GREEN (ONLINE) / RED (OFFLINE) INDICATOR DOT */}
            <span className="relative flex h-3 w-3 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                }`}
              />
            </span>
            <span className="text-xs font-extrabold text-slate-200">
              {role === "sek.pondok" || activeWorkspace === "pondok" ? "Sistem Informasi Pesantren" : "Sistem Informasi Akademik"}
            </span>
          </div>

          <span className="text-[10px] font-medium text-slate-400">
            {role === "sek.pondok" || activeWorkspace === "pondok"
              ? "Pondok Pesantren Putri Hidayatul Mubtadi'at"
              : "Madrasah Putri Hidayatul Mubtadi'at"}
          </span>

          <div className="mt-0.5 flex items-center justify-center gap-2 text-[10px] font-mono">
            <span className={`font-bold flex items-center gap-1 ${isOnline ? "text-emerald-400" : "text-rose-400"}`}>
              {isOnline ? "● Online (Realtime Sync)" : "▲ Offline (Cache Luring)"}
            </span>
            {pendingSyncCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[9px] font-bold animate-pulse">
                {pendingSyncCount} Pending Sync
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
