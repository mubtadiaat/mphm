"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
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
  Phone,
  Lock,
  Layers,
  Activity
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

  useEffect(() => {
    if (user) {
      const redirectUrl = getRedirectUrlByRole(String(user.role));
      router.replace(redirectUrl);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Glow Lights */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container Grid */}
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Hero Section & Portal Choice Cards */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-6 space-y-6 p-2 lg:p-4"
        >
          {/* Institution Logo & Version Badge */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-md opacity-40 group-hover:opacity-80 transition duration-300" />
              <div className="relative w-14 h-14 bg-zinc-950 border border-emerald-500/40 rounded-2xl p-1.5 flex items-center justify-center shadow-xl">
                <Image 
                  src="/logo.png" 
                  alt="Logo P3HM & MPHM Lirboyo" 
                  width={48} 
                  height={48} 
                  className="object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>P3HM &amp; MPHM Lirboyo • System 2026/2027</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
              Portal Layanan <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Pesantren &amp; Diniyyah
              </span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              Pondok Pesantren Putri Hidayatul Mubtadi&apos;at &amp; Madrasah Putri Hidayatul Mubtadi&apos;at Lirboyo Kediri.
            </p>
          </div>

          {/* Dedicated Portal Choice Cards */}
          <div className="grid grid-cols-1 gap-3.5 pt-1">
            {/* Card 1: Sekretariat */}
            <div 
              onClick={() => router.push("/loginsekr")}
              className="p-4 bg-zinc-900/90 hover:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500/70 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">Portal Sekretariat</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Sek.Pondok &amp; Sek.Madrasah
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Super Admin, Sekretaris, &amp; Pengelola Data</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Card 2: Staff / Portal Login */}
            <div 
              onClick={() => router.push("/loginStaff")}
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-indigo-500/30 hover:border-indigo-500/70 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">Portal Login</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Staf Lapangan &amp; Pengurus
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Mustahiq • Mufatish • Mundzir • Musyrifah</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Card 3: Wali Santri */}
            <div 
              onClick={() => router.push("/loginguardiant")}
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-cyan-500/30 hover:border-cyan-500/70 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">Portal Wali Santri</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Orang Tua &amp; Smart KK
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Masuk &amp; Pendaftaran Akun Baru Wali Santri</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>

          {/* Security Guarantee Footer */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 pt-1 border-t border-zinc-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dilindungi otentikasi berlapis SSL &amp; database terenkripsi 2026/2027.</span>
          </div>
        </motion.div>

        {/* Right Section: Authentic 100% Real Live Application UI Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-6 w-full flex flex-col items-center justify-center"
        >
          <div className="w-full relative group">
            {/* Ambient Background Glow Behind UI Showcase */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden text-xs">
              
              {/* Window Controls Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full font-mono text-[11px] text-zinc-400 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>https://m.p3hm.my.id/sekretariat/users</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {/* Inside Dashboard Mockup Container */}
              <div className="flex h-[380px] bg-zinc-950">
                
                {/* Mini Sidebar Showcase */}
                <div className="w-48 bg-slate-950 border-r border-slate-900 p-3 flex flex-col justify-between shrink-0 hidden sm:flex">
                  <div className="space-y-4">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5 px-2 py-1">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 p-1 flex items-center justify-center">
                        <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-contain" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[11px] text-white">P3HM Lirboyo</div>
                        <div className="text-[9px] text-emerald-400 font-mono">SEK.PONDOK</div>
                      </div>
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-1 text-[11px] font-medium">
                      <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-between font-bold">
                        <span>Pusat Akun (Users)</span>
                        <Activity className="w-3 h-3" />
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-slate-900 flex items-center justify-between">
                        <span>Santriwati (P3HM)</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-slate-900 flex items-center justify-between">
                        <span>Wali Santri (Smart KK)</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-slate-900 flex items-center justify-between">
                        <span>Data Asrama &amp; Kamar</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-slate-900 flex items-center justify-between">
                        <span>Alumni Pondok</span>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Footer Online Indicator */}
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold text-slate-200">Sistem Informasi Pesantren</span>
                    </div>
                    <div className="text-[8px] text-slate-500">Pondok Pesantren Putri Hidayatul Mubtadi'at</div>
                  </div>
                </div>

                {/* Main Content Area Mockup */}
                <div className="flex-1 p-4 space-y-3.5 overflow-hidden bg-zinc-900/50">
                  
                  {/* Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-md space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>Manajemen Akses &amp; Otorisasi Pengguna</span>
                    </div>
                    <div className="text-base font-black tracking-tight">Pusat Pengelolaan Akun (Users)</div>
                    <div className="text-[10px] opacity-90">Atur kredensial akun Pengurus, Mustahiq, Mufattisy, Mundzir &amp; Wali Santri.</div>
                  </div>

                  {/* Sub Tabs */}
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-[11px] font-bold">
                    <span className="px-2.5 py-1 bg-zinc-800 text-white rounded-lg border border-zinc-700">Daftar Akun (Monitoring)</span>
                    <span className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200">Generate Akun Instansi</span>
                    <span className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200">Keranjang Sampah Dorman</span>
                  </div>

                  {/* Mini Table */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden text-[11px]">
                    <div className="grid grid-cols-12 bg-zinc-900 p-2 text-zinc-400 font-bold border-b border-zinc-800 text-[10px] uppercase">
                      <div className="col-span-4">NAMA PEMILIK AKUN</div>
                      <div className="col-span-3">ROLE AKSES</div>
                      <div className="col-span-3">STATUS AKUN</div>
                      <div className="col-span-2 text-center">AKTIVITAS</div>
                    </div>

                    {/* Row 1 */}
                    <div className="grid grid-cols-12 p-2 border-b border-zinc-800/60 items-center font-medium">
                      <div className="col-span-4 font-bold text-white flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center justify-center">SA</div>
                        <span>Super Admin Sistem</span>
                      </div>
                      <div className="col-span-3 font-mono text-[10px] text-blue-400">sek.madrasah</div>
                      <div className="col-span-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] border border-emerald-500/20">AKTIF</span>
                      </div>
                      <div className="col-span-2 text-center font-bold text-emerald-400 flex items-center justify-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-12 p-2 border-b border-zinc-800/60 items-center font-medium">
                      <div className="col-span-4 font-bold text-white flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-bold flex items-center justify-center">UM</div>
                        <span>Ustadz Mustahiq</span>
                      </div>
                      <div className="col-span-3 font-mono text-[10px] text-indigo-400">Mustahiq</div>
                      <div className="col-span-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] border border-emerald-500/20">AKTIF</span>
                      </div>
                      <div className="col-span-2 text-center font-bold text-emerald-400 flex items-center justify-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-12 p-2 items-center font-medium">
                      <div className="col-span-4 font-bold text-white flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] font-bold flex items-center justify-center">WS</div>
                        <span>Wali Santri (Smart KK)</span>
                      </div>
                      <div className="col-span-3 font-mono text-[10px] text-cyan-400">Wali Santri</div>
                      <div className="col-span-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] border border-emerald-500/20">AKTIF</span>
                      </div>
                      <div className="col-span-2 text-center font-semibold text-zinc-500 flex items-center justify-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" /> Offline
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Feature Badges */}
              <div className="p-3 bg-zinc-900 border-t border-zinc-800 grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Desktop Windows App</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-400">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Android Mobile Portal</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1.5 text-[10px] font-bold text-cyan-400">
                  <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Realtime Cloud Sync</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
