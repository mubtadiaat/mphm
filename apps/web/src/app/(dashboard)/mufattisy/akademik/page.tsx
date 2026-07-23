"use client";

import { useState } from "react";
import { BookOpen, Search, Filter, GraduationCap, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";

interface ClassItem {
  id: string;
  name: string;
  fullName: string;
  institutionLevel: string;
  mustahiq?: { fullName: string };
  _count?: { enrollments: number };
}

export default function MufattisyAkademikPage() {
  const { selectedYearId } = useAcademicYear();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const { data: classesRes, isLoading } = useQuery({
    queryKey: ["mufattisy-academic-classes", selectedYearId],
    queryFn: async () => {
      const res = await apiRequest<{ data: ClassItem[] }>("/api/admin/classes");
      return res.data || [];
    },
  });

  const classList = classesRes || [];

  const filteredClasses = classList.filter((cls) => {
    const matchesQuery =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.mustahiq?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "ALL" || cls.institutionLevel === selectedLevel;
    return matchesQuery && matchesLevel;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Pengawasan & Inspeksi Mufattisy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Laporan Capaian Akademik Kelas
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl">
            Inspeksi menyeluruh terhadap status pengajaran, kelengkapan nilai kwartal, dan performa per rombel madrasah.
          </p>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama kelas, rombel, atau mustahiq..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300">
            <Filter className="w-3.5 h-3.5 ml-2 text-zinc-400" />
            <button
              onClick={() => setSelectedLevel("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedLevel === "ALL"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedLevel("IBTIDAIYYAH")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedLevel === "IBTIDAIYYAH"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Ibtida'iyyah
            </button>
            <button
              onClick={() => setSelectedLevel("TSANAWIYYAH")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedLevel === "TSANAWIYYAH"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Tsanawiyyah
            </button>
            <button
              onClick={() => setSelectedLevel("ALIYYAH")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedLevel === "ALIYYAH"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold"
                  : "hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Aliyyah
            </button>
          </div>
        </div>
      </div>

      {/* Class Inspection Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Memuat data laporan akademik kelas...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-amber-500" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">Tidak Ada Kelas yang Cocok</h3>
          <p className="text-xs text-zinc-500">
            Tidak ditemukan data kelas dengan kata kunci pencarian atau filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20 uppercase tracking-wider">
                    {cls.institutionLevel || "MADRASAH"}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terdaftar
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {cls.fullName || cls.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Mustahiq: <strong className="text-zinc-700 dark:text-zinc-300">{cls.mustahiq?.fullName || "-"}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span><strong>{cls._count?.enrollments || 0}</strong> Siswi Aktif</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <span>Diniyyah</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
