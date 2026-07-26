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
  Award,
  HelpCircle,
  ChevronDown,
  UserPlus,
  Phone,
  FileText,
  Clock,
  Zap,
  Globe,
  Heart,
  Cpu,
  BarChart3,
  KeyRound,
  Check,
  Building2,
  GraduationCap,
  ShieldAlert
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
  const [activeDeviceTab, setActiveDeviceTab] = useState<"desktop" | "tablet" | "mobile">("desktop");

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
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[35%] right-10 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-10 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-10 sm:py-16 space-y-20 sm:space-y-32 relative z-10">

        {/* ========================================================================= */}
        {/* SECTION 1: HERO & CENTRAL PORTAL GATEWAYS */}
        {/* ========================================================================= */}
        <section className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto pt-2 sm:pt-6">
          
          {/* Logo Badge & Live Online Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-zinc-950 border border-zinc-800 rounded-3xl p-3.5 flex items-center justify-center shadow-2xl">
                <Image 
                  src="/logo.png" 
                  alt="Logo P3HM & MPHM Lirboyo" 
                  width={96} 
                  height={96} 
                  className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform" 
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime System 2026/2027 • Cloud Enterprise Sync</span>
            </div>
          </motion.div>

          {/* Hero Heading */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Sistem Informasi Pesantren <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                &amp; Akademik Diniyyah
              </span>
            </h1>
            <p className="text-base sm:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-normal">
              Platform Manajemen Terpadu Pondok Pesantren Putri Hidayatul Mubtadi&apos;at (P3HM) &amp; Madrasah Putri Hidayatul Mubtadi&apos;at (MPHM) Lirboyo Kediri.
            </p>
          </div>

          {/* 3 Dedicated Portal Gateway Access Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            
            {/* Gateway 1: Portal Sekretariat */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push("/loginsekr")}
              className="p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 hover:from-zinc-900 hover:to-zinc-900 border border-emerald-500/30 hover:border-emerald-500/80 rounded-3xl transition-all duration-300 cursor-pointer group shadow-2xl flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-2">
                  Windows Desktop / Web
                </span>
                <h3 className="font-black text-xl text-white">Portal Sekretariat</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Super Admin &amp; Pengelola Data Santriwati, Asrama, &amp; Lembaga Pondok/Madrasah.
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span>Masuk Portal Sekretariat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Gateway 2: Portal Login Staf */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push("/loginStaff")}
              className="p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 hover:from-zinc-900 hover:to-zinc-900 border border-indigo-500/30 hover:border-indigo-500/80 rounded-3xl transition-all duration-300 cursor-pointer group shadow-2xl flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block mb-2">
                  Android Mobile Staff App
                </span>
                <h3 className="font-black text-xl text-white">Portal Login Staf</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Mustahiq • Mufatish • Mundzir • Musyrifah • Petugas Keamanan.
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold">
                <span>Masuk Portal Login Staf</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Gateway 3: Portal Wali Santri */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push("/loginguardiant")}
              className="p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 hover:from-zinc-900 hover:to-zinc-900 border border-cyan-500/30 hover:border-cyan-500/80 rounded-3xl transition-all duration-300 cursor-pointer group shadow-2xl flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 inline-block mb-2">
                  Wali &amp; Orang Tua Santri
                </span>
                <h3 className="font-black text-xl text-white">Portal Wali Santri</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Masuk Portal &amp; Pendaftaran Baru Akun Orang Tua (Smart KK).
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-cyan-400 font-bold">
                <span>Masuk &amp; Daftar Wali Santri</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: ULTRA-MODERN 3-DEVICE MULTI-MOCKUP REALTIME UI PREVIEW */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Interaktif Multi-Device Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Tampilan Antarmuka Asli Software</h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Desain modern yang telah dioptimasi penuh untuk perangkat Laptop Desktop, Tablet Notebook, dan Handphone Mobile.
            </p>
          </div>

          {/* Interactive Device Selector Tabs */}
          <div className="flex justify-center items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl max-w-md mx-auto">
            <button
              onClick={() => setActiveDeviceTab("desktop")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDeviceTab === "desktop"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Laptop Desktop</span>
            </button>
            <button
              onClick={() => setActiveDeviceTab("tablet")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDeviceTab === "tablet"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span>Notebook</span>
            </button>
            <button
              onClick={() => setActiveDeviceTab("mobile")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDeviceTab === "mobile"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Handphone</span>
            </button>
          </div>

          {/* Live Device UI Frame */}
          <div className="w-full relative group max-w-5xl mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-cyan-500/20 rounded-3xl blur-3xl opacity-70 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden p-3 sm:p-6 backdrop-blur-2xl">
              
              {/* Window Controls */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl mb-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-semibold text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sistem Informasi Pesantren &amp; Diniyyah P3HM &amp; MPHM</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Terverifikasi Realtime</span>
                </div>
              </div>

              {/* Dynamic Content based on Active Tab */}
              <AnimatePresence mode="wait">
                {activeDeviceTab === "desktop" && (
                  <motion.div
                    key="desktop-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 text-xs"
                  >
                    {/* Sidebar Mockup */}
                    <div className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
                        <div>
                          <div className="font-extrabold text-white text-xs">P3HM &amp; MPHM Lirboyo</div>
                          <div className="text-[10px] text-emerald-400 font-mono">Sekretariat Master System</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold flex items-center justify-between">
                          <span>Data Induk Santriwati</span>
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div className="p-2 text-zinc-400 hover:bg-zinc-900 rounded-lg flex items-center justify-between">
                          <span>Manajemen Akun Users</span>
                        </div>
                        <div className="p-2 text-zinc-400 hover:bg-zinc-900 rounded-lg flex items-center justify-between">
                          <span>Asrama Blok &amp; Kamar</span>
                        </div>
                        <div className="p-2 text-zinc-400 hover:bg-zinc-900 rounded-lg flex items-center justify-between">
                          <span>Raport Diniyyah (MPHM)</span>
                        </div>
                      </div>
                    </div>

                    {/* Main Area Mockup */}
                    <div className="md:col-span-8 space-y-3">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Dashboard Utama Laptop Desktop</div>
                        <div className="text-base font-black">Pusat Data Santriwati &amp; Kelembagaan Pesantren</div>
                        <div className="text-[11px] opacity-90">Total Terdata: 1,450 Santriwati Aktif • 128 Pengurus &amp; Mustahiq</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-0.5">
                          <div className="text-[10px] text-zinc-400 font-bold">Status Database</div>
                          <div className="text-emerald-400 font-mono font-bold text-xs">Terenkripsi AES-256</div>
                        </div>
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-0.5">
                          <div className="text-[10px] text-zinc-400 font-bold">Mode Pengoperasian</div>
                          <div className="text-indigo-400 font-mono font-bold text-xs">Online &amp; Auto Sync</div>
                        </div>
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-0.5">
                          <div className="text-[10px] text-zinc-400 font-bold">Sesi Otorisasi</div>
                          <div className="text-cyan-400 font-mono font-bold text-xs">Multi-Role Security</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeDeviceTab === "tablet" && (
                  <motion.div
                    key="tablet-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 text-xs space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold opacity-80 uppercase">Optimasi Layar Tablet &amp; Notebook</div>
                        <div className="text-lg font-black">Portal Akademik Diniyyah (Mustahiq &amp; Mufattisy)</div>
                      </div>
                      <BookOpen className="w-8 h-8 opacity-80" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                        <div className="font-bold text-indigo-300 flex items-center justify-between">
                          <span>Input Nilai Raport Kwartal</span>
                          <span className="text-emerald-400 font-mono text-[10px]">Ibtida'iyyah III</span>
                        </div>
                        <p className="text-zinc-400 text-[10px]">Memudahkan ustadz/ustadzah menginput nilai mata pelajaran diniyyah secara presisi dari mana saja.</p>
                      </div>

                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                        <div className="font-bold text-indigo-300 flex items-center justify-between">
                          <span>Presensi Mengajar Harian</span>
                          <span className="text-emerald-400 font-mono text-[10px]">Realtime Log</span>
                        </div>
                        <p className="text-zinc-400 text-[10px]">Pencatatan kehadiran jam mengajar secara otomatis yang terhubung ke laporan sekretariat.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeDeviceTab === "mobile" && (
                  <motion.div
                    key="mobile-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 text-xs space-y-4 max-w-lg mx-auto"
                  >
                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold opacity-80 uppercase">Aplikasi Mobile Smartphone</div>
                        <div className="text-lg font-black">Portal Wali Santri (Smart KK)</div>
                      </div>
                      <Heart className="w-8 h-8 fill-white/80" />
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">Monitoring Perizinan Pulang</div>
                          <div className="text-zinc-400 text-[10px]">Status Surat Perizinan Pulang Santriwati</div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 rounded-lg text-[10px]">
                          DISETUJUI
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">Rekap Kedisiplinan &amp; Poin</div>
                          <div className="text-zinc-400 text-[10px]">Bebas Pelanggaran Berat</div>
                        </div>
                        <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30 rounded-lg text-[10px]">
                          0 POIN TAKZIR
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: REKAPITULASI SISTEM & ARSITEKTUR KELEMBAGAAN */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Arsitektur Sistem Terintegrasi</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Semua Sub-Sistem Pesantren &amp; Diniyyah</h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Tata kelola digital yang mencakup seluruh pilar Pondok Pesantren Putri Hidayatul Mubtadi&apos;at (P3HM) &amp; Madrasah Putri Hidayatul Mubtadi&apos;at (MPHM).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* System 1 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">1. Modul Induk Sekretariat</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pusat data induk Santriwati, data Asrama &amp; Kamar, mutasi santri, rekapan alumni, serta manajemen pengurus sekretariat pondok &amp; madrasah.
              </p>
            </div>

            {/* System 2 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">2. Akademik Diniyyah (MPHM)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Manajemen Rombel/Kelas dari jenjang I'dadiyyah hingga Aliyyah, absensi mengajar Mustahiq, input nilai kwartal, dan penerbitan Raport Digital.
              </p>
            </div>

            {/* System 3 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-rose-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">3. Pengasuhan &amp; Kedisiplinan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Penerbitan Surat Perizinan Pulang Santriwati, catatan pelanggaran &amp; takzir, poin kedisiplinan, serta validasi gerbang pos keamanan.
              </p>
            </div>

            {/* System 4 */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">4. Portal Smart KK Wali Santri</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Akses khusus orang tua untuk memantau akademik anak, status perizinan pulang, rekap kedisiplinan, dan pendaftaran mandiri via Nomor Kartu Keluarga.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: VISUAL GUIDE FOR WALI SANTRI REGISTRATION */}
        {/* ========================================================================= */}
        <section className="p-8 sm:p-12 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-cyan-500/30 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>Panduan Resmi Orang Tua</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Cara Pendaftaran Akun Wali Santri Baru (Smart KK)</h2>
              <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Ikuti 4 langkah praktis berikut untuk mendaftarkan akun wali santri agar terhubung secara otomatis dengan data anak Anda di pesantren:
              </p>
            </div>

            <button
              onClick={() => router.push("/loginguardiant")}
              className="px-6 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-3 shrink-0 cursor-pointer"
            >
              <span>Buka Portal Wali Santri</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Steps Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 01 */}
            <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-base flex items-center justify-center border border-cyan-500/40">
                01
              </div>
              <h4 className="font-extrabold text-base text-white">Buka Portal Wali Santri</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Klik tombol <strong>Portal Wali Santri</strong> pada bagian atas halaman utama ini.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-base flex items-center justify-center border border-cyan-500/40">
                02
              </div>
              <h4 className="font-extrabold text-base text-white">Pilih Tab Pendaftaran Baru</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pada halaman portal wali, pilih opsi tab <strong>Pendaftaran Baru</strong> untuk membuka formulir registrasi.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-base flex items-center justify-center border border-cyan-500/40">
                03
              </div>
              <h4 className="font-extrabold text-base text-white">Isi No. KK &amp; WhatsApp</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Lengkapi Nama Lengkap Wali (KTP), Nomor Kartu Keluarga (16 Digit), Nomor WA aktif, Username, &amp; Password pilihan Anda.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-base flex items-center justify-center border border-cyan-500/40">
                04
              </div>
              <h4 className="font-extrabold text-base text-white">Selesai &amp; Otomatis Terhubung</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Klik <strong>Daftar Akun</strong>. Akun Anda langsung aktif dan otomatis terintegrasi dengan profil anak melalui sistem Smart KK!
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: FAQ & PANDUAN CARA PENGGUNAAN WEBSITE (USER MANUAL) */}
        {/* ========================================================================= */}
        <section className="space-y-8 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Penggunaan Website</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Pertanyaan Umum &amp; Petunjuk Penggunaan</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Informasi lengkap seputar cara mengakses portal sesuai dengan wewenang akun Anda.
            </p>
          </div>

          <div className="space-y-3">
            
            {/* FAQ 1 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-5 text-left font-extrabold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Sekretaris Pondok / Sekretaris Madrasah mengelola data?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 1 ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              {activeFaq === 1 && (
                <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Sekretaris Pondok (`sek.pondok`) dan Sekretaris Madrasah (`sek.madrasah`) dapat masuk melalui tombol <strong>Portal Sekretariat</strong> di halaman utama. Masukkan username &amp; password resmi yang telah diberikan oleh administrator.
                  </p>
                  <p>
                    Setelan di dalam mencakup pencatatan santriwati baru, penyesuaian kamar asrama, pengelolaan pengurus, hingga cetak laporan resmi.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-5 text-left font-extrabold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana Ustadz Mustahiq &amp; Pengurus Lapangan mengisi nilai &amp; presensi?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 2 ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {activeFaq === 2 && (
                <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Mustahiq, Mufattisy, Mundzir, Musyrifah, dan Petugas Keamanan dapat masuk melalui <strong>Portal Login Staf</strong> di halaman utama.
                  </p>
                  <p>
                    Setelah masuk, Mustahiq dapat memilih rombel kelas yang diampu untuk mencatat kehadiran mengajar dan menginput nilai raport kwartal santriwati.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full p-5 text-left font-extrabold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Apakah bisa masuk langsung menggunakan Akun Google?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 3 ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
              {activeFaq === 3 && (
                <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  Ya! Seluruh gerbang portal login (Sekretariat, Staf, dan Wali Santri) mendukung otentikasi cepat **Login dengan Akun Google**. Pastikan email Google Anda telah tertaut dengan akun di dalam sistem.
                </div>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* FOOTER INFORMAL KETENTUAN (PRIVACY & TERMS - TANPA HEADER) */}
      {/* ========================================================================= */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-12 px-4 sm:px-6 lg:px-12 mt-16 relative z-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <Image src="/logo.png" alt="Logo P3HM & MPHM Lirboyo" width={36} height={36} className="rounded-xl opacity-90" />
            <div>
              <div className="font-black text-sm text-zinc-200">P3HM &amp; MPHM Lirboyo Kediri</div>
              <div className="text-[11px] text-zinc-400">Pondok Pesantren Putri Hidayatul Mubtadi'at &amp; Madrasah Putri Hidayatul Mubtadi'at</div>
            </div>
          </div>

          {/* Privacy & Terms Links */}
          <div className="flex items-center gap-6 font-bold text-zinc-400">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Kebijakan Privasi (Privacy Policy)
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">
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
