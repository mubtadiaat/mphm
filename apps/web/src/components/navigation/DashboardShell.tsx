"use client";

import React, { useState, useEffect } from "react";
import { Lock, MonitorOff, LogOut } from "lucide-react";
import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("../shared/CommandPalette"), { ssr: false });
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { RoleTypes } from "../../config/navigation.config";
import { PageTransition } from "../shared/PageTransition";
import { HeaderProfile } from "./HeaderProfile";
import { useRoleUIConfig } from "@/lib/useRoleUIConfig";
import { HijriDateDisplay } from "@/components/shared/HijriDateDisplay";
import { AcademicYearProvider, useAcademicYear } from "@/components/shared/AcademicYearContext";
import { WorkspaceProvider } from "@/components/shared/WorkspaceContext";
import { useLogout } from "@/lib/auth";

interface DashboardShellProps {
  role: RoleTypes;
  children: React.ReactNode;
}

function GlobalHeaderActions({ role }: { role: RoleTypes }) {
  const { selectedYearId, setSelectedYearId, years } = useAcademicYear();

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">TAHUN AKADEMIK:</span>
        <select
          value={selectedYearId}
          onChange={(e) => setSelectedYearId(e.target.value)}
          className="px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold focus:outline-hidden dark:text-zinc-100 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name} {y.isActive ? "(Aktif)" : "(Arsip)"}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden md:block">
        <HijriDateDisplay />
      </div>
      <HeaderProfile />
    </div>
  );
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const { config } = useRoleUIConfig(role);
  const logoutMutation = useLogout();
  const [showQRModal, setShowQRModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const isSekretariatRole = role === "sek.pondok" || role === "sek.madrasah";

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Pad the main workspace if Bottom Nav is active
  const paddingClass = config.navigationStyle === "bottom_nav" 
    ? "pb-16" 
    : "pb-16 xl:pb-0";

  return (
    <AcademicYearProvider>
      <WorkspaceProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex relative w-full">
          <CommandPalette />

          {/* Small Screen Blocking Modal for Sekretariat Roles (Sek. Pondok & Sek. Madrasah) */}
          {isSekretariatRole && isSmallScreen && (
            <div className="fixed inset-0 z-[999999] bg-zinc-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="max-w-md w-full bg-zinc-900 border-2 border-rose-500/40 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="w-20 h-20 bg-rose-500/15 border-2 border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 shadow-lg">
                  <MonitorOff className="w-10 h-10 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <span className="px-3.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 font-extrabold text-xs uppercase tracking-wider rounded-full">
                    AKSES DITOLAK DI LAYAR KECIL
                  </span>
                  <h2 className="text-2xl font-black text-white leading-snug">
                    Tampilan Terblokir
                  </h2>
                </div>

                <div className="text-xs font-medium text-zinc-300 leading-relaxed bg-zinc-800/90 p-4 rounded-2xl border border-zinc-700/60 text-left space-y-2">
                  <p>
                    Akses menu <strong>Sekretariat ({role === "sek.pondok" ? "Sek. Pondok" : "Sek. Madrasah"})</strong> memerlukan perangkat Komputer / Laptop / Desktop dengan layar lebar.
                  </p>
                  <p className="text-zinc-400">
                    Tampilan pada HP/Smartphone diblokir untuk mencegah kesalahan pengelolaan data master & tabel administrasi.
                  </p>
                </div>

                {/* TOMBOL KELUAR / LOGOUT RESMI */}
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 border border-rose-400/30"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{logoutMutation.isPending ? "Memproses Keluar..." : "Keluar Akun (Logout)"}</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Sidebar */}
          <Sidebar role={role} />
          
          <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${paddingClass}`}>
            <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 sm:px-6 sticky top-0 z-40 justify-between">
              <div className="flex-1 flex items-center gap-2 sm:gap-2.5 md:hidden min-w-0">
                <img src="/logo.png" alt="MPHM Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg shadow-xs shrink-0" />
                <span className="font-black text-base sm:text-lg text-zinc-900 dark:text-white tracking-tight truncate">MPHM Lirboyo</span>
              </div>
              <div className="flex-1 hidden md:block"></div>
              <GlobalHeaderActions role={role} />
            </header>
          
            <div className="p-4 md:p-6 overflow-x-hidden flex-1 flex flex-col">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </main>
        
          {/* BottomNav */}
          {!isSekretariatRole && <BottomNav role={role} />}

          {/* Mustahiq FAB QR Code */}
          {role === "mustahiq" && (
            <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 flex justify-center z-50">
              <button 
                onClick={() => setShowQRModal(true)}
                className="flex flex-col items-center justify-center gap-1 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="p-1.5 bg-white rounded-md">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div onClick={() => setShowQRModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative z-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Segera Hadir</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Modul kehadiran QR Code ini masih dalam tahap pengembangan dan akan segera tersedia pada pembaruan sistem berikutnya.
                </p>
                <button onClick={() => setShowQRModal(false)} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl w-full transition-colors cursor-pointer">
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </WorkspaceProvider>
    </AcademicYearProvider>
  );
}
