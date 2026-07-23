"use client";

import { motion } from "framer-motion";
import { Users, AlertCircle, HeartPulse, BarChart3, TrendingUp, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface GuardianStats {
  totalChildren: number;
  averageAttendance: number;
  totalViolations: number;
  childQuarterlyScores?: { kwartal: string; score: number }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function GuardianDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["guardian-dashboard-stats"],
    queryFn: async () => {
      const res = await apiRequest<{ data: GuardianStats }>("/api/guardian/stats");
      return res.data;
    },
  });

  const stats = [
    { label: "Anak Terdaftar", value: isLoading ? "..." : data?.totalChildren || 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Tingkat Kehadiran Presensi", value: isLoading ? "..." : `${data?.averageAttendance || 100}%`, icon: HeartPulse, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Catatan Pelanggaran", value: isLoading ? "..." : data?.totalViolations || 0, icon: AlertCircle, color: "text-rose-500 bg-rose-500/10" },
  ];

  const scoreTrend = data?.childQuarterlyScores || [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Portal Smart Wali Santri</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Monitoring Perkembangan Anak
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Pantau perkembangan nilai akademik Diniyyah, presensi realtime, dan catatan kedisiplinan putra/putri Anda.
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  {stat.label}
                </span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* GRAFIK INDIKATOR WALI SANTRI */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Grafik Rata-rata Nilai Raport Diniyyah Anak (Per Kwartal)
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
                  Perkembangan Anak
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Grafik perkembangan capaian belajar Diniyyah santri dalam 4 kwartal tahun ajaran aktif.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-semibold bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Skala Maksimal 10
          </div>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
            Memuat grafik...
          </div>
        ) : scoreTrend.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
            Belum ada catatan nilai kwartal.
          </div>
        ) : (
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end gap-4 sm:gap-8 px-4">
              {scoreTrend.map((item, index) => {
                const heightPercent = Math.max((item.score / 10) * 100, 10);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      {item.score}
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-xl h-full flex items-end overflow-hidden p-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, delay: index * 0.15 }}
                        className="w-full bg-linear-to-t from-blue-600 to-emerald-400 rounded-lg shadow-sm group-hover:brightness-110 transition-all"
                      />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {item.kwartal}
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
