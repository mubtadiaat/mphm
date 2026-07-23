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
}

export function Sidebar({ role }: { role: RoleTypes }) {
  const pathname = usePathname();
  const [customItems, setCustomItems] = useState<CustomNavItem[]>([]);
  const { activeWorkspace } = useWorkspace();
  const { config, accentColorClasses } = useRoleUIConfig(role);
  const { toast } = useToast();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    hasMundzir: true,
    hasMufattisy: true,
    hasMustahiq: true,
    hasClasses: true,
    hasSantri: true
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
  }, [isSekretariatRole]);

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

  const filteredStaticItems = isSekretariatRole
    ? (role === "sek.pondok" || activeWorkspace === "pondok" ? SEKRETARIAT_PONDOK_NAV : SEKRETARIAT_MADRASAH_NAV)
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
    // strict RBAC: only Sekretariat gets custom menus in MVP to prevent leakage
    navItems = [...filteredStaticItems];
  }

  const isMenuLocked = (href: string): boolean => {
    if (!isSekretariatRole) return false;
    if (href === "/sekretariat/mufattisy" && !onboardingStatus.hasMundzir) return true;
    if (href === "/sekretariat/mustahiq" && (!onboardingStatus.hasMundzir || !onboardingStatus.hasMufattisy)) return true;
    if (href === "/sekretariat/kelas" && !onboardingStatus.hasMustahiq) return true;
    if (href === "/sekretariat/santri" && !onboardingStatus.hasClasses) return true;
    return false;
  };

  const checkAccess = (e: React.MouseEvent, href: string) => {
    if (!isSekretariatRole || loadingStatus) return;

    if (href === "/sekretariat/mufattisy" && !onboardingStatus.hasMundzir) {
      e.preventDefault();
      toast("Harap isi Data Mundzir terlebih dahulu!", "warning", "Data Belum Lengkap");
      return;
    }
    if (href === "/sekretariat/mustahiq" && (!onboardingStatus.hasMundzir || !onboardingStatus.hasMufattisy)) {
      e.preventDefault();
      toast("Harap isi Data Mufattisy terlebih dahulu!", "warning", "Data Belum Lengkap");
      return;
    }
    if (href === "/sekretariat/kelas" && !onboardingStatus.hasMustahiq) {
      e.preventDefault();
      toast("Harap isi Data Mustahiq terlebih dahulu!", "warning", "Data Belum Lengkap");
      return;
    }
    if (href === "/sekretariat/santri" && !onboardingStatus.hasClasses) {
      e.preventDefault();
      toast("Harap isi Data Kelas terlebih dahulu!", "warning", "Data Belum Lengkap");
      return;
    }
  };


  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 hidden xl:flex flex-col text-slate-300 sticky top-0 h-screen overflow-hidden">
      <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-900/80 bg-slate-950/50">
        <Image src="/logo.png" alt="MPHM Logo" width={36} height={36} unoptimized className="drop-shadow-md rounded-md" />
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-white">MPHM Lirboyo</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{role.replace("_", " ")}</span>
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
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800/50 flex flex-col items-center justify-center text-center gap-1">
          <span className="text-xs font-bold text-slate-300">Sistem Informasi Akademik</span>
          <span className="text-[10px] text-slate-500">Madrasah Putri Hidayatul Mubtadi&apos;at</span>
        </div>
      </div>
    </aside>
  );
}
