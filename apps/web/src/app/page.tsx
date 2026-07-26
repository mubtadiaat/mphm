"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Smartphone,
  Users,
  BookOpen,
  HelpCircle,
  ChevronDown,
  UserPlus,
  Heart,
  Zap,
  Lock,
  GraduationCap,
  ShieldAlert,
  Download,
  Monitor,
  CheckCircle2,
  FileCode
} from "lucide-react";

const ROLE_REDIRECT_MAP: Record<string, string> = {
  "sek.pondok": "/sekretariat",
  "sek.madrasah": "/sekretariat",
  sekretariat: "/sekretariat",
  mufattisy: "/mufattisy",
  mundzir: "/pimpinan",
  pimpinan: "/pimpinan",
  mustahiq: "/mustahiq",
  keamanan: "/keamanan",
  "petugas keamanan": "/keamanan",
  "wali santri": "/guardian",
  wali_santri: "/guardian",
};

function getRedirectUrlByRole(role: string): string {
  return ROLE_REDIRECT_MAP[role.trim().toLowerCase()] || "/mustahiq";
}

export default function Page() {
  const router = useRouter();
  const { data: user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const redirectUrl = getRedirectUrlByRole(String(user.role));
      router.replace(redirectUrl);
    }
  }, [user, router]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between items-center relative overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-500/15 via-teal-500/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[45%] right-10 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-10 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">

        {/* ========================================================================= */}
        {/* LAYAR 1: HERO & CENTRAL DOWNLOAD CARDS */}
        {/* ========================================================================= */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 max-w-5xl mx-auto py-10 relative">
          
          {/* Logo Badge & Live Online Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-3"
          >
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-zinc-950 border border-zinc-800 rounded-3xl p-3 flex items-center justify-center shadow-2xl">
                <Image 
                  src="/logo.png" 
                  alt="Logo P3HM & MPHM Lirboyo" 
                  width={80} 
                  height={80} 
                  className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform" 
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Download Center • Software &amp; Mobile App APK</span>
            </div>
          </motion.div>

          {/* Hero Heading */}
          <div className="space-y-2.5 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Unduh Aplikasi Resmi <br />
              <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Staf, Wali Santri &amp; Admin
              </span>
            </h1>
            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Pondok Pesantren Putri Hidayatul Mubtadi&apos;at (P3HM) &amp; Madrasah Putri Hidayatul Mubtadi&apos;at (MPHM) Lirboyo Kediri.
            </p>
          </div>

          {/* 3 Primary Download Cards */}
          <div id="download-section" className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2 max-w-5xl mx-auto">
            
            {/* Download Card 1: Staff APK */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-6 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 hover:from-zinc-900 hover:to-zinc-900 border border-indigo-500/40 hover:border-indigo-500/90 rounded-3xl transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Android APK
                </span>
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-white">App Staff (.apk)</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Khusus Guru Mustahiq, Mufatish, Mundzir, Musyrifah, dan Petugas Keamanan.
                </p>
              </div>

              <a
                href="https://github.com/mubtadiaat/app_software/releases/latest/download/Mubtadiaat.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/25"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download APK Staf</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            {/* Download Card 2: Wali Santri APK */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-6 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 hover:from-zinc-900 hover:to-zinc-900 border border-cyan-500/40 hover:border-cyan-500/90 rounded-3xl transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  Android APK
                </span>
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-white">App Wali Santri (.apk)</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Pantau Nilai Raport Akademik, Perizinan Pulang, &amp; Smart KK Orang Tua.
                </p>
              </div>

              <a
                href="https://github.com/mubtadiaat/app_software/releases/latest/download/e-Mubtadiaat.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/25"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download APK Wali</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            {/* Download Card 3: Software Admin EXE */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-6 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 hover:from-zinc-900 hover:to-zinc-900 border border-emerald-500/40 hover:border-emerald-500/90 rounded-3xl transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Windows EXE
                </span>
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-white">Software Admin (.exe)</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Aplikasi Desktop khusus Sekretariat Pondok, Sek. Madrasah &amp; Super Admin.
                </p>
              </div>

              <a
                href="https://github.com/mubtadiaat/app_software/releases/latest/download/Admin.Mubtadiaat.Setup.exe"
                target="_blank"
                rel="noopener noreferrer"
                className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/25"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download Setup Admin</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

          </div>

          {/* Scroll Down Indicator */}
          <div className="pt-2 animate-bounce flex flex-col items-center gap-1 text-zinc-500 text-[11px]">
            <span>Scroll ke bawah untuk melihat fitur &amp; panduan pendaftaran</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 2: SHOWCASE IMAGE MULTI-DEVICE */}
        {/* ========================================================================= */}
        <section className="py-12 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Visual Ekosistem Multi-Perangkat</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">Antarmuka Realtime Perangkat</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Visualisasi resmi sistem aplikasi pesantren di Desktop Monitor, Tablet, dan Smartphone Mobile.
            </p>
          </div>

          <div className="w-full relative group max-w-5xl mx-auto">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/25 via-teal-500/25 to-cyan-500/25 rounded-3xl blur-3xl opacity-70 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800/80 p-2 sm:p-4 shadow-2xl overflow-hidden backdrop-blur-2xl">
              {/* Top Mac-Style Bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800/80 mb-2 sm:mb-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] sm:text-[11px] truncate max-w-[200px] sm:max-w-none">
                  <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Sistem Informasi Pesantren P3HM &amp; MPHM Lirboyo</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Realtime Sync</span>
                </div>
              </div>

              {/* User Uploaded Image Container */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-2xl">
                <Image
                  src="/user-showcase.jpg"
                  alt="Real Application Desktop & Mobile Showcase P3HM & MPHM Lirboyo"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  priority
                />
              </div>

              {/* Bottom Feature Badges */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-indigo-400 font-bold flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Akademik Raport Diniyyah</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-cyan-400 font-bold flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Mobile Wali Santri Smart KK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Kedisiplinan &amp; Perizinan Pulang</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 3: INFORMASI LENGKAP MODUL STAF & WALI SANTRI */}
        {/* ========================================================================= */}
        <section className="py-8 space-y-8 sm:space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Modul Layanan Staf &amp; Wali</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">Fitur Utama Pengurus &amp; Orang Tua</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Panduan lengkap fasilitas digital bagi Dewan Pengajar Mustahiq, Pengurus Mufattisy, Mundzir, Musyrifah, dan Wali Santri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Feature 1: Akademik Diniyyah */}
            <div className="p-6 sm:p-7 bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white">Akademik Diniyyah (MPHM)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Khusus Ustadz/Ustadzah Mustahiq untuk mengisi presensi jam mengajar harian, penilaian kwartal rombel kelas (I&apos;dadiyyah hingga Aliyyah), serta penerbitan Raport Digital.
              </p>
            </div>

            {/* Feature 2: Pengasuhan & Perizinan */}
            <div className="p-6 sm:p-7 bg-zinc-900/80 border border-zinc-800 hover:border-rose-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white">Pengasuhan &amp; Perizinan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Digunakan oleh Mufattisy, Musyrifah, dan Keamanan untuk menerbitkan Surat Izin Pulang, mencatat poin kedisiplinan, serta memvalidasi kepulangan santriwati.
              </p>
            </div>

            {/* Feature 3: Portal Wali Santri */}
            <div className="p-6 sm:p-7 bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white">Portal Smart KK Wali Santri</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Memudahkan orang tua memantau perkembangan akademik anak, mengecek status persetujuan perizinan pulang, serta melakukan pendaftaran mandiri dengan Nomor Kartu Keluarga.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 4: CARA PENDAFTARAN WALI SANTRI (SMART KK GUIDE) */}
        {/* ========================================================================= */}
        <section className="p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-cyan-500/40 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6 sm:pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>Panduan Resmi Pendaftaran Orang Tua</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Cara Pendaftaran Akun Wali Santri Baru (Smart KK)</h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Ikuti 4 langkah praktis berikut untuk mengunduh aplikasi dan mendaftarkan akun wali santri agar terhubung otomatis dengan data anak Anda di pesantren:
              </p>
            </div>

            <a
              href="https://github.com/mubtadiaat/app_software/releases/latest/download/e-Mubtadiaat.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 sm:py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-3 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download App Wali Santri (.apk)</span>
            </a>
          </div>

          {/* 4 Steps Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Step 01 */}
            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                01
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Unduh &amp; Buka App Wali</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Unduh file <strong>e-Mubtadiaat.apk</strong> dari tombol di atas lalu buka aplikasi di HP Android Anda.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                02
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Pilih Tab Pendaftaran Baru</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Di layar aplikasi Wali Santri, pilih opsi tab <strong>Pendaftaran Baru</strong> untuk membuka formulir registrasi.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                03
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Isi No. KK &amp; WhatsApp</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Lengkapi Nama Lengkap Wali (KTP), Nomor Kartu Keluarga (16 Digit), Nomor WA aktif, Username, &amp; Password pilihan Anda.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                04
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Selesai &amp; Otomatis Terhubung</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Klik <strong>Daftar Akun</strong>. Akun Anda langsung aktif dan otomatis terintegrasi dengan profil anak melalui sistem Smart KK!
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 5: FAQ & PETUNJUK PENGGUNAAN */}
        {/* ========================================================================= */}
        <section className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full py-4">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Penggunaan Aplikasi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Pertanyaan Umum &amp; Petunjuk Akses</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Petunjuk singkat mengenai cara mengunduh dan memasang aplikasi sesuai hak akses akun Anda.
            </p>
          </div>

          <div className="space-y-3">
            
            {/* FAQ 1 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-4 sm:p-5 text-left font-extrabold text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Ustadz Mustahiq &amp; Pengurus mengakses aplikasi?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 1 ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {activeFaq === 1 && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Mustahiq, Mufattisy, Mundzir, Musyrifah, dan Petugas Keamanan dapat mengunduh <strong>App Staff (.apk)</strong> dari tombol unduh bagian atas.
                  </p>
                  <p>
                    Pasang file APK di HP Android Anda, lalu buka aplikasi untuk login. Mustahiq dapat langsung menginput presensi jam mengajar serta mengisi nilai kwartal santriwati.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-4 sm:p-5 text-left font-extrabold text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Wali Santri mendaftar dan memantau akademik anak?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 2 ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
              {activeFaq === 2 && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Orang tua santriwati mengunduh <strong>App Wali Santri (.apk)</strong>, kemudian membuka aplikasi di HP dan memilih tab <strong>Pendaftaran Baru</strong>. Masukkan nomor Kartu Keluarga (KK) yang terdaftar untuk membuat akun mandiri.
                  </p>
                  <p>
                    Setelah akun aktif, Anda dapat melihat nilai raport kwartal anak, status perizinan pulang, dan rekapan poin kedisiplinan langsung dari aplikasi HP Anda.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full p-4 sm:p-5 text-left font-extrabold text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Sekretariat mengunduh Software Admin Desktop?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 3 ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              {activeFaq === 3 && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  Sekretariat Pondok, Sek. Madrasah, &amp; Super Admin dapat mengunduh <strong>Software Admin (.exe)</strong> untuk Windows. Jalankan installer `Admin.Mubtadiaat.Setup.exe` dan login menggunakan kredensial Sekretariat yang diberikan.
                </div>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-10 sm:py-12 px-4 sm:px-6 lg:px-12 mt-12 sm:mt-16 relative z-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <Image src="/logo.png" alt="Logo P3HM & MPHM Lirboyo" width={36} height={36} className="rounded-xl opacity-90 shrink-0" />
            <div>
              <div className="font-black text-sm text-zinc-200">P3HM &amp; MPHM Lirboyo Kediri</div>
              <div className="text-[11px] text-zinc-400">Pondok Pesantren Putri Hidayatul Mubtadi'at &amp; Madrasah Putri Hidayatul Mubtadi'at</div>
            </div>
          </div>

          {/* Privacy & Terms Links */}
          <div className="flex items-center gap-6 font-bold text-zinc-400">
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
              Kebijakan Privasi (Privacy Policy)
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">
              Syarat &amp; Ketentuan (Terms of Service)
            </Link>
          </div>

          <div className="text-center md:text-right text-[11px]">
            <div className="text-zinc-400 font-semibold">&copy; 2026 P3HM &amp; MPHM Lirboyo. All rights reserved.</div>
            <div className="text-zinc-600 font-mono text-[10px] mt-0.5">Dev: DEVELZY Indonesia ®2025</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
