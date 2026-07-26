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
  CheckCircle2,
  Database,
  Lock
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
          className="lg:col-span-7 space-y-7 p-2 lg:p-4"
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
              <span>P3HM &amp; MPHM Lirboyo • Sistem Informasi Pesantren</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
              Portal Layanan <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Pesantren &amp; Diniyyah
              </span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl font-normal">
              Pondok Pesantren Putri Hidayatul Mubtadi&apos;at &amp; Madrasah Putri Hidayatul Mubtadi&apos;at Lirboyo Kediri.
            </p>
          </div>

          {/* Dedicated Portal Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Card 1: Sekretariat */}
            <div 
              onClick={() => router.push("/loginsekr")}
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-emerald-500/30 hover:border-emerald-500/70 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Monitor className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Portal Sekretariat</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Admin &amp; Pengelola Pondok/Madrasah</p>
              </div>
            </div>

            {/* Card 2: Staff / Portal Login */}
            <div 
              onClick={() => router.push("/loginStaff")}
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-indigo-500/30 hover:border-indigo-500/70 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Portal Login</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Mustahiq • Mufatish • Mundzir • Musyrifah</p>
              </div>
            </div>

            {/* Card 3: Wali Santri */}
            <div 
              onClick={() => router.push("/loginguardiant")}
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-cyan-500/30 hover:border-cyan-500/70 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Portal Wali Santri</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Masuk &amp; Pendaftaran Akun Wali</p>
              </div>
            </div>
          </div>

          {/* Security Guarantee Footer */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 pt-2 border-t border-zinc-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dilindungi otentikasi berlapis SSL &amp; database terenkripsi 2026/2027.</span>
          </div>
        </motion.div>

        {/* Right Section: Real Application Multi-Device Showcase Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-5 w-full flex flex-col items-center justify-center"
        >
          <div className="w-full relative group">
            {/* Ambient Background Glow Behind Image */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-3xl bg-zinc-900/90 border border-zinc-800 p-3 shadow-2xl backdrop-blur-xl overflow-hidden">
              {/* Top Mac-style window controls bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 mb-2 bg-zinc-950/60 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold tracking-wide">
                  m.p3hm.my.id • Multi-Device App
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              </div>

              {/* Real Application Image Mockup */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-zinc-800/60 bg-zinc-950">
                <Image
                  src="/hero-app-mockup.png"
                  alt="P3HM & MPHM Lirboyo Multi-Device Application Showcase"
                  width={800}
                  height={533}
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  priority
                />
              </div>

              {/* Bottom Feature Badges */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Desktop Client</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-400">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Android App</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center gap-1.5 text-[10px] font-bold text-cyan-400">
                  <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Cloud Database</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
