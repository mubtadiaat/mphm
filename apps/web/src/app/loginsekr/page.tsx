"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/firebase/client";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  KeyRound, 
  User, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Monitor,
  Sparkles,
  Building2,
  Lock,
  CheckCircle2
} from "lucide-react";

export default function LoginSekretariatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const isDesktop = searchParams.get("target") === "desktop" || searchParams.get("isDesktop") === "true";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setFormattedDate(now.toLocaleDateString("id-ID", options));
  }, []);

  useEffect(() => {
    if (user && !isDesktop) {
      router.replace("/sekretariat");
    }
  }, [user, isDesktop, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, portal: "sekretariat" }),
        credentials: "include",
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Login Sekretariat gagal. Periksa username dan password Anda.");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

      if (isDesktop && resData.token) {
        router.push(`/auth/success-desktop?token=${encodeURIComponent(resData.token)}&role=${encodeURIComponent(resData.data?.role || "Sekretariat")}&redirect=/sekretariat`);
      } else {
        router.push("/sekretariat");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke Portal Sekretariat.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const { user: fbUser, error: fbError } = await signInWithGoogle();
      if (fbError || !fbUser) {
        throw new Error(fbError || "Gagal otentikasi dengan Google.");
      }

      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Gagal masuk dengan Google.");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

      if (isDesktop || resData.token) {
        router.push(`/auth/success-desktop?token=${encodeURIComponent(resData.token)}&role=${encodeURIComponent(resData.data?.role || "Sekretariat")}&redirect=/sekretariat`);
      } else {
        router.push("/sekretariat");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login Google gagal.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-hidden bg-slate-950 text-white flex flex-col justify-between relative font-sans select-none">
      
      {/* 3D Dark Background Image with Cinematic Overlay & Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/pesantren-dark-bg.png"
          alt="Latar Belakang Pesantren P3HM & MPHM Lirboyo"
          fill
          priority
          className="object-cover object-center scale-100"
        />
        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        {/* Ambient Gold & Blue Glowing Orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-dvh flex flex-col justify-between p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
        
        {/* Top Header Bar */}
        <header className="w-full flex items-center justify-between py-2 border-b border-white/10 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Logo P3HM & MPHM Lirboyo" width={28} height={28} className="object-contain" />
            <span className="font-extrabold tracking-wide text-white">P3HM &amp; MPHM Lirboyo</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-amber-400 font-bold bg-slate-900/60 px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{formattedDate || "Realtime Info"}</span>
          </div>
        </header>

        {/* Main Content: LEFT-ALIGNED 3D GLASS CARD */}
        <div className="w-full my-auto py-6 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-12">
          
          {/* LEFT SIDE: Floating Glassmorphic Login Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md lg:max-w-[460px] xl:max-w-[480px] bg-slate-900/85 border border-slate-700/80 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 lg:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85)] relative overflow-hidden shrink-0"
          >
            {/* Top Premium Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-blue-600" />

            {/* Logo & Header */}
            <div className="flex flex-col items-start text-left space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 bg-slate-950 border border-amber-500/30 rounded-2xl p-1.5 flex items-center justify-center shadow-lg">
                  <Image 
                    src="/logo.png" 
                    alt="Logo P3HM & MPHM Lirboyo" 
                    width={48} 
                    height={48} 
                    className="object-contain" 
                    priority
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Software Client</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Portal Sekretariat</h1>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Super Admin • Sek.Pondok • Sek.Madrasah</p>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <p className="font-bold">{error}</p>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username Sekretariat
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username admin..."
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-400/80 focus:ring-4 focus:ring-amber-400/15 text-white placeholder-slate-600 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-400/80 focus:ring-4 focus:ring-amber-400/15 text-white placeholder-slate-600 rounded-2xl pl-11 pr-11 py-3.5 text-sm font-semibold transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Action Button: Biru Premium */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-4 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-sm transition-all duration-200 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Masuk Aplikasi Sekretariat</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Google OAuth Login */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Masuk Sekretariat dengan Google</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* RIGHT SIDE: DESKTOP SHOWCASE VISUAL (Visible on large screens) */}
          <div className="hidden lg:flex flex-col space-y-6 max-w-lg text-right z-20">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider ml-auto">
                <Building2 className="w-4 h-4" />
                <span>Pondok Pesantren &amp; Madrasah Putri</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                Sistem Informasi &amp; Layanan Terpadu
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                P3HM &amp; MPHM Lirboyo Kediri — Software Operasional Sekretariat Administrator Terintegrasi.
              </p>
            </div>

            {/* 3 Status Badges */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-1">
                <div className="text-amber-400 font-mono text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypted 256-bit</span>
                </div>
                <div className="text-white font-extrabold text-sm">Keamanan Data Santri</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-1">
                <div className="text-blue-400 font-mono text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Realtime Sync v2.0</span>
                </div>
                <div className="text-white font-extrabold text-sm">Akademik &amp; Raport</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-[11px] text-slate-400">
          <div>&copy; 2026 P3HM &amp; MPHM Lirboyo Kediri. All rights reserved.</div>
          <div className="font-mono text-[10px] text-slate-500">Dev: DEVELZY Indonesia ®2025</div>
        </footer>

      </div>

    </div>
  );
}
