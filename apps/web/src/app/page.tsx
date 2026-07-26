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
  CheckCircle2,
  Phone,
  FileText
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
      <div className="absolute top-[35%] right-10 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-10 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-10 sm:py-16 space-y-20 sm:space-y-32 relative z-10">

        {/* ========================================================================= */}
        {/* SECTION 1: HERO & MAIN PORTAL GATEWAYS (STAF & WALI SANTRI) */}
        {/* ========================================================================= */}
        <section className="flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto pt-2 sm:pt-6">
          
          {/* Logo Badge & Live Online Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500" />
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

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>Realtime System 2026/2027 • Mobile Portal Staf &amp; Wali</span>
            </div>
          </motion.div>

          {/* Hero Heading */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Portal Layanan <br />
              <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Staf &amp; Wali Santri
              </span>
            </h1>
            <p className="text-base sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Pondok Pesantren Putri Hidayatul Mubtadi&apos;at (P3HM) &amp; Madrasah Putri Hidayatul Mubtadi&apos;at (MPHM) Lirboyo Kediri.
            </p>
          </div>

          {/* 2 Primary Gateway Access Cards (Portal Login Staf & Portal Wali Santri) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 max-w-3xl mx-auto">
            
            {/* Gateway 1: Portal Login Staf */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push("/loginStaff")}
              className="p-7 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 hover:from-zinc-900 hover:to-zinc-900 border border-indigo-500/40 hover:border-indigo-500/90 rounded-3xl transition-all duration-300 cursor-pointer group shadow-2xl flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block mb-2">
                  Portal Guru &amp; Pengurus
                </span>
                <h3 className="font-black text-2xl text-white">Portal Login Staf</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Mustahiq • Mufatish • Mundzir • Musyrifah • Petugas Keamanan.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold">
                <span>Masuk Portal Login Staf</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Gateway 2: Portal Wali Santri */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push("/loginguardiant")}
              className="p-7 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 hover:from-zinc-900 hover:to-zinc-900 border border-cyan-500/40 hover:border-cyan-500/90 rounded-3xl transition-all duration-300 cursor-pointer group shadow-2xl flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500 group-hover:h-2 transition-all" />
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 inline-block mb-2">
                  Orang Tua Santri (Smart KK)
                </span>
                <h3 className="font-black text-2xl text-white">Portal Wali Santri</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Masuk Portal &amp; Pendaftaran Baru Akun Orang Tua Mandiri.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-cyan-400 font-bold">
                <span>Masuk &amp; Daftar Wali Santri</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: REAL APPLICATION SHOWCASE IMAGE (REAL WEBSITE UI) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Tampilan Asli Aplikasi Software</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Antarmuka Realtime Staf &amp; Wali Santri</h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Gambaran antarmuka asli sistem akademik Diniyyah, presensi Mustahiq, dan aplikasi mobile Wali Santri.
            </p>
          </div>

          <div className="w-full relative group max-w-5xl mx-auto">
            {/* Ambient Background Glow Behind Image Showcase */}
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-3xl opacity-70 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800 p-3 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Window Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 mb-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sistem Informasi Pesantren P3HM &amp; MPHM Lirboyo</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Sistem Realtime</span>
                </div>
              </div>

              {/* Authentic Real Showcase Image */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-inner">
                <Image
                  src="/real-app-showcase.png"
                  alt="Real Website Application UI Showcase P3HM & MPHM Lirboyo"
                  width={1200}
                  height={675}
                  className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  priority
                />
              </div>

              {/* Bottom Status Badges */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-indigo-400 font-bold flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Akademik Raport Diniyyah</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-cyan-400 font-bold flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Mobile Wali Santri Smart KK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Kedisiplinan &amp; Perizinan Pulang</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: INFORMASI LENGKAP MODUL STAF & WALI SANTRI */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Modul Layanan Staf &amp; Wali</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Fitur Utama Pengurus &amp; Orang Tua</h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Panduan lengkap fasilitas digital bagi Dewan Pengajar Mustahiq, Pengurus Mufattisy, Mundzir, Musyrifah, dan Wali Santri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Akademik Diniyyah */}
            <div className="p-7 bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-white">Akademik Diniyyah (MPHM)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Khusus Ustadz/Ustadzah Mustahiq untuk mengisi presensi jam mengajar harian, penilaian kwartal rombel kelas (I'dadiyyah hingga Aliyyah), serta penerbitan Raport Digital.
              </p>
            </div>

            {/* Feature 2: Pengasuhan & Perizinan */}
            <div className="p-7 bg-zinc-900/80 border border-zinc-800 hover:border-rose-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-white">Pengasuhan &amp; Perizinan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Digunakan oleh Mufattisy, Musyrifah, dan Keamanan untuk menerbitkan Surat Izin Pulang, mencatat poin kedisiplinan, serta memvalidasi kepulangan santriwati.
              </p>
            </div>

            {/* Feature 3: Portal Wali Santri */}
            <div className="p-7 bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-white">Portal Smart KK Wali Santri</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Memudahkan orang tua memantau perkembangan akademik anak, mengecek status persetujuan perizinan pulang, serta melakukan pendaftaran mandiri dengan Nomor Kartu Keluarga.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: CARA PENDAFTARAN WALI SANTRI (SMART KK GUIDE) */}
        {/* ========================================================================= */}
        <section className="p-8 sm:p-12 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-cyan-500/40 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>Panduan Resmi Pendaftaran Orang Tua</span>
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
        {/* SECTION 5: FAQ & PETUNJUK PENGGUNAAN WEBSITE (NON-SEKRETARIAT) */}
        {/* ========================================================================= */}
        <section className="space-y-8 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Penggunaan Website</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Pertanyaan Umum &amp; Petunjuk Akses</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Petunjuk singkat mengenai cara mengakses portal sesuai dengan wewenang akun Anda.
            </p>
          </div>

          <div className="space-y-3">
            
            {/* FAQ 1 */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-5 text-left font-extrabold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Ustadz Mustahiq &amp; Pengurus Lapangan masuk ke akun?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 1 ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {activeFaq === 1 && (
                <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Mustahiq, Mufattisy, Mundzir, Musyrifah, dan Petugas Keamanan dapat masuk melalui <strong>Portal Login Staf</strong> di bagian atas halaman utama.
                  </p>
                  <p>
                    Setelah masuk, Mustahiq dapat menginput presensi jam mengajar serta mengisi nilai kwartal santriwati pada rombel kelas masing-masing.
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
                <span>Bagaimana cara Wali Santri mendaftar dan memantau akademik anak?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 2 ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
              {activeFaq === 2 && (
                <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Orang tua santriwati cukup menekan tombol <strong>Portal Wali Santri</strong>, kemudian memilih tab <strong>Pendaftaran Baru</strong>. Masukkan nomor Kartu Keluarga (KK) yang terdaftar untuk membuat akun mandiri.
                  </p>
                  <p>
                    Setelah akun aktif, Anda dapat langsung melihat nilai raport kwartal anak, status perizinan pulang, dan rekapan poin kedisiplinan.
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
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 3 ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {activeFaq === 3 && (
                <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  Ya! Seluruh gerbang portal login staf maupun portal wali santri mendukung otentikasi cepat **Login dengan Akun Google**. Pastikan email Google Anda telah ditautkan di dalam sistem.
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
