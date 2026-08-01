"use client";
import React from "react";
import { Terminal, RefreshCw, Download, Power } from "lucide-react";

interface DeveloperNavbarProps {
  onSyncApi: () => void;
  onExportBackup: () => void;
  onLogout: () => void;
}

export function DeveloperNavbar({ onSyncApi, onExportBackup, onLogout }: DeveloperNavbarProps) {
  return (
    <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl shadow-inner">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white tracking-tight">DEVELOPER SAAS MASTER COCKPIT</span>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold rounded-md">
              LIVE DB SYNC
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">m.p3hm.my.id/developer • Session: develzy</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSyncApi}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-zinc-700"
          title="Refresh Status & Parameter Server"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Sync API
        </button>

        <button
          type="button"
          onClick={onExportBackup}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl transition-all cursor-pointer border border-emerald-500/30"
        >
          <Download className="w-4 h-4" /> Backup JSON
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer border border-rose-500/30"
        >
          <Power className="w-4 h-4" /> Keluar
        </button>
      </div>
    </header>
  );
}
