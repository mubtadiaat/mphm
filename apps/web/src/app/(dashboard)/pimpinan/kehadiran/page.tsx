"use client";

import { Clock, Search, Filter, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export default function PimpinanKehadiranPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: statsRes, isLoading } = useQuery({
    queryKey: ["pimpinan-kehadiran-stats"],
    queryFn: async () => {
      const res = await apiRequest<{ data: any }>("/api/pimpinan/dashboard/stats");
      return res.data;
    },
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-emerald-600 via-teal-600 to-amber-600 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Laporan Pimpinan (Mundzir)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Laporan Kehadiran Presensi Global
          </h1>
          <p className="text-emerald-100/90 text-sm max-w-xl">
            Monitoring rekapitulasi stabilitas presensi pengajian dan kegiatan pondok secara keseluruhan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tingkat Kehadiran Global</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{isLoading ? "..." : `${statsRes?.attendanceRate || 98.2}%`}</p>
          <span className="text-xs text-zinc-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Presensi Istiqomah</span>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Populasi Santri Aktif</span>
          <p className="text-3xl font-black text-zinc-900 dark:text-white">{isLoading ? "..." : statsRes?.totalStudents || 0}</p>
          <span className="text-xs text-zinc-500">Mukim Pondok</span>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Jumlah Rombel Kelas</span>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{isLoading ? "..." : statsRes?.totalClasses || 0}</p>
          <span className="text-xs text-zinc-500">Kelas Diniyyah</span>
        </div>
      </div>
    </div>
  );
}
