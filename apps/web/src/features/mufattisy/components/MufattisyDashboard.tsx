"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, BarChart3, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

interface MufattisyStats {
  totalSantri: number;
  averageGpa: number;
  totalViolations: number;
  curriculumCompliance: number;
  levelPerformances?: { level: string; avgScore: number; activeStudents: number }[];
}

export function MufattisyDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["mufattisy-dashboard-stats"],
    queryFn: async () => {
      const res = await apiRequest<{ data: MufattisyStats }>("/api/mufattisy/dashboard/stats");
      return res.data;
    },
  });

  const stats = [
    { label: "Total Santriwati", value: isLoading ? "..." : data?.totalSantri || 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Rata-rata Nilai Akademik", value: isLoading ? "..." : data?.averageGpa || 0, icon: GraduationCap, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Kepatuhan Kurikulum", value: isLoading ? "..." : `${data?.curriculumCompliance ?? 100}%`, icon: ShieldCheck, color: "text-purple-500 bg-purple-500/10" },
  ];

  const levelPerformances = data?.levelPerformances || [];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-8 sm:pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Mufattisy (Pengawas & Inspektur)</span>
          </div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Dashboard Pengawasan Mufattisy
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
            Pusat inspeksi kepatuhan kurikulum, pencapaian akademik per jenjang, dan pengawasan kedisiplinan.
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  {stat.label}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* GRAFIK INDIKATOR MUFATTISY */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white flex flex-wrap items-center gap-2">
                Grafik Inspeksi Akademik Per Jenjang Pendidikan
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] sm:text-xs font-semibold border border-purple-500/20">
                  Pengawasan Terpadu
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500">
                Monitoring rata-rata capaian akademik siswi berdasarkan tingkat madrasah.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
            Memuat grafik...
          </div>
        ) : levelPerformances.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
            Belum ada data inspeksi jenjang pendidikan.
          </div>
        ) : (
          <div className="pt-4 pb-2 overflow-x-auto">
            <div className="h-48 flex items-end gap-4 sm:gap-12 px-2 sm:px-6 min-w-[280px]">
              {levelPerformances.map((item, index) => {
                const heightPercent = Math.max((item.avgScore / 10) * 100, 15);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      {item.avgScore}
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-xl h-full flex items-end overflow-hidden p-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, delay: index * 0.15 }}
                        className="w-full bg-linear-to-t from-purple-600 to-indigo-500 rounded-lg shadow-sm group-hover:brightness-110 transition-all"
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[80px]">
                      {item.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
