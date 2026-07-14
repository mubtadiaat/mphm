"use client";

import React from "react";
import CommandPalette from "../shared/CommandPalette";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { RoleTypes } from "../../config/navigation.config";
import { PageTransition } from "../shared/PageTransition";
import { HeaderProfile } from "./HeaderProfile";
import { useRoleUIConfig } from "@/lib/useRoleUIConfig";
import { HijriDateDisplay } from "@/components/shared/HijriDateDisplay";
import { AcademicYearProvider, useAcademicYear } from "@/components/shared/AcademicYearContext";

interface DashboardShellProps {
  role: RoleTypes;
  children: React.ReactNode;
}

function GlobalHeaderActions() {
  const { selectedYearId, setSelectedYearId, years } = useAcademicYear();

  return (
    <div className="flex items-center gap-4">
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

  // Pad the main workspace if Bottom Nav is active (on desktop as well as mobile)
  const paddingClass = config.navigationStyle === "bottom_nav" 
    ? "pb-16" 
    : "pb-16 xl:pb-0";

  return (
    <AcademicYearProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex relative w-full">
        <CommandPalette />
        
        {/* Sidebar - internally decides to render or return null based on navigationStyle config */}
        <Sidebar role={role} />
        
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${paddingClass}`}>
          <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 sticky top-0 z-40 justify-between">
            <div className="flex-1 font-extrabold text-xl md:hidden text-zinc-800 dark:text-zinc-200">MPHM 4.0</div>
            <div className="flex-1 hidden md:block"></div>
            <GlobalHeaderActions />
          </header>
        
        <div className="p-4 md:p-6 overflow-x-hidden flex-1 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      
      {/* BottomNav - internally decides screen visibility based on navigationStyle config */}
      <BottomNav role={role} />
    </div>
    </AcademicYearProvider>
  );
}
