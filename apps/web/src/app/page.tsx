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
  Users
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
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Glow Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center text-center my-auto space-y-10 py-8">
        
        {/* Top Logo & Hero Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center space-y-4"
        >
          {/* Institution Logo */}
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

          {/* Version Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>P3HM &amp; MPHM Lirboyo • Sistem Informasi Pesantren</span>
          </div>

          {/* Heading */}
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Portal Layanan <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Pesantren &amp; Diniyyah
              </span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Pondok Pesantren Putri Hidayatul Mubtadi&apos;at &amp; Madrasah Putri Hidayatul Mubtadi&apos;at Lirboyo Kediri.
            </p>
          </div>
        </motion.div>

        {/* 3 Dedicated Portal Access Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Card 1: Sekretariat */}
          <div 
            onClick={() => router.push("/loginsekr")}
            className="p-6 bg-zinc-900/90 hover:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500/70 rounded-3xl transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 group-hover:h-1.5 transition-all" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Monitor className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block mb-2">
                Windows Desktop / Web
              </span>
              <h3 className="font-black text-lg text-white">Portal Sekretariat</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Super Admin &amp; Pengelola Pondok/Madrasah.
              </p>
            </div>
          </div>

          {/* Card 2: Staff / Portal Login */}
          <div 
            onClick={() => router.push("/loginStaff")}
            className="p-6 bg-zinc-900/90 hover:bg-zinc-900 border border-indigo-500/30 hover:border-indigo-500/70 rounded-3xl transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 group-hover:h-1.5 transition-all" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 inline-block mb-2">
                Android Mobile App
              </span>
              <h3 className="font-black text-lg text-white">Portal Login</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Mustahiq • Mufatish • Mundzir • Musyrifah • Keamanan.
              </p>
            </div>
          </div>

          {/* Card 3: Wali Santri */}
          <div 
            onClick={() => router.push("/loginguardiant")}
            className="p-6 bg-zinc-900/90 hover:bg-zinc-900 border border-cyan-500/30 hover:border-cyan-500/70 rounded-3xl transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between space-y-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 group-hover:h-1.5 transition-all" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 inline-block mb-2">
                Wali &amp; Orang Tua
              </span>
              <h3 className="font-black text-lg text-white">Portal Wali Santri</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Masuk &amp; Pendaftaran Akun Baru Wali Santri.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Guarantee Footer */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Dilindungi otentikasi SSL/TLS &amp; database terenkripsi &copy; 2026/2027.</span>
        </div>
      </div>
    </div>
  );
}
