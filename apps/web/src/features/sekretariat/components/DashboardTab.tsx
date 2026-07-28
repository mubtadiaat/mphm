"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  ShieldAlert, 
  Heart, 
  Building2, 
  UserCheck, 
  Clock, 
  RefreshCw, 
  Plus, 
  Ticket, 
  ArrowUpRight, 
  Activity, 
  FileText, 
  Layers,
  School,
  Home,
  Database,
  Inbox,
  BookOpen,
  ClipboardList,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from "@/features/sekretariat/queries/useDashboardStats";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { useToast } from "@/components/shared/ToastContext";
import { getWorkspaceReadinessSteps, getPrerequisiteWarning, OnboardingStatus } from "@/lib/rbac";
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
  const { activeWorkspace } = useWorkspace();
  const { selectedYearId } = useAcademicYear();
  const { data: statsData, isLoading, refetch, isRefetching } = useDashboardStats(selectedYearId, activeWorkspace);
  const { toast } = useToast();

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

  // Real Database Metrics for Madrasah
  const madrasahStats = [
    { 
      label: "Total Santri Aktif", 
      value: statsData?.totalStudents ?? 0, 
      subtext: "Terdaftar di Database Diniyyah",
      badge: `${statsData?.totalStudents ?? 0} Aktif`,
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: Users, 
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20" 
    },
    { 
      label: "Rata-Rata GPA Diniyyah", 
      value: statsData?.averageGpa ? statsData.averageGpa.toFixed(2) : "0.00", 
      subtext: "Skala Nilai Kwartal 1-4",
      badge: statsData?.averageGpa ? `IPK ${statsData.averageGpa.toFixed(2)}` : "Belum Ada Nilai",
      badgeColor: statsData?.averageGpa ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
      icon: GraduationCap, 
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
    },
    { 
      label: "Tingkat Kehadiran", 
      value: `${statsData?.attendanceRate ?? 0}%`, 
      subtext: "Presensi Harian Santriwati",
      badge: `${statsData?.attendanceRate ?? 0}% Presensi`,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Calendar, 
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
    },
    { 
      label: "Pelanggaran Akademik", 
      value: statsData?.activeViolations ?? 0, 
      subtext: "Tercatat di Database Master",
      badge: `${statsData?.activeViolations ?? 0} Kasus`,
      badgeColor: statsData?.activeViolations ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: ShieldAlert, 
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20" 
    },
  ];

  // Real Database Metrics for Pondok
  const pondokStats = [
    { 
      label: "Total Santri Asrama", 
      value: statsData?.totalStudents ?? 0, 
      subtext: "Penghuni Kamar Asrama",
      badge: `${statsData?.totalStudents ?? 0} Santriwati`,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Users, 
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
    },
    { 
      label: "Total Kamar Asrama", 
      value: statsData?.totalRooms ?? 0, 
      subtext: "Tercatat di Master Gedung",
      badge: `${statsData?.totalRooms ?? 0} Kamar`,
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      icon: Building2, 
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20" 
    },
    { 
      label: "Santri Khidmah Alumni", 
      value: statsData?.totalKhidmah ?? 0, 
      subtext: "Penugasan Khidmah Aktif",
      badge: `${statsData?.totalKhidmah ?? 0} Khidmah`,
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: Heart, 
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20" 
    },
    { 
      label: "Total Wali Santri", 
      value: statsData?.totalGuardians ?? 0, 
      subtext: "Terdaftar di Profil Wali",
      badge: `${statsData?.totalGuardians ?? 0} Wali`,
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      icon: UserCheck, 
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" 
    },
  ];

  const stats = isPondok ? pondokStats : madrasahStats;

  // Tailored Quick Action Shortcuts per Institution
  const madrasahQuickActions = [
    { label: "Santri Diniyyah", subtext: "Input Biodata", href: "/sekretariat/santri", icon: Plus, iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500/40" },
    { label: "Rombel Kelas", subtext: "Kapasitas & Mustahiq", href: "/sekretariat/kelas", icon: BookOpen, iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/40" },
    { label: "Presensi Siswi", subtext: "Absensi Kelas Harian", href: "/sekretariat/kehadiran", icon: Calendar, iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400", hoverBg: "hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-500/40" },
    { label: "Kurikulum & Mapel", subtext: "Jadwal Diniyyah", href: "/sekretariat/kurikulum", icon: ClipboardList, iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400", hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-500/40" },
    { label: "Transkrip Rapor", subtext: "Cetak Rapor Kwartal", href: "/sekretariat/raport", icon: FileText, iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-500/40" },
    { label: "Konfigurasi", subtext: "Settings Cockpit", href: "/sekretariat/settings", icon: Layers, iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-500/40" },
  ];

  const pondokQuickActions = [
    { label: "Santri Asrama", subtext: "Input Biodata", href: "/sekretariat/santri", icon: Plus, iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/40" },
    { label: "Wali Santri", subtext: "Profil Smart KK", href: "/sekretariat/wali-santri", icon: UserCheck, iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-500/40" },
    { label: "Data Asrama", subtext: "Blok & Kamar", href: "/sekretariat/rooms", icon: Building2, iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400", hoverBg: "hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-500/40" },
    { label: "Perizinan Santri", subtext: "Safar, Pulang & Izin", href: "/sekretariat/perizinan", icon: Ticket, iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400", hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-500/40" },
    { label: "Takzir & Poin", subtext: "Master Kedisiplinan", href: "/sekretariat/pelanggaran", icon: ShieldAlert, iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", hoverBg: "hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-500/40" },
    { label: "Konfigurasi", subtext: "Settings Cockpit", href: "/sekretariat/settings", icon: Layers, iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500/40" },
  ];

  const quickActions = isPondok ? pondokQuickActions : madrasahQuickActions;

  // Real Database Chart Data (Strictly from DB)
  const madrasahChartData = (statsData?.performances || []).map(p => ({
    name: p.level,
    santri: p.active
  }));

  const pondokChartData = (statsData?.roomDistributions || []).map(r => ({
    name: r.roomName,
    santri: r.studentCount
  }));

  const chartData = isPondok ? pondokChartData : madrasahChartData;
  const primaryThemeColor = isPondok ? "#10b981" : "#3b82f6";

  // Real Database Audit Logs (Strictly from DB)
  const auditLogs = statsData?.recentAuditLogs || [];

  // System Readiness Wizard Calculation (100% Real DB Queries)
  const onboardingStatus: OnboardingStatus = {
    hasMundzir: (statsData?.totalMundzir ?? 0) > 0,
    hasMufattisy: (statsData?.totalMufattisy ?? 0) > 0,
    hasMustahiq: (statsData?.totalMustahiq ?? 0) > 0,
    hasMusyrifah: (statsData?.totalMusyrifah ?? 0) > 0,
    hasClasses: (statsData?.totalClasses ?? 0) > 0,
    hasSubjects: (statsData?.totalSubjects ?? 0) > 0,
    hasSantri: (statsData?.totalStudents ?? 0) > 0,
    hasRooms: (statsData?.totalRooms ?? 0) > 0,
    hasViolationTypes: (statsData?.totalViolationTypes ?? 0) > 0,
  };

  const currentSteps = getWorkspaceReadinessSteps(isPondok ? "pondok" : "madrasah", onboardingStatus);
  const completedCount = currentSteps.filter(s => s.ready).length;
  const totalStepCount = currentSteps.length;
  const readinessPercent = Math.round((completedCount / totalStepCount) * 100);
  const nextMissingStep = currentSteps.find(s => !s.ready);

  const handleStepClick = (e: React.MouseEvent, href: string) => {
    const warning = getPrerequisiteWarning(href, isPondok ? "sek.pondok" : "sek.madrasah", isPondok ? "pondok" : "madrasah", onboardingStatus);
    if (warning) {
      e.preventDefault();
      toast(warning, "warning", "Prasyarat Belum Lengkap");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Real-time Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
        isPondok
          ? "bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-zinc-900 border-emerald-500/20 dark:border-emerald-800/40"
          : "bg-gradient-to-r from-blue-950/40 via-indigo-900/20 to-zinc-900 border-blue-500/20 dark:border-blue-800/40"
      }`}>
        <div className="flex flex-col gap-3 z-10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Real-time DB Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                DATABASE SINKRON (10s)
              </span>
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
                ? "Pusat kendali operasional Sekretariat Pondok Pesantren Putri (P3HM)."
                : "Pusat kendali operasional Sekretariat Madrasah Diniyyah (MPHM)."
              }
            </p>
          </div>
        </div>

        {/* Institution Badge & Refresh Trigger */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border ${
            isPondok
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
          }`}>
            {isPondok ? <Home className="w-4 h-4 text-emerald-400" /> : <School className="w-4 h-4 text-blue-400" />}
            <span>{isPondok ? "Pondok Pesantren (P3HM)" : "Madrasah Diniyyah (MPHM)"}</span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-2xl border border-zinc-700 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="Muat Ulang Data Database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* System Readiness Wizard Progress Banner */}
      <div className="p-5 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-800 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-white tracking-wide flex items-center gap-2">
                🚀 Panduan Kesiapan Sistem Sekretariat {isPondok ? "Pondok" : "Madrasah"}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {readinessPercent}% Selesai
                </span>
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {readinessPercent === 100
                  ? "Seluruh fondasi data dasar dan prasyarat operasional telah terisi 100% sempurna."
                  : `Langkah Selanjutnya: ${nextMissingStep?.label || "Lengkapi Data Prasyarat"}`
                }
              </p>
            </div>
          </div>

          {nextMissingStep && (
            <Link
              href={nextMissingStep.href}
              onClick={(e) => handleStepClick(e, nextMissingStep.href)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>+ Isi {nextMissingStep.label} Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Progress Bar & Steps Badges */}
        <div className="space-y-2">
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700/50">
            <div
              className={`h-full transition-all duration-500 ${isPondok ? "bg-emerald-500" : "bg-blue-500"}`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {currentSteps.map((stepItem, sIdx) => (
              <div
                key={sIdx}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 border transition-all ${
                  stepItem.ready
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                <CheckCircle2 className={`w-3 h-3 ${stepItem.ready ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{stepItem.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailored Quick Action Shortcuts Bar */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
        <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">
          ⚡ Akses Cepat Sekretariat {isPondok ? "Pondok (P3HM)" : "Madrasah (MPHM)"}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                onClick={(e) => handleStepClick(e, action.href)}
                className={`p-3 bg-zinc-50 dark:bg-zinc-800/50 ${action.hoverBg} border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center gap-2.5 transition-all group`}
              >
                <div className={`p-2 ${action.iconBg} rounded-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {action.label}
                  </span>
                  <span className="text-[10px] text-zinc-400">{action.subtext}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI Stats Cards Grid (Pure Real Database) */}
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

      {/* Charts & Real-time Database Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart (Pure Database Records) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>{isPondok ? "Distribusi Santri per Kamar Asrama" : "Distribusi Santri per Jenjang Diniyyah"}</span>
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Data aktual persebaran dari database.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold rounded-lg font-mono">
              Real DB Data
            </span>
          </div>
          
          <div className="flex-1 min-h-[280px] flex items-center justify-center w-full pt-2">
            {isLoading ? (
              <div className="text-sm text-zinc-400 font-medium">Memuat data database...</div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 py-12">
                <Inbox className="w-8 h-8 stroke-1 text-zinc-500" />
                <span className="text-xs font-bold">Belum ada data distribusi {isPondok ? "kamar asrama" : "jenjang kelas"} di database</span>
              </div>
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

        {/* Real-time Activity Log Panel (Pure Database Audit Log) */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Log Aktivitas Real-Time DB</span>
            </h2>
            <Link
              href="/sekretariat/audit-log"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Semua Log</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[290px] pr-1">
            {auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 py-12">
                <Inbox className="w-8 h-8 stroke-1 text-zinc-500" />
                <span className="text-xs font-bold text-center">Belum ada riwayat aktivitas audit log di database</span>
              </div>
            ) : (
              auditLogs.map((log) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
