"use client";

import { FileText, Search, Filter } from "lucide-react";
import { useState } from "react";

export default function SekretariatPerizinanPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Modul Sistem</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Sistem Perizinan
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Manajemen permohonan izin santri. Modul ini telah diinisiasi dan siap untuk integrasi API selanjutnya.
          </p>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Cari data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Empty State / Placeholder Grid */}
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl gap-4 mt-8">
        <div className="p-4 bg-blue-500/10 text-blue-500 rounded-full">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Data Belum Tersedia</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          Struktur antarmuka untuk modul Sistem Perizinan telah berhasil dibangun. Menunggu integrasi aliran data dari backend.
        </p>
      </div>
    </div>
  );
}
