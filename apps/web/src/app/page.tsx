"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  Users,
  Database,
  UserCheck,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  Tablet,
  BookOpen,
  FileSpreadsheet,
  Award,
  HelpCircle,
  ChevronDown,
  UserPlus,
  Phone,
  FileText,
  Clock,
  Zap,
  Globe,
  Heart
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
  return ROLE_REDIRECT_MAP[role.trim().toLowerCase()] || "/sekretariat";
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
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between items-center relative overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Glow Lights */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-16 sm:space-y-24 relative z-10">

        {/* SECTION 1: HERO SECTION */}
        <section className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto pt-4">
          
          {/* Logo Badge & Live Online Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-zinc-950 border border-zinc-800 rounded-3xl p-3 flex items-center justify-center shadow-2xl">
                <Image 
                  src="/logo.png" 
                  alt="Logo P3HM & MPHM Lirboyo" 
                  width={80} 
                  height={80} 
                  className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform" 
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>P3HM &amp; MPHM Lirboyo • System Realtime 2026/2027</span>
            </div>
          </motion.div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Sistem Informasi Pesantren <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                &amp; Akademik Diniyyah
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Platform Manajemen Terpadu Pondok Pesantren Putri Hidayatul Mubtadi&apos;at (P3HM) &amp; Madrasah Putri Hidayatul Mubtadi&apos;at (MPHM) Lirboyo Kediri.
            </p>
          </div>

          {/* 3 Dedicated Portal Gateway Access Cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {/* Card 1: Sekretariat */}
            <div 
              onClick={() => router.push("/loginsekr")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500/80 rounded-3xl transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 group-hover:h-1.5 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mb-1.5">
                  Desktop &amp; Web
                </span>
                <h3 className="font-black text-base text-white">Portal Sekretariat</h3>
                <p className="text-xs text-zinc-400 mt-1">Super Admin &amp; Pengelola Pondok/Madrasah</p>
              </div>
            </div>

            {/* Card 2: Staff / Portal Login */}
            <div 
              onClick={() => router.push("/loginStaff")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-900 border border-indigo-500/30 hover:border-indigo-500/80 rounded-3xl transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 group-hover:h-1.5 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 inline-block mb-1.5">
                  Android Mobile App
                </span>
                <h3 className="font-black text-base text-white">Portal Login</h3>
                <p className="text-xs text-zinc-400 mt-1">Mustahiq • Mufatish • Mundzir • Musyrifah</p>
              </div>
            </div>

            {/* Card 3: Wali Santri */}
            <div 
              onClick={() => router.push("/loginguardiant")}
              className="p-5 bg-zinc-900/90 hover:bg-zinc-900 border border-cyan-500/30 hover:border-cyan-500/80 rounded-3xl transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 group-hover:h-1.5 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 inline-block mb-1.5">
                  Wali &amp; Orang Tua
                </span>
                <h3 className="font-black text-base text-white">Portal Wali Santri</h3>
                <p className="text-xs text-zinc-400 mt-1">Masuk &amp; Pendaftaran Akun Wali</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 3-DEVICE MULTI-MOCKUP REAL UI SHOWCASE (Laptop, Notebook/Tablet, Smartphone) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Device Responsive Ecosystem</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Tampilan Asli Aplikasi (Multi-Device Preview)</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Satu ekosistem terintegrasi sempurna yang responsif di Laptop, Notebook/Tablet, dan Smartphone Handphone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* DEVICE 1: LAPTOP VIEW (Col 6) */}
            <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-white">Laptop Desktop (Sekretariat System)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  1920 x 1080 Full HD
                </span>
              </div>

              {/* Mockup Dashboard Table */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={18} height={18} className="object-contain" />
                    <span className="font-bold text-white text-[11px]">P3HM Lirboyo</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">● Online (Realtime)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-sans space-y-1">
                  <div className="text-xs font-black">Pusat Pengelolaan Akun (Users)</div>
                  <div className="text-[10px] opacity-90">Monitoring 1,450 Santriwati &amp; 128 Pengurus</div>
                </div>

                <div className="space-y-1.5 text-[10px] font-sans">
                  <div className="flex justify-between p-2 bg-zinc-950 rounded-lg border border-zinc-800/80">
                    <span className="font-bold text-white">Super Admin Sistem</span>
                    <span className="text-blue-400 font-mono">sek.madrasah</span>
                    <span className="text-emerald-400 font-bold">🟢 Online</span>
                  </div>
                  <div className="flex justify-between p-2 bg-zinc-950 rounded-lg border border-zinc-800/80">
                    <span className="font-bold text-white">Ustadz Mustahiq</span>
                    <span className="text-indigo-400 font-mono">Mustahiq</span>
                    <span className="text-emerald-400 font-bold">🟢 Online</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-zinc-500 font-medium text-center">Tampilan Utama Laptop Client Sekretariat</div>
            </div>

            {/* DEVICE 2: NOTEBOOK / TABLET VIEW (Col 3) */}
            <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs text-white">Notebook / Tablet</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Tablet View
                </span>
              </div>

              {/* Mockup Mustahiq Raport */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 space-y-3 text-xs">
                <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-bold text-[11px] flex items-center justify-between">
                  <span>Portal Mustahiq</span>
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="text-white font-bold">Rombel: Ibtida'iyyah III A</div>
                    <div className="text-zinc-400 text-[9px]">Input Nilai Raport Kwartal</div>
                  </div>
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-300">Presensi Mengajar</span>
                    <span className="text-emerald-400 font-bold text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Hadir (100%)</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-zinc-500 font-medium text-center">Tampilan Optimasi Tablet / Notebook</div>
            </div>

            {/* DEVICE 3: HANDPHONE / SMARTPHONE VIEW (Col 3) */}
            <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs text-white">Smartphone Android</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Mobile App
                </span>
              </div>

              {/* Mockup Mobile App */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 space-y-3 text-xs">
                <div className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 font-bold text-[11px] flex items-center justify-between">
                  <span>Portal Wali Santri</span>
                  <Heart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="text-white font-bold">Data Anak: Aisyah Fatimah</div>
                    <div className="text-cyan-400 text-[9px] font-mono">KK: 350101******0001</div>
                  </div>
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-300">Izin Pulang</span>
                    <span className="text-emerald-400 font-bold text-[9px]">DISETUJUI</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-zinc-500 font-medium text-center">Tampilan Mobile Wali &amp; Staff</div>
            </div>

          </div>
        </section>

        {/* SECTION 3: PENJELASAN LENGKAP EKOSISTEM SISTEM & MODEL APLIKASI */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Struktur Arsitektur Modul</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Ekosistem Modul &amp; Fitur Utama Sistem</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Dirancang khusus untuk memenuhi kebutuhan tata kelola Pondok Pesantren Putri &amp; Madrasah Diniyyah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Modul 1 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-white">1. Modul Sekretariat &amp; Induk</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pengelolaan Data Induk Santriwati (P3HM), Pengurus Pondok, Dewan Pengajar Mustahiq, Dewan Pengawas Mufattisy, Pimpinan Mundzir, serta Manajemen Asrama Blok &amp; Kamar.
              </p>
            </div>

            {/* Modul 2 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-white">2. Akademik Diniyyah (MPHM)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Manajemen Rombel &amp; Kelas Diniyyah (I'dadiyyah, Ibtida'iyyah, Tsanawiyyah, Aliyyah), Presensi Kelas Harian, Penilaian Kwartal, serta Cetak Raport Digital.
              </p>
            </div>

            {/* Modul 3 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4 hover:border-rose-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-white">3. Pengasuhan &amp; Kedisiplinan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Penerbitan Surat Perizinan Pulang Santriwati, Catatan Pelanggaran Kedisiplinan, Master Takzir, Sistem Poin Kedisiplinan, serta Keamanan Gerbang Pondok.
              </p>
            </div>

            {/* Modul 4 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-white">4. Portal Smart KK Wali Santri</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aplikasi khusus orang tua untuk memantau nilai akademik anak, status perizinan pulang, rekapan kedisiplinan, dan pendaftaran mandiri berbasis Nomor Kartu Keluarga (KK).
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: PANDUAN CARA PENDAFTARAN WALI SANTRI (SMART KK REGISTRATION GUIDE) */}
        <section className="p-6 sm:p-10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-cyan-500/30 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Panduan Pendaftaran Wali Santri</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Cara Pendaftaran Akun Wali Santri Baru (Smart KK)</h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Langkah praktis bagi Orang Tua / Wali Santri untuk mendaftarkan akun portal mandiri dalam 4 langkah mudah:
              </p>
            </div>

            <button
              onClick={() => router.push("/loginguardiant")}
              className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Buka Form Pendaftaran Wali</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Registration Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-cyan-500/40">
                01
              </div>
              <h4 className="font-bold text-sm text-white">Buka Portal Wali Santri</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Akses <span className="text-cyan-400 font-mono">/loginguardiant</span> atau klik tombol <strong>Portal Wali Santri</strong> di halaman utama.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-cyan-500/40">
                02
              </div>
              <h4 className="font-bold text-sm text-white">Pilih Tab Pendaftaran Baru</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Klik tab <strong>Pendaftaran Baru</strong> untuk membuka formulir registrasi akun orang tua murid.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-cyan-500/40">
                03
              </div>
              <h4 className="font-bold text-sm text-white">Isi No. KK &amp; WhatsApp</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Isikan Nama Lengkap, Nomor KK 16 digit, Nomor WhatsApp aktif, serta tentukan Username &amp; Password pilihan Anda.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-cyan-500/40">
                04
              </div>
              <h4 className="font-bold text-sm text-white">Selesai &amp; Otomatis Terhubung</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Klik <strong>Daftar Akun</strong>. Akun Anda otomatis aktif dan langsung terhubung dengan data anak melalui sistem Smart KK!
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: FAQ & PANDUAN PENGGUNAAN WEBSITE */}
        <section className="space-y-6 max-w-3xl mx-auto w-full">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Panduan Penggunaan Website</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Pertanyaan Umum &amp; Cara Penggunaan</h2>
          </div>

          <div className="space-y-3">
            {/* FAQ 1 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara masuk ke Portal Sekretariat Pondok / Madrasah?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeFaq === 1 ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              {activeFaq === 1 && (
                <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  Untuk Sekretaris Pondok (`sek.pondok`) dan Sekretaris Madrasah (`sek.madrasah`), silakan masuk melalui <strong>Portal Sekretariat</strong> di `/loginsekr`. Masukkan username &amp; password kredensial resmi dari administrator.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Ustadz Mustahiq mengisi Nilai Raport Diniyyah?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeFaq === 2 ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {activeFaq === 2 && (
                <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  Mustahiq dapat masuk melalui <strong>Portal Login</strong> di `/loginStaff`. Setelah masuk, pilih menu Rombel/Kelas yang diampu untuk menginput presensi dan penilaian kwartal santriwati.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Apakah bisa masuk menggunakan Akun Google?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeFaq === 3 ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
              {activeFaq === 3 && (
                <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  Ya! Seluruh portal login mendukung otentikasi cepat **Login dengan Akun Google**. Pastikan email Google Anda telah ditautkan dengan data akun staf atau wali di sistem.
                </div>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER INFORMAL KETENTUAN (PRIVACY & TERMS - TANPA HEADER) */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-10 px-4 sm:px-6 lg:px-12 mt-12 relative z-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo P3HM & MPHM Lirboyo" width={32} height={32} className="rounded-lg opacity-80" />
            <div>
              <div className="font-extrabold text-zinc-300">P3HM &amp; MPHM Lirboyo Kediri</div>
              <div className="text-[11px] text-zinc-500">Pondok Pesantren Putri Hidayatul Mubtadi'at &amp; Madrasah Putri Hidayatul Mubtadi'at</div>
            </div>
          </div>

          {/* Privacy & Terms Direct Links */}
          <div className="flex items-center gap-6 font-semibold text-zinc-400">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Kebijakan Privasi (Privacy Policy)
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">
              Syarat &amp; Ketentuan (Terms of Service)
            </Link>
          </div>

          <div className="text-center md:text-right text-[11px]">
            <div>&copy; 2026 P3HM &amp; MPHM Lirboyo. All rights reserved.</div>
            <div className="text-zinc-600 font-mono text-[10px] mt-0.5">Dev: DEVELZY Indonesia ®2025</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
