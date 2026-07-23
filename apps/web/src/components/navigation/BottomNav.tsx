"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NAVIGATION_CONFIG, SEKRETARIAT_MADRASAH_NAV, SEKRETARIAT_PONDOK_NAV, RoleTypes, NavItem } from "../../config/navigation.config";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { Database, Lock } from "lucide-react";
import { useToast } from "@/components/shared/ToastContext";
import { apiRequest } from "@/lib/api";
import { useRoleUIConfig } from "@/lib/useRoleUIConfig";

export interface OnboardingStatus {
  hasMundzir: boolean;
  hasMufattisy: boolean;
  hasMustahiq: boolean;
  hasClasses: boolean;
  hasSantri: boolean;
}

interface CustomNavItem {
  label: string;
  href: string;
  icon: typeof Database;
}

interface RegistryTable {
  key: string;
  name: string;
}

export function BottomNav({ role, forceShow = false }: { role: RoleTypes; forceShow?: boolean }) {
  const pathname = usePathname();
  const [customItems, setCustomItems] = useState<CustomNavItem[]>([]);
  const { activeWorkspace } = useWorkspace();
  const { config, accentColorClasses } = useRoleUIConfig(role);
  const { toast } = useToast();
  const isSekretariatRole = role === "sek.pondok" || role === "sek.madrasah";

  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    hasMundzir: true,
    hasMufattisy: true,
    hasMustahiq: true,
    hasClasses: true,
    hasSantri: true,
  });
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
              icon: Database,
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
    window.addEventListener("custom_tables_changed", loadCustomTables);
    return () => window.removeEventListener("custom_tables_changed", loadCustomTables);
  }, [role]);

  const baseConfig = isSekretariatRole
    ? role === "sek.pondok" || activeWorkspace === "pondok"
      ? SEKRETARIAT_PONDOK_NAV
      : SEKRETARIAT_MADRASAH_NAV
    : NAVIGATION_CONFIG[role] || [];

  const flatStaticItems: NavItem[] = baseConfig.flatMap((item) => {
    if ("items" in item) {
      return item.items;
    }
    return [item];
  });

  const filteredStaticItems = flatStaticItems.filter((item) => {
    const isRoot = ["/sekretariat", "/mufattisy", "/pimpinan", "/mustahiq", "/keamanan", "/guardian"].includes(item.href);
    if (isRoot) return true;
    return config.enabledMenus.includes(item.href);
  });

  const filteredCustomItems = customItems.filter((item) => {
    return config.enabledMenus.includes(item.href);
  });

  const allItems = [...filteredStaticItems, ...filteredCustomItems];
  const navItems = allItems.slice(0, 5);

  const isBottomNavForced = config.navigationStyle === "bottom_nav";
  const displayClass = isBottomNavForced || forceShow ? "flex" : "flex xl:hidden";

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe ${displayClass} shadow-lg`}>
      <div className="flex items-center justify-between w-full h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isRoleBase = ["/sekretariat", "/mufattisy", "/pimpinan", "/mustahiq", "/keamanan", "/guardian"].includes(item.href);
          const isActive = isRoleBase
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => checkAccess(e, item.href)}
              className="relative flex-1 min-w-0 flex flex-col items-center justify-center h-full px-0.5 group select-none"
            >
              <div
                className={`relative flex flex-col items-center justify-center w-full py-1 px-1 rounded-2xl transition-all duration-200 z-10 ${
                  isActive
                    ? `${accentColorClasses.bg} ${accentColorClasses.text} ${accentColorClasses.border} border font-bold shadow-xs scale-102`
                    : "text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <item.icon
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0"
                  />
                  {isSekretariatRole && !loadingStatus && isMenuLocked(item.href) && (
                    <Lock className="absolute -top-1 -right-2 w-3 h-3 text-rose-500" />
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] leading-[1.15] text-center max-w-full line-clamp-2 mt-0.5 tracking-tight break-words px-0.5">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
