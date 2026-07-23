"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
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
import { WorkspaceProvider, useWorkspace, WorkspaceType } from "@/components/shared/WorkspaceContext";

interface DashboardShellProps {
  role: RoleTypes;
  children: React.ReactNode;
}

function WorkspaceSwitcher({ role }: { role: RoleTypes }) {
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  
  if (role !== "sekretariat") return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveWorkspace("pondok")}
          title="Beralih ke Workspace Pondok (Asrama, Kedisiplinan, Mundzir, Khidmah, Wali Santri)"
          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            activeWorkspace === "pondok" 
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <span className="text-sm">🏠</span> PONDOK
        </button>
        <button
          type="button"
          onClick={() => setActiveWorkspace("madrasah")}
          title="Beralih ke Workspace Madrasah (Kelas, Rombel, Mufatish, Mustahiq, Nilai, Raport, Kurikulum)"
          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            activeWorkspace === "madrasah" 
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <span className="text-sm">🏫</span> MADRASAH
        </button>
      </div>
    </div>
  );
}

function GlobalHeaderActions({ role }: { role: RoleTypes }) {
  const { selectedYearId, setSelectedYearId, years } = useAcademicYear();

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <WorkspaceSwitcher role={role} />
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
  const [showQRModal, setShowQRModal] = useState(false);

  // Pad the main workspace if Bottom Nav is active (on desktop as well as mobile)
  const paddingClass = config.navigationStyle === "bottom_nav" 
    ? "pb-16" 
    : "pb-16 xl:pb-0";

  return (
    <AcademicYearProvider>
      <WorkspaceProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex relative w-full">
        <CommandPalette />
        
        {/* Sidebar - internally decides to render or return null based on navigationStyle config */}
        <Sidebar role={role} />
        
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${paddingClass}`}>
          <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 sticky top-0 z-40 justify-between">
            <div className="flex-1 font-extrabold text-xl md:hidden text-zinc-800 dark:text-zinc-200">MPHM 4.0</div>
            <div className="flex-1 hidden md:block"></div>
            <GlobalHeaderActions role={role} />
          </header>
        
        <div className="p-4 md:p-6 overflow-x-hidden flex-1 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      
      {/* BottomNav - internally decides screen visibility based on navigationStyle config */}
      <BottomNav role={role} />

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
