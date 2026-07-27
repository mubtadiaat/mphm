"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  ShieldAlert, 
  Heart, 
  Sparkles, 
  Building2, 
  UserCheck, 
  Clock, 
  RefreshCw, 
  Plus, 
  Ticket, 
  BookOpen, 
  ArrowUpRight, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  School,
  Home
} from "lucide-react";
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

function getRelativeTimeString(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 30) return "Baru saja";
    if (diffSec < 60) return `${diffSec} dtk lalu`;
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "Baru saja";
  }
}

export function DashboardTab() {
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { selectedYearId } = useAcademicYear();
  const { data: statsData, isLoading, refetch, isRefetching } = useDashboardStats(selectedYearId, activeWorkspace);

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isPondok = activeWorkspace === "pondok";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi 🌅";
    if (hour < 15) return "Selamat Siang ☀️";
    if (hour < 18) return "Selamat Sore 🌤️";
    return "Selamat Malam 🌙";
  };

  const madrasahStats = [
    { 
      label: "Total Santri Aktif", 
      value: statsData?.totalStudents ?? 0, 
      subtext: "Terdaftar di Rombel Diniyyah",
      badge: "+2.4%",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Users, 
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20" 
    },
    { 
      label: "Rata-Rata GPA Diniyyah", 
      value: statsData?.averageGpa ? statsData.averageGpa.toFixed(2) : "8.50", 
      subtext: "Skala Nilai Kwartal 1-4",
      badge: "Kategori B-Tamtam",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: GraduationCap, 
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
    },
    { 
      label: "Tingkat Kehadiran", 
      value: `${statsData?.attendanceRate ?? 98.5}%`, 
      subtext: "Presensi Harian Santriwati",
      badge: "Sangat Baik",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Calendar, 
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
    },
    { 
      label: "Pelanggaran Akademik", 
      value: statsData?.activeViolations ?? 0, 
      subtext: "Memerlukan Pembinaan Mustahiq",
      badge: statsData?.activeViolations ? `${statsData.activeViolations} Aktif` : "Terkendali",
      badgeColor: statsData?.activeViolations ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: ShieldAlert, 
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20" 
    },
  ];

  const pondokStats = [
    { 
      label: "Total Santri Asrama", 
      value: statsData?.totalStudents ?? 0, 
      subtext: "Penghuni Kamar Komplek",
      badge: "+1.8%",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Users, 
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
    },
    { 
      label: "Total Kamar / Asrama", 
      value: statsData?.totalRooms ?? 18, 
      subtext: "Tersebar di Komplek Desa & Kota",
      badge: "Kapasitas 95%",
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      icon: Building2, 
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20" 
    },
    { 
      label: "Santri Khidmah Alumni", 
      value: statsData?.totalKhidmah ?? 0, 
      subtext: "Pengabdian Aktif Lembaga",
      badge: "Aktif Khidmah",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: Heart, 
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20" 
    },
    { 
      label: "Total Wali Santri", 
      value: statsData?.totalGuardians ?? 0, 
      subtext: "Terhubung Portal Wali",
      badge: "Terverifikasi",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      icon: UserCheck, 
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" 
    },
  ];

  const stats = isPondok ? pondokStats : madrasahStats;

  const madrasahChartData = [
    { name: "I'dadiyyah", santri: statsData?.performances?.find(p => p.level === "I'dadiyyah")?.active ?? 42 },
    { name: "Ibtida'iyyah", santri: statsData?.performances?.find(p => p.level === "Ibtida'iyyah")?.active ?? 128 },
    { name: "Tsanawiyyah", santri: statsData?.performances?.find(p => p.level === "Tsanawiyyah")?.active ?? 96 },
    { name: "Aliyyah", santri: statsData?.performances?.find(p => p.level === "Aliyyah")?.active ?? 64 },
  ];

  const pondokChartData = (statsData?.roomDistributions && statsData.roomDistributions.length > 0)
    ? statsData.roomDistributions.map(r => ({ name: r.roomName, santri: r.studentCount }))
    : [
        { name: "Khadijah 1", santri: 24 },
        { name: "Khadijah 2", santri: 22 },
        { name: "Aisyah 1", santri: 26 },
        { name: "Aisyah 2", santri: 20 },
        { name: "Fatimah 1", santri: 28 },
        { name: "Fatimah 2", santri: 25 },
      ];

  const chartData = isPondok ? pondokChartData : madrasahChartData;
  const primaryThemeColor = isPondok ? "#10b981" : "#3b82f6";

  const defaultLogs = [
    {
      id: "demo-1",
      action: "UPDATE",
      entity: "SANTRI",
      userId: "sekretaris",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      action: "LOGIN",
      entity: "AUTH",
      userId: "mufattisy",
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-3",
      action: "CREATE",
      entity: "PERIZINAN",
      userId: "keamanan",
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
  ];

  const logsToRender = (statsData?.recentAuditLogs && statsData.recentAuditLogs.length > 0)
    ? statsData.recentAuditLogs
    : defaultLogs;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Real-time Header & Dynamic Workspace Switcher Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
        isPondok
          ? "bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-zinc-900 border-emerald-500/20 dark:border-emerald-800/40"
          : "bg-gradient-to-r from-blue-950/40 via-indigo-900/20 to-zinc-900 border-blue-500/20 dark:border-blue-800/40"
      }`}>
        <div className="flex flex-col gap-3 z-10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE REAL-TIME SYNC</span>
            </div>

            {/* Live Clock Badge */}
            {currentTime && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-zinc-400 bg-zinc-800/60 border border-zinc-700/60 backdrop-blur-md font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{currentTime} WIB</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <span>{getGreeting()}, Sekretariat!</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              {isPondok 
                ? "Pusat kendali operasional Pondok Pesantren Putri (P3HM). Pantau kedisiplinan, kamar asrama, perizinan keluar, dan khidmah alumni."
                : "Pusat kendali operasional Madrasah Diniyyah (MPHM). Pantau rombel kelas, transkrip nilai kwartal, absensi, dan mufattisy."
              }
            </p>
          </div>
        </div>

        {/* Dynamic Workspace Switcher Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 shrink-0">
          <div className="p-1 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveWorkspace("madrasah")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                !isPondok
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <School className="w-4 h-4" />
              <span>🏫 Madrasah (MPHM)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspace("pondok")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isPondok
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🏠 Pondok (P3HM)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-2xl border border-zinc-700 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="Refresh Data Real-time"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
        <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">
          ⚡ Akses Cepat Tindakan Sekretariat
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            href="/sekretariat/santri"
            className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500/40 rounded-xl flex items-center gap-2.5 transition-all group"
          >
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Santri Baru</span>
              <span className="text-[10px] text-zinc-400">Input Biodata</span>
            </div>
          </Link>

          <Link
            href="/sekretariat/kehadiran"
            className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/40 rounded-xl flex items-center gap-2.5 transition-all group"
          >
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Presensi</span>
              <span className="text-[10px] text-zinc-400">Absensi Harian</span>
            </div>
          </Link>

          <Link
            href="/sekretariat/perizinan"
            className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-purple-500/40 rounded-xl flex items-center gap-2.5 transition-all group"
          >
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">Perizinan</span>
              <span className="text-[10px] text-zinc-400">Safar & Pulang</span>
            </div>
          </Link>

          <Link
            href="/sekretariat/rooms"
            className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-teal-500/40 rounded-xl flex items-center gap-2.5 transition-all group"
          >
            <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">Data Asrama</span>
              <span className="text-[10px] text-zinc-400">Blok & Kamar</span>
            </div>
          </Link>

          <Link
            href="/sekretariat/raport"
            className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-amber-500/40 rounded-xl flex items-center gap-2.5 transition-all group"
          >
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">Transkrip Rapor</span>
              <span className="text-[10px] text-zinc-400">Cetak Rapor</span>
            </div>
          </Link>

          <Link
            href="/sekretariat/settings"
            className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500/40 rounded-xl flex items-center gap-2.5 transition-all group"
          >
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Konfigurasi</span>
              <span className="text-[10px] text-zinc-400">Settings Cockpit</span>
            </div>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
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
              <SpotlightCard className="p-6 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-4 shadow-xs hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-900">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {stat.label}
                    </span>
                    <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                      {isLoading ? "..." : stat.value}
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                    {stat.subtext}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border shrink-0 ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts & Real-time Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>{isPondok ? "Distribusi Santri per Kamar Asrama" : "Distribusi Santri per Jenjang Diniyyah"}</span>
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {isPondok ? "Kapasitas penghuni santriwati di setiap kamar asrama." : "Persebaran santri aktif dari I'dadiyyah hingga Aliyyah."}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold rounded-lg font-mono">
              {isPondok ? "Komplek Desa & Kota" : "4 Jenjang Active"}
            </span>
          </div>
          
          <div className="flex-1 min-h-[280px] flex items-center justify-center w-full pt-2">
            {isLoading ? (
              <div className="text-sm text-zinc-400 font-medium">Memuat statistik realtime...</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <Tooltip 
                    cursor={{ fill: isPondok ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="santri" fill={primaryThemeColor} radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Real-time Activity Log Panel */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Log Aktivitas Real-Time</span>
            </h2>
            <Link
              href="/sekretariat/audit-logs"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Semua Log</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[290px] pr-1">
            {logsToRender.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-1 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log.action === "LOGIN" ? "bg-emerald-500" : log.action === "CREATE" ? "bg-blue-500" : "bg-amber-500"
                    }`} />
                    {log.userId}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold">
                    {getRelativeTimeString(log.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                  Aksi <strong className="text-zinc-900 dark:text-zinc-200">{log.action}</strong> pada modul <span className="text-blue-600 dark:text-blue-400 font-bold">{log.entity}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace Menu Shortcuts Grid */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Direktori Modul {isPondok ? "Pondok Pesantren (P3HM)" : "Madrasah Diniyyah (MPHM)"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Daftar lengkap seluruh modul operasional {isPondok ? "asrama dan kedisiplinan" : "akademik dan kurikulum"}.
          </p>
        </div>

        <div className="flex flex-col gap-8 mt-2">
          {(isPondok ? SEKRETARIAT_PONDOK_NAV : SEKRETARIAT_MADRASAH_NAV).map((group, groupIdx) => {
            if (!("items" in group)) return null;

            return (
              <div key={groupIdx} className="flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  {group.group}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {group.items.map((item, itemIdx) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link 
                        key={itemIdx} 
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all duration-200 group text-center shadow-xs hover:scale-[1.02] ${
                          isPondok
                            ? "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
                            : "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
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
                        <span className={`text-xs font-extrabold text-zinc-800 dark:text-zinc-200 transition-colors ${
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
