"use client";

import { Heart, Search, Award, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useSantri, Santri } from "@/features/sekretariat/queries/useSantri";

export default function MustahiqAkhlaqPage() {
  const { selectedYearId } = useAcademicYear();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: santriRes, isLoading } = useSantri(selectedYearId, 0, 100, searchQuery, "aktif");
  const studentList: Santri[] = santriRes?.data || [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-600 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>Portal Mustahiq (Wali Kelas)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Penilaian Akhlaq & Kedisiplinan Siswi
          </h1>
          <p className="text-emerald-100/90 text-sm max-w-xl">
            Evaluasi kualitatif adab, akhlaqul karimah, dan kepatuhan ibadah harian siswi pengampuan.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama siswi atau stambuk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Student Akhlaq List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Memuat data akhlaq siswi...</p>
        </div>
      ) : studentList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm font-semibold text-zinc-500">Tidak ada data siswi yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentList.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-base flex items-center justify-center">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">{s.name}</h3>
                    <p className="text-xs text-zinc-500">Stambuk: {s.stambuk} | Kelas: {s.class || "-"}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  Sangat Baik
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                  <span className="text-zinc-400 font-medium block">Adab Pengajian</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Istiqomah & Taat
                  </span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                  <span className="text-zinc-400 font-medium block">Kedisiplinan Pondok</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Kategori A
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
