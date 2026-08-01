"use client";
import React from "react";
import { Power } from "lucide-react";

interface KillswitchesTabProps {
  maintenanceMode: boolean;
  dbWriteLock: boolean;
  registrationLock: boolean;
  mobileApiEnabled: boolean;
  onToggle: (settingKey: string, valueKey: string, value: boolean, setter: (v: boolean) => void) => void;
  setMaintenanceMode: (v: boolean) => void;
  setDbWriteLock: (v: boolean) => void;
  setRegistrationLock: (v: boolean) => void;
  setMobileApiEnabled: (v: boolean) => void;
}

export function KillswitchesTab({
  maintenanceMode,
  dbWriteLock,
  registrationLock,
  mobileApiEnabled,
  onToggle,
  setMaintenanceMode,
  setDbWriteLock,
  setRegistrationLock,
  setMobileApiEnabled,
}: KillswitchesTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6 shadow-xl">
        <div>
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <Power className="w-5 h-5 text-rose-400" /> Master Sakelar Kunci System (Real Database Persistence)
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Klik sakelar di bawah untuk mengubah status sistem di Database Server secara langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Maintenance Mode */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-extrabold text-sm text-white block">Mode Maintenance Darurat</span>
              <span className="text-xs text-zinc-500">
                Tutup akses aplikasi publik/wali. (Sekretariat & Developer tetap bisa masuk).
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggle("dev_maintenance", "systemMaintenance", !maintenanceMode, setMaintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                maintenanceMode ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {maintenanceMode ? "TERKUNCI (ON)" : "NORMAL (OFF)"}
            </button>
          </div>

          {/* 2. DB Write Lock */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-extrabold text-sm text-white block">Database Write Lock (Read-Only)</span>
              <span className="text-xs text-zinc-500">Kunci seluruh mutasi/perubahan data di Database.</span>
            </div>
            <button
              type="button"
              onClick={() => onToggle("dev_db_writelock", "dbWriteLock", !dbWriteLock, setDbWriteLock)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                dbWriteLock ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {dbWriteLock ? "READ-ONLY (ON)" : "OFF"}
            </button>
          </div>

          {/* 3. Registration Lock */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-extrabold text-sm text-white block">Kunci Pendaftaran & Impor Data</span>
              <span className="text-xs text-zinc-500">Blokir pendaftaran santri baru & impor Excel.</span>
            </div>
            <button
              type="button"
              onClick={() => onToggle("dev_reg_lock", "registrationLock", !registrationLock, setRegistrationLock)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                registrationLock ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {registrationLock ? "LOCKED (ON)" : "OFF"}
            </button>
          </div>

          {/* 4. PWA & External Client API */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-extrabold text-sm text-white block">API PWA & External Client</span>
              <span className="text-xs text-zinc-500">Izinkan atau blokir sinkronisasi PWA standalone & external client.</span>
            </div>
            <button
              type="button"
              onClick={() => onToggle("dev_mobile_api", "mobileApiEnabled", !mobileApiEnabled, setMobileApiEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mobileApiEnabled ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {mobileApiEnabled ? "AKTIF (ON)" : "DIBLOKIR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
