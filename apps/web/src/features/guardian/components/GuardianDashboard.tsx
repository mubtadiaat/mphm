"use client";

import { motion } from "framer-motion";
import { Users, AlertCircle, HeartPulse, BarChart3, TrendingUp, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { NAVIGATION_CONFIG } from "@/config/navigation.config";
import Link from "next/link";

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

  const scoreTrend = data?.childQuarterlyScores || [
    { kwartal: "Kwartal 1", score: 8.5 },
    { kwartal: "Kwartal 2", score: 8.6 },
    { kwartal: "Kwartal 3", score: 8.3 },
    { kwartal: "Kwartal 4", score: 8.8 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Portal Smart Wali Santri</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
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

      {/* GRAFIK INDIKATOR WALI SANTRI: Grafik Nilai Raport Per Kwartal Anak */}
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
      </div>

      {/* QUICK LINKS */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Menu Utama Wali Santri
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Akses cepat ke seluruh laporan dan pencapaian anak.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {NAVIGATION_CONFIG["wali_santri"].map((item: any, itemIdx) => {
            if (item.label.includes("Dashboard")) return null;
            const ItemIcon = item.icon;
            return (
              <Link 
                key={itemIdx} 
                href={item.href}
                className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors shrink-0">
                  <ItemIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
