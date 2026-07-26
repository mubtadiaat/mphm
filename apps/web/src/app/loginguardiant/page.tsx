"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Heart,
  Users,
  UserPlus,
  Phone,
  FileText,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function LoginGuardianPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regKk, setRegKk] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState<{ username: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/guardian");
    }
  }, [user, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, portal: "guardian" }),
        credentials: "include",
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Login Wali Santri gagal. Periksa nomor HP/Username dan password Anda.");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      router.push("/guardian");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke Portal Wali Santri.");
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
      router.push("/guardian");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login Google gagal.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== regConfirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok. Harap periksa kembali.");
      return;
    }

    setRegLoading(true);

    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          familyCardNumber: regKk,
          whatsapp: regWhatsapp,
          username: regUsername,
          password: regPassword,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Pendaftaran Wali Santri gagal.");
      }

      setRegSuccess({
        username: resData.data?.username || regUsername,
        name: resData.data?.personName || regFullName,
      });

      setUsername(resData.data?.username || regUsername);
      setPassword(regPassword);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mendaftarkan akun Wali Santri.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col justify-between items-center p-3 sm:p-6 select-none relative font-sans">
      {/* Background Soft Glow - Restricted Max-W to prevent horizontal scroll */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 bg-gradient-to-b from-amber-300/20 via-blue-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* iPhone Top Status Header & Dynamic Island Simulation */}
      <div className="w-full max-w-md flex items-center justify-between px-4 py-2 mb-3 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/70 text-[11px] text-slate-600 font-semibold shadow-sm z-20">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">e-Mubtadiaat Wali App</span>
        </div>
        <div className="w-16 h-3.5 bg-slate-900 rounded-full flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
        </div>
        <span className="text-blue-700 font-bold">iOS Native</span>
      </div>

      {/* Main Elevated iPhone Card Sheet */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] relative z-10 overflow-hidden my-auto"
      >
        {/* Top Gold & Blue Premium Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-blue-600" />

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-blue-600 rounded-3xl blur-md opacity-40 group-hover:opacity-70 transition duration-300" />
            <div className="relative w-20 h-20 bg-white border border-slate-200 rounded-2xl p-2 flex items-center justify-center shadow-md">
              <Image 
                src="/logo.png" 
                alt="Logo P3HM & MPHM Lirboyo" 
                width={64} 
                height={64} 
                className="object-contain drop-shadow-sm" 
                priority
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-700 text-[11px] font-extrabold uppercase tracking-wider mb-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Aplikasi Wali Santri Premium</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Portal Wali Santri</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Akses Raport Akademik, Kedisiplinan &amp; Perizinan</p>
          </div>
        </div>

        {/* Segmented Tab Switcher iOS Style */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "login"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Masuk Aplikasi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pendaftaran Baru</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs leading-relaxed shadow-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <p className="font-bold">{error}</p>
          </motion.div>
        )}

        {/* Success Alert after Registration */}
        {regSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Pendaftaran Berhasil!</span>
            </div>
            <p>Selamat {regSuccess.name}, akun Wali Santri Anda telah berhasil dibuat.</p>
            <p className="font-mono text-[11px] bg-white p-2.5 rounded-xl text-blue-700 border border-slate-200 font-bold">
              Username: <strong className="text-slate-900">{regSuccess.username}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setRegSuccess(null);
              }}
              className="w-full mt-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Klik di sini untuk Masuk
            </button>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Wali / No. KK / No. HP
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cth: wali01 / 08123456789"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-11 py-3.5 text-sm font-semibold transition-all outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button: Biru Premium */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-4 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-sm transition-all duration-200 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Masuk Aplikasi Wali</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: PENDAFTARAN WALI SANTRI FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap Wali Santri
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nama Lengkap Sesuai KTP"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                No. Kartu Keluarga (KK)
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regKk}
                  onChange={(e) => setRegKk(e.target.value)}
                  placeholder="16 digit Nomor KK"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                No. WhatsApp / HP Aktif
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="cth: 08123456789"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Username Pilihan
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="cth: wali_santri01"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Kata Sandi"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Konfirmasi
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi"
                  className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 text-slate-900 placeholder-slate-400 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-sm transition-all duration-200 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              {regLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Wali Santri</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Google OAuth Login */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/90 text-slate-700 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Masuk Wali dengan Google</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* App Copyright Footer */}
      <div className="w-full max-w-md text-center mt-3 text-[11px] text-slate-500 font-semibold">
        e-Mubtadiaat &copy; 2026 P3HM &amp; MPHM Lirboyo Kediri
      </div>
    </div>
  );
}
