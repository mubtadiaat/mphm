"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Calendar, ShieldAlert, Home, Heart, BookOpen, Sparkles, Building2, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from "@/features/sekretariat/queries/useDashboardStats";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { SEKRETARIAT_MADRASAH_NAV, SEKRETARIAT_PONDOK_NAV } from "@/config/navigation.config";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";

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

  const isPondok = activeWorkspace === "pondok";

  const madrasahStats = [
    { label: "Total Santri Aktif", value: statsData?.totalStudents ?? 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Rata-Rata GPA Sakral", value: statsData?.averageGpa ?? 0, icon: GraduationCap, color: "text-amber-500 bg-amber-500/10" },
    { label: "Tingkat Kehadiran", value: `${statsData?.attendanceRate ?? 100}%`, icon: Calendar, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Pelanggaran Akademik", value: statsData?.activeViolations ?? 0, icon: ShieldAlert, color: "text-rose-500 bg-rose-500/10" },
  ];

  const pondokStats = [
    { label: "Total Santri Asrama", value: statsData?.totalStudents ?? 0, icon: Users, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Total Kamar / Asrama", value: statsData?.totalRooms ?? 18, icon: Building2, color: "text-teal-500 bg-teal-500/10" },
    { label: "Santri Khidmah Alumni", value: statsData?.totalKhidmah ?? 0, icon: Heart, color: "text-rose-500 bg-rose-500/10" },
    { label: "Total Wali Santri", value: statsData?.totalGuardians ?? 0, icon: UserCheck, color: "text-indigo-500 bg-indigo-500/10" },
  ];

  const stats = isPondok ? pondokStats : madrasahStats;

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

  const chartData = isPondok ? pondokChartData : madrasahChartData;
  const primaryThemeColor = isPondok ? "#10b981" : "#3b82f6";

  return (
    <div className="flex flex-col gap-6">
      {/* Workspace Distinct Banner Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
        isPondok
          ? "bg-gradient-to-r from-emerald-900/20 via-teal-900/10 to-transparent border-emerald-500/20 dark:border-emerald-800/40"
          : "bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-transparent border-blue-500/20 dark:border-blue-800/40"
      }`}>
        <div className="flex flex-col gap-2 z-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit border ${
            isPondok
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
          }`}>
            <span>{isPondok ? "🏠 Workspace Pondok Pesantren" : "🏫 Workspace Madrasah Diniyyah"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {isPondok ? "Dashboard Pengasuhan & Kedisiplinan Asrama" : "Dashboard Kurikulum & Akademik Madrasah"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            {isPondok 
              ? "Pusat pengelolaan kamar asrama santriwati, data pengurus mundzir, kedisiplinan takzir, pengabdian khidmah, dan wali santri."
              : "Pusat pengelolaan rombel kelas, penilaian 5 pelajaran sakral, presensi, mufattisy, mustahiq, dan penceretakan raport."
            }
          </p>
        </div>

        <div className={`hidden lg:flex items-center gap-2 px-4 py-3 rounded-2xl border backdrop-blur-md text-xs font-semibold shrink-0 ${
          isPondok
            ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300"
            : "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300"
        }`}>
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Sistem Sinkronisasi {isPondok ? "Asrama" : "Akademik"} Realtime</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={cardVariants}>
              <SpotlightCard className="p-6 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {stat.label}
                  </span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {isLoading ? "..." : stat.value}
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-xs relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>{isPondok ? "Distribusi Santri per Kamar Asrama" : "Distribusi Santri per Jenjang Pendidikan"}</span>
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {isPondok ? "Statistik kapasitas dan keterisian santri di setiap gedung kamar asrama." : "Statistik persebaran santri di tingkatan I'dadiyyah hingga Aliyyah."}
            </p>
          </div>
          
          <div className="flex-1 min-h-[300px] flex items-center justify-center w-full">
            {isLoading ? (
              <div className="text-sm text-zinc-400 font-medium">Memuat statistik data...</div>
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
                    cursor={{ fill: isPondok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                  />
                  <Bar dataKey="santri" fill={primaryThemeColor} radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dynamic Activity Log Sidepanel */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-xs overflow-y-auto max-h-[400px]">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Log Aktivitas {isPondok ? "Asrama" : "Akademik"}
          </h2>
          <div className="flex flex-col gap-3 mt-1">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800/60 text-xs space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                {isPondok ? "Kamar Asrama Khadijah 1" : "Tahun Akademik 2026/2027"}
              </span>
              <p className="text-zinc-500 dark:text-zinc-400">
                {isPondok ? "Pembaruan data penghuni kamar oleh Mundzir." : "Kalender akademik aktif terpantau berjalan lancar."}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800/60 text-xs space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                {isPondok ? "Poin Takzir Kedisiplinan" : "Input Nilai Kwartal III"}
              </span>
              <p className="text-zinc-500 dark:text-zinc-400">
                {isPondok ? "Sistem merekapitulasi poin takzir santri aktif." : "Matriks nilai sakral terhubung ke database."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Menu Shortcuts */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Menu Utama {isPondok ? "Ruang Kerja Pondok" : "Ruang Kerja Madrasah"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Akses cepat ke modul {isPondok ? "pengasuhan dan asrama" : "akademik dan kurikulum"} yang tersedia.
          </p>
        </div>

        <div className="flex flex-col gap-8 mt-2">
          {(isPondok ? SEKRETARIAT_PONDOK_NAV : SEKRETARIAT_MADRASAH_NAV).map((group, groupIdx) => {
            if (!("items" in group)) return null;

            return (
              <div key={groupIdx} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  {group.group}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {group.items.map((item, itemIdx) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link 
                        key={itemIdx} 
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all duration-200 group text-center shadow-xs ${
                          isPondok
                            ? "hover:border-emerald-500 hover:shadow-emerald-500/10"
                            : "hover:border-blue-500 hover:shadow-blue-500/10"
                        }`}
                      >
                        <div className={`p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl transition-colors ${
                          isPondok
                            ? "group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10"
                            : "group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10"
                        }`}>
                          <ItemIcon className={`w-6 h-6 text-zinc-600 dark:text-zinc-400 transition-colors ${
                            isPondok ? "group-hover:text-emerald-500" : "group-hover:text-blue-500"
                          }`} />
                        </div>
                        <span className={`text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors ${
                          isPondok ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400" : "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }`}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
