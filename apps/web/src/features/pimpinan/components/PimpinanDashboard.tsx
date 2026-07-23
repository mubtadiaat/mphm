"use client";

import { motion } from "framer-motion";
import { Users, Clock, ShieldAlert, BarChart3, TrendingUp, Award } from "lucide-react";
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

interface PimpinanStats {
  totalStudents: number;
  totalTeachers: number;
  averageGpa: number;
  attendanceRate: number;
  totalClasses: number;
  activeViolations: number;
  attendanceTrend?: { month: string; rate: number }[];
}

export function PimpinanDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["pimpinan-dashboard-stats"],
    queryFn: async () => {
      const res = await apiRequest<{ data: PimpinanStats }>("/api/pimpinan/dashboard/stats");
      return res.data;
    },
  });

  const stats = [
    { label: "Total Santriwati", value: isLoading ? "..." : data?.totalStudents || 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Tingkat Kehadiran Global", value: isLoading ? "..." : `${data?.attendanceRate || 100}%`, icon: Clock, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Pelanggaran Disiplin", value: isLoading ? "..." : data?.activeViolations || 0, icon: ShieldAlert, color: "text-rose-500 bg-rose-500/10" },
  ];

  const attendanceTrend = data?.attendanceTrend || [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Pimpinan / Mundzir Pondok Pesantren</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard Pengasuhan Pimpinan
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Ringkasan pengawasan tingkat tinggi untuk kehadiran, bimbingan, dan kedisiplinan santriwati.
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
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-200"
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

      {/* GRAFIK INDIKATOR PIMPINAN */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Grafik Indikator Kehadiran & Presensi Santri (6 Bulan)
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                  Ringkasan Pimpinan
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Indikator stabilitas presensi pengajian dan kegiatan pondok secara berkala.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-semibold bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Target ≥ 95%
          </div>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
            Memuat grafik...
          </div>
        ) : attendanceTrend.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
            Belum ada data presensi santri.
          </div>
        ) : (
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end gap-4 sm:gap-8 px-4">
              {attendanceTrend.map((item, index) => {
                const heightPercent = Math.max(item.rate, 20);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      {item.rate}%
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-xl h-full flex items-end overflow-hidden p-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, delay: index * 0.12 }}
                        className="w-full bg-linear-to-t from-amber-600 to-emerald-500 rounded-lg shadow-sm group-hover:brightness-110 transition-all"
                      />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {item.month}
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
