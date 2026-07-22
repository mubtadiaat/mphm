"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Calendar, ShieldAlert, Home, Heart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from "@/features/sekretariat/queries/useDashboardStats";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useWorkspace } from "@/components/shared/WorkspaceContext";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function DashboardTab() {
  const { activeWorkspace } = useWorkspace();
  const { selectedYearId } = useAcademicYear();
  const { data: statsData, isLoading } = useDashboardStats(selectedYearId, activeWorkspace);

  const madrasahStats = [
    { label: "Total Santri Aktif", value: statsData?.totalStudents ?? 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Rata-Rata GPA", value: statsData?.averageGpa ?? 0, icon: GraduationCap, color: "text-amber-500 bg-amber-500/10" },
    { label: "Kehadiran (%)", value: `${statsData?.attendanceRate ?? 100}%`, icon: Calendar, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Pelanggaran Aktif", value: statsData?.activeViolations ?? 0, icon: ShieldAlert, color: "text-rose-500 bg-rose-500/10" },
  ];

  const pondokStats = [
    { label: "Total Santri Asrama", value: statsData?.totalStudents ?? 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Total Kamar/Asrama", value: statsData?.totalRooms ?? 0, icon: Home, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Santri Khidmah", value: statsData?.totalKhidmah ?? 0, icon: Heart, color: "text-rose-500 bg-rose-500/10" },
    { label: "Pelanggaran Asrama", value: statsData?.activeViolations ?? 0, icon: ShieldAlert, color: "text-amber-500 bg-amber-500/10" },
  ];

  const stats = activeWorkspace === "pondok" ? pondokStats : madrasahStats;

  // Map performances for the chart, handling potentially missing levels
  const madrasahChartData = [
    { name: "I'dadiyyah", santri: statsData?.performances?.find(p => p.level === "I'dadiyyah")?.active ?? 0 },
    { name: "Ibtida'iyyah", santri: statsData?.performances?.find(p => p.level === "Ibtida'iyyah")?.active ?? 0 },
    { name: "Tsanawiyyah", santri: statsData?.performances?.find(p => p.level === "Tsanawiyyah")?.active ?? 0 },
    { name: "Aliyyah", santri: statsData?.performances?.find(p => p.level === "Aliyyah")?.active ?? 0 },
  ];

  const pondokChartData = (statsData?.roomDistributions || []).map(r => ({
    name: r.roomName,
    santri: r.studentCount
  }));

  const chartData = activeWorkspace === "pondok" ? pondokChartData : madrasahChartData;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white capitalize">
            Dashboard {activeWorkspace}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Selamat datang di portal manajemen administratif MPHM Enterprise v4.0.
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
                  {isLoading ? "..." : stat.value}
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {activeWorkspace === "pondok" ? "Distribusi Santri per Asrama" : "Distribusi Santri per Jenjang"}
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {activeWorkspace === "pondok" ? "Statistik persebaran santri di setiap kamar asrama." : "Statistik persebaran santri di berbagai tingkatan."}
            </p>
          </div>
          
          <div className="flex-1 min-h-[300px] flex items-center justify-center w-full">
            {isLoading ? (
              <div className="text-sm text-zinc-400 font-medium">Memuat statistik...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                  />
                  <Bar dataKey="santri" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-sm overflow-y-auto max-h-[400px]">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Log Aktivitas Terbaru</h2>
          <div className="flex flex-col gap-4 mt-2">
             <div className="text-xs font-semibold text-zinc-400 text-center py-10 italic">
               Belum ada log aktivitas hari ini.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
