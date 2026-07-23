"use client";

import { CheckSquare, Clock, CheckCircle2, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface ChildItem {
  id: string;
  name: string;
  stambuk: string;
  className: string;
}

export default function GuardianKehadiranPage() {
  const { data: childrenRes, isLoading } = useQuery({
    queryKey: ["guardian-children-list"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ChildItem[] }>("/api/guardian/children");
      return res.data || [];
    },
  });

  const childrenList = childrenRes || [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-emerald-600 via-teal-600 to-blue-600 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Portal Smart Wali Santri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Laporan Kehadiran Presensi
          </h1>
          <p className="text-emerald-100/90 text-sm max-w-xl">
            Rekapitulasi persentase presensi kehadiran pengajian dan kegiatan madrasah santri.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Memuat laporan presensi...</p>
        </div>
      ) : childrenList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm font-semibold text-zinc-500">Belum ada data presensi santri terdaftar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {childrenList.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-lg flex items-center justify-center">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-zinc-500">Stambuk: {c.stambuk} | Kelas: {c.className}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Presensi Istiqomah (96.15%)
                </div>
              </div>

              {/* Attendance Recap Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-medium block">Hadir (Pengajian)</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">25 Hari</span>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-medium block">Izin Resmi</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">1 Hari</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-medium block">Sakit</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">0 Hari</span>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-medium block">Tanpa Keterangan</span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">0 Hari</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
