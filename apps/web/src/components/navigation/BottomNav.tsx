"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { NAVIGATION_CONFIG, RoleTypes } from "../../config/navigation.config";
import { Database } from "lucide-react";

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
  const { config, accentColorClasses } = useRoleUIConfig(role);

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

  const filteredStaticItems = (NAVIGATION_CONFIG[role] || []).filter((item) => {
    // Keep dashboard root route always visible
    const isRoot = ["/sekretariat", "/mufattisy", "/pimpinan", "/mustahiq", "/keamanan", "/guardian"].includes(item.href);
    if (isRoot) return true;
    return config.enabledMenus.includes(item.href);
  });

  const filteredCustomItems = customItems.filter((item) => {
    return config.enabledMenus.includes(item.href);
  });

  // Limit bottom nav items to max 5 to prevent UI overlap on mobile
  const allItems = role === "sekretariat"
    ? [...filteredStaticItems, ...customItems]
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
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <div className="relative flex flex-col items-center justify-center p-2 z-10">
                <item.icon 
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={`w-6 h-6 mb-1 transition-colors ${
                    isActive ? accentColorClasses.text : "text-zinc-500 dark:text-zinc-400"
                  }`} 
                />
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
