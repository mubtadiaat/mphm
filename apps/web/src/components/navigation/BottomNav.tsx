"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { NAVIGATION_CONFIG, SEKRETARIAT_MADRASAH_NAV, SEKRETARIAT_PONDOK_NAV, RoleTypes, NavItem } from "../../config/navigation.config";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { Database, Lock } from "lucide-react";
import { useToast } from "@/components/shared/ToastContext";
import { apiRequest } from "@/lib/api";

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

import { useRoleUIConfig } from "@/lib/useRoleUIConfig";

export function BottomNav({ role, forceShow = false }: { role: RoleTypes, forceShow?: boolean }) {
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
  const [loadingStatus, setLoadingStatus] = useState(role !== "sekretariat" ? false : true);

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
    if (role === "sekretariat") {
      fetchStatus();
    }
  }, [role]);

  const isMenuLocked = (href: string): boolean => {
    if (role !== "sekretariat") return false;
    if (href === "/sekretariat/mufattisy" && !onboardingStatus.hasMundzir) return true;
    if (href === "/sekretariat/mustahiq" && (!onboardingStatus.hasMundzir || !onboardingStatus.hasMufattisy)) return true;
    if (href === "/sekretariat/kelas" && !onboardingStatus.hasMustahiq) return true;
    if (href === "/sekretariat/santri" && !onboardingStatus.hasClasses) return true;
    return false;
  };

  const checkAccess = (e: React.MouseEvent, href: string) => {
    if (role !== "sekretariat" || loadingStatus) return;

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
    window.addEventListener("custom_tables_changed", loadCustomTables);
    return () => window.removeEventListener("custom_tables_changed", loadCustomTables);
  }, [role]);

  const isSekretariatRole = role === "sekretariat" || role === "sek.pondok" || role === "sek.madrasah";

  const baseConfig = isSekretariatRole 
    ? (role === "sek.pondok" || activeWorkspace === "pondok" ? SEKRETARIAT_PONDOK_NAV : SEKRETARIAT_MADRASAH_NAV)
    : (NAVIGATION_CONFIG[role] || []);

  const flatStaticItems: NavItem[] = baseConfig.flatMap((item) => {
    if ("items" in item) {
      return item.items;
    }
    return [item];
  });

  const filteredStaticItems = flatStaticItems.filter((item) => {
    // Keep dashboard root route always visible
    const isRoot = ["/sekretariat", "/mufattisy", "/pimpinan", "/mustahiq", "/keamanan", "/guardian"].includes(item.href);
    if (isRoot) return true;
    return config.enabledMenus.includes(item.href);
  });

  const filteredCustomItems = customItems.filter((item) => {
    return config.enabledMenus.includes(item.href);
  });

  // Limit bottom nav items to max 5 to prevent UI overlap on mobile
  const allItems = isSekretariatRole
    ? [...filteredStaticItems, ...filteredCustomItems]
    : [...filteredStaticItems, ...filteredCustomItems];
  const navItems = allItems.slice(0, 5);

  // If configuration forces bottom nav, show always. Else hide on desktop (xl:hidden)
  const isBottomNavForced = config.navigationStyle === "bottom_nav";
  const displayClass = (isBottomNavForced || forceShow) ? "flex" : "flex xl:hidden";

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe ${displayClass}`}>
      <div className="flex items-center justify-around w-full h-16 px-2">
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
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <div className="relative flex flex-col items-center justify-center p-2 z-10">
                <div className="relative">
                  <item.icon 
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`w-6 h-6 mb-1 transition-colors ${
                      isActive ? accentColorClasses.text : "text-zinc-500 dark:text-zinc-400"
                    }`} 
                  />
                  {role === "sekretariat" && !loadingStatus && isMenuLocked(item.href) && (
                    <Lock className="absolute -top-1 -right-2 w-3 h-3 text-red-500" />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? accentColorClasses.text : "text-zinc-500 dark:text-zinc-400"
                }`}>
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="bottomNavPill"
                  className={`absolute inset-x-2 inset-y-1 ${accentColorClasses.bg} rounded-xl z-0`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
