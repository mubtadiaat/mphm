"use client";

import { Layers } from "lucide-react";
import { DataKelasGrid } from "./DataKelasGrid";

interface KelasTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function KelasTab({ onViewDetail, isReadOnly = false, selectedYearId }: KelasTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 dark:border-teal-500/10 rounded-2xl flex flex-col justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-teal-650 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Manajemen Pendidikan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Kelas & Rombel
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Administrasi pembagian kelas rombongan belajar (rombel) yang terintegrasi.
          </p>
        </div>
      </div>

      {/* Render DataKelasGrid directly */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <DataKelasGrid 
          onViewDetail={onViewDetail} 
          isReadOnly={isReadOnly} 
          selectedYearId={selectedYearId} 
        />
      </div>
    </div>
  );
}
