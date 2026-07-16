"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NAVIGATION_CONFIG, RoleTypes, NavMenu } from "../../config/navigation.config";
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
  const { config } = useRoleUIConfig(role);
  const { toast } = useToast();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    hasMundzir: true,
    hasMufattisy: true,
    hasMustahiq: true,
    hasClasses: true,
    hasSantri: true
  });
  const [loadingStatus, setLoadingStatus] = useState(role !== "sekretariat" ? false : true);
  const [showQRModal, setShowQRModal] = useState(false);

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

  if (config.navigationStyle === "bottom_nav") {
    return null;
  }

  const filteredStaticItems = (NAVIGATION_CONFIG[role] || []);

  let navItems: NavMenu[] = [];
  if (role === "sekretariat") {
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

  const checkAccess = (e: React.MouseEvent, href: string) => {
    if (role !== "sekretariat" || loadingStatus) return;

    if (href.includes("/mufattisy") && !onboardingStatus.hasMundzir) {
      e.preventDefault();
      toast("Harap isi Data Mundzir terlebih dahulu!", "warning", "Data Belum Lengkap");
      return;
    }
    if (href.includes("/mustahiq") && (!onboardingStatus.hasMundzir || !onboardingStatus.hasMufattisy)) {
      e.preventDefault();
      toast("Harap isi Data Mufattisy terlebih dahulu!", "warning", "Data Belum Lengkap");
      return;
    }
    if (href.includes("/kelas") && (!onboardingStatus.hasMustahiq)) {
      e.preventDefault();
      toast("Harap isi Data Mustahiq terlebih dahulu!", "warning", "Data Belum Lengkap");
      return;
    }
    if (href.includes("/santri") && (!onboardingStatus.hasClasses)) {
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
          <span className="font-extrabold text-lg tracking-tight text-white">MPHM 4.0</span>
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
                            ? "bg-blue-600/10 text-blue-400 font-semibold shadow-inner border border-blue-500/20"
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        }`}
                      >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                        <subItem.icon 
                          strokeWidth={isActive ? 2 : 1.5} 
                          className={`w-5 h-5 z-10 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                        <span className="text-sm z-10 flex-1">{subItem.label}</span>
                        {role === "sekretariat" && !loadingStatus && (
                           (subItem.href.includes("/mufattisy") && !onboardingStatus.hasMundzir) ||
                           (subItem.href.includes("/mustahiq") && !onboardingStatus.hasMufattisy) ||
                           (subItem.href.includes("/kelas") && !onboardingStatus.hasMustahiq) ||
                           (subItem.href.includes("/santri") && !onboardingStatus.hasClasses)
                        ) && (
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
                  ? "bg-blue-600/10 text-blue-400 font-semibold shadow-inner border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
              <item.icon 
                strokeWidth={isActive ? 2 : 1.5} 
                className={`w-5 h-5 z-10 transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`}
              />
              <span className="text-sm z-10 flex-1">{item.label}</span>
              {role === "sekretariat" && !loadingStatus && (
                  (item.href.includes("/mufattisy") && !onboardingStatus.hasMundzir) ||
                  (item.href.includes("/mustahiq") && !onboardingStatus.hasMufattisy) ||
                  (item.href.includes("/kelas") && !onboardingStatus.hasMustahiq) ||
                  (item.href.includes("/santri") && !onboardingStatus.hasClasses)
              ) && (
                <Lock className="w-3 h-3 text-red-400/70" />
              )}
            </Link>
          );
        })}
      </nav>
      
      
      {/* Mustahiq FAB QR Code */}
      {role === "mustahiq" && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50">
          <button 
            onClick={() => setShowQRModal(true)}
            className="flex flex-col items-center justify-center gap-1 w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.4)] border-4 border-slate-950 transition-transform hover:-translate-y-1"
          >
            <div className="p-1 bg-white rounded-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H11V11H3V3Z" fill="#2563EB"/>
                <path d="M3 13H11V21H3V13Z" fill="#2563EB"/>
                <path d="M13 3H21V11H13V3Z" fill="#2563EB"/>
                <rect x="5" y="5" width="4" height="4" fill="white"/>
                <rect x="5" y="15" width="4" height="4" fill="white"/>
                <rect x="15" y="5" width="4" height="4" fill="white"/>
                <path d="M13 13H16V16H13V13Z" fill="#2563EB"/>
                <path d="M18 18H21V21H18V18Z" fill="#2563EB"/>
                <path d="M13 18H16V21H13V18Z" fill="#2563EB"/>
                <path d="M18 13H21V16H18V13Z" fill="#2563EB"/>
                <path d="M16 16H18V18H16V16Z" fill="#2563EB"/>
              </svg>
            </div>
          </button>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div onClick={() => setShowQRModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative z-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Segera Hadir</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modul kehadiran QR Code ini masih dalam tahap pengembangan dan akan segera tersedia pada pembaruan sistem berikutnya.
            </p>
            <button onClick={() => setShowQRModal(false)} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl w-full transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-slate-900 bg-slate-950/50 mt-auto">
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800/50 flex flex-col items-center justify-center text-center gap-1">
          <span className="text-xs font-bold text-slate-300">Sistem Informasi Akademik</span>
          <span className="text-[10px] text-slate-500">Madrasah Putri Hidayatul Mubtadi&apos;at</span>
        </div>
      </div>
    </aside>
  );
}
