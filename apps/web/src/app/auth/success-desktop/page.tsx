"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Monitor, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

function SuccessDesktopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const role = searchParams.get("role") || "Sekretariat";
  const redirectTarget = searchParams.get("redirect") || "/sekretariat";

  const [deepLinkAttempted, setDeepLinkAttempted] = useState(false);

  const mphmDeepLink = token
    ? `mphm://auth?token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}&redirect=${encodeURIComponent(redirectTarget)}`
    : null;

  useEffect(() => {
    if (mphmDeepLink && !deepLinkAttempted) {
      setDeepLinkAttempted(true);
      // Small timeout for smooth animation trigger
      const timer = setTimeout(() => {
        window.location.href = mphmDeepLink;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mphmDeepLink, deepLinkAttempted]);

  const handleManualOpenDesktop = () => {
    if (mphmDeepLink) {
      window.location.href = mphmDeepLink;
    }
  };

  const handleContinueToWeb = () => {
    router.push(redirectTarget);
  };

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-white flex flex-col items-center justify-center relative p-4 overflow-hidden font-sans select-none">
      
      {/* Ambient Radial Glowing Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg bg-slate-900/90 border border-slate-800 backdrop-blur-3xl rounded-[36px] p-8 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] text-center relative overflow-hidden z-10"
      >
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-blue-600" />

        {/* 🌟 LOGO CENTERPIECE WITH CONTINUOUS ORBITING STARS ANIMATION 🌟 */}
        <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
          
          {/* Continuous Rotating Orbit Ring with Stars */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-amber-500/20"
          >
            {/* Star 1 - Top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-400 fill-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse" />
            </div>
            {/* Star 2 - Right */}
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 fill-yellow-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.9)]" />
            </div>
            {/* Star 3 - Bottom */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400 fill-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse" />
            </div>
            {/* Star 4 - Left */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400 fill-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
            </div>
          </motion.div>

          {/* Reverse Rotating Counter-Orbit Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
            className="absolute inset-3 rounded-full border border-blue-500/20"
          >
            {/* Orbiting Sparkles */}
            <div className="absolute top-2 left-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            </div>
            <div className="absolute bottom-2 right-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
          </motion.div>

          {/* Center Logo Container with Glowing Border */}
          <div className="relative z-10 w-24 h-24 rounded-3xl bg-slate-950 border-2 border-amber-400/50 p-2.5 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo P3HM & MPHM Lirboyo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
            {/* Success Check Badge Overlay */}
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-slate-950 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Success Message Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autentikasi Berhasil</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
            Selamat, Anda Berhasil Login!
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Sistem sedang mengalihkan Anda kembali ke <br />
            <strong className="text-white font-bold">Software Desktop Admin Mubtadiaat</strong>.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 flex items-center justify-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-amber-300 font-mono">
            Membuka Software Desktop...
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleManualOpenDesktop}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Monitor className="w-5 h-5 text-slate-950" />
            <span>Buka Software Desktop Manual</span>
          </button>

          <button
            onClick={handleContinueToWeb}
            className="w-full py-3 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lanjutkan di Web Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </motion.div>

      {/* Footer */}
      <div className="relative z-10 mt-6 text-center text-slate-500 text-[11px]">
        P3HM &amp; MPHM Lirboyo Kediri &bull; Integrated Desktop Ecosystem
      </div>

    </div>
  );
}

export default function SuccessDesktopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh w-full bg-slate-950 text-white flex items-center justify-center">
        <div className="text-amber-400 font-bold font-mono">Memuat Halaman Otentikasi...</div>
      </div>
    }>
      <SuccessDesktopContent />
    </Suspense>
  );
}
