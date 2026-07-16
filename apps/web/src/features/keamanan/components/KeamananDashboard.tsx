"use client";

import { motion } from "framer-motion";
import { Users, AlertTriangle, Calendar } from "lucide-react";
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

interface KeamananStats {
  todayViolations: number;
  monthViolations: number;
  severityBreakdown: { severity: string; count: number }[];
}

export function KeamananDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["keamanan-dashboard-stats"],
    queryFn: async () => {
      const res = await apiRequest<{ data: KeamananStats }>("/api/keamanan/dashboard/stats");
      return res.data;
    },
  });

  const stats = [
    { label: "Pelanggaran Hari Ini", value: isLoading ? "..." : data?.todayViolations || 0, icon: AlertTriangle, color: "text-rose-500 bg-rose-500/10" },
    { label: "Pelanggaran Bulan Ini", value: isLoading ? "..." : data?.monthViolations || 0, icon: Calendar, color: "text-amber-500 bg-amber-500/10" },
    { label: "Kategori Ringan", value: isLoading ? "..." : (data?.severityBreakdown?.find((s) => s.severity === 'Ringan')?.count || 0), icon: Users, color: "text-blue-500 bg-blue-500/10" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard Keamanan
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Pusat pemantauan tingkat kedisiplinan dan pencatatan pelanggaran santri.
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
    </div>
  );
}
