"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Zap, CheckCircle2, Database, Users, BookOpen, Home, Ticket, ShieldAlert, Award, ClipboardList, FileText, UserCheck, RefreshCw } from "lucide-react";

interface OverviewStat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  desc: string;
}

export function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setStats(json.data || json);
      }
    } catch {
      // keep previous stats
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards: OverviewStat[] = stats
    ? [
        { label: "Total Santriwati", value: stats.totalStudents ?? 0, icon: <Users className="w-5 h-5" />, color: "text-emerald-400", desc: "Santriwati aktif P3HM & MPHM" },
        { label: "Kelas Aktif", value: stats.totalClasses ?? 0, icon: <BookOpen className="w-5 h-5" />, color: "text-blue-400", desc: "Rombel kelas tahun ajaran aktif" },
        { label: "Tahun Ajaran", value: stats.activeAcademicYear || "-", icon: <Award className="w-5 h-5" />, color: "text-amber-400", desc: "Tahun ajaran yang sedang berjalan" },
        { label: "Total Mustahiq", value: stats.totalMustahiq ?? 0, icon: <UserCheck className="w-5 h-5" />, color: "text-purple-400", desc: "Wali kelas / guru diniyyah" },
        { label: "Total Mata Pelajaran", value: stats.totalSubjects ?? 0, icon: <ClipboardList className="w-5 h-5" />, color: "text-sky-400", desc: "Mapel kurikulum diniyyah" },
        { label: "Total Kamar Asrama", value: stats.totalRooms ?? 0, icon: <Home className="w-5 h-5" />, color: "text-teal-400", desc: "Blok & kamar asrama aktif" },
        { label: "Perizinan Aktif", value: stats.activePermits ?? 0, icon: <Ticket className="w-5 h-5" />, color: "text-cyan-400", desc: "Perizinan santri berjalan" },
        { label: "Pelanggaran Aktif", value: stats.activeViolations ?? 0, icon: <ShieldAlert className="w-5 h-5" />, color: "text-rose-400", desc: "Catatan pelanggaran aktif" },
        { label: "Total Wali Santri", value: stats.totalGuardians ?? 0, icon: <Users className="w-5 h-5" />, color: "text-orange-400", desc: "Akun wali santri terdaftar" },
        { label: "Total User Akun", value: stats.totalUsers ?? 0, icon: <UserCheck className="w-5 h-5" />, color: "text-indigo-400", desc: "Akun login aktif di sistem" },
        { label: "Rata-rata Nilai", value: stats.averageScore != null ? Number(stats.averageScore).toFixed(1) : "-", icon: <FileText className="w-5 h-5" />, color: "text-lime-400", desc: "Rata-rata nilai seluruh kelas" },
        { label: "Rata-rata Kehadiran", value: stats.averageAttendance != null ? `${Number(stats.averageAttendance).toFixed(1)}%` : "-", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-green-400", desc: "Persentase kehadiran santri" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Ringkasan Statistik Live Sistem (Real Database)
          </h3>
          <button
            type="button"
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-zinc-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} /> Refresh
          </button>
        </div>

        {isLoading && !stats ? (
          <div className="flex items-center justify-center py-12 text-zinc-500 text-sm font-bold">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Memuat statistik dari database server...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{card.label}</span>
                  <span className={card.color}>{card.icon}</span>
                </div>
                <span className={`text-2xl font-black ${card.color} block`}>
                  {typeof card.value === "number" ? card.value.toLocaleString("id-ID") : card.value}
                </span>
                <p className="text-[11px] text-zinc-500">{card.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* System Architecture Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
            <span className="text-xs text-zinc-500 font-bold block">OTORISASI SEKRETARIAT & PENGURUS</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 100% BEBAS DARI MAINTENANCE
            </span>
            <p className="text-[11px] text-zinc-500">
              User Sekretariat Pondok & Madrasah tetap dapat bekerja mengelola data meskipun Maintenance Mode aktif bagi publik.
            </p>
          </div>
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
            <span className="text-xs text-zinc-500 font-bold block">ATURAN MUKIM SANTRIWATI</span>
            <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
              <Home className="w-4 h-4" /> 100% MUKIM ASRAMA
            </span>
            <p className="text-[11px] text-zinc-500">Seluruh santriwati wajib mukim di asrama pondok induk P3HM Lirboyo.</p>
          </div>
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
            <span className="text-xs text-zinc-500 font-bold block">LIVE DATABASE SYNC</span>
            <span className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> PRISMA ORM POSTGRESQL
            </span>
            <p className="text-[11px] text-zinc-500">Otomatis melakukan enkripsi sesi dan pencatatan audit log 24 jam.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
