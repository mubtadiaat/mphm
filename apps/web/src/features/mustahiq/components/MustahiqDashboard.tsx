"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { NAVIGATION_CONFIG } from "@/config/navigation.config";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

interface MustahiqStats {
  totalSantri: number;
  averageGpa: number;
  totalViolations: number;
}

export function MustahiqDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["mustahiq-dashboard-stats"],
    queryFn: async () => {
      const res = await apiRequest<{ data: MustahiqStats }>("/api/mustahiq/dashboard/stats");
      return res.data;
    },
  });

  const stats = [
    { label: "Total Santri Kelas", value: isLoading ? "..." : data?.totalSantri || 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Rata-rata Nilai (GPA)", value: isLoading ? "..." : data?.averageGpa || 0, icon: GraduationCap, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Total Pelanggaran", value: isLoading ? "..." : data?.totalViolations || 0, icon: AlertCircle, color: "text-rose-500 bg-rose-500/10" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard Mustahiq
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Selamat datang di portal manajemen kelas. Ringkasan akademik santri yang Anda ampu ada di sini.
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
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200"
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

      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center gap-4 py-12">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Fitur Akademik Mustahiq</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Semua kewenangan mengelola kelas dan absensi dapat diakses melalui menu di bawah ini.
          </p>
        </div>
      </div>

      {/* --- QUICK LINKS / MENU UTAMA --- */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Menu Utama Mustahiq
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Akses cepat ke seluruh fitur pengajaran dan penilaian kelas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
          {NAVIGATION_CONFIG["mustahiq"].map((item: any, itemIdx) => {
            if (item.label === "Dashboard") return null; // Skip dashboard itself
            const ItemIcon = item.icon;
            return (
              <Link 
                key={itemIdx} 
                href={item.href}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all duration-200 group text-center"
              >
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                  <ItemIcon className="w-6 h-6 text-zinc-600 dark:text-zinc-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
