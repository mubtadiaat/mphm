"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { signInWithGoogle } from "@/lib/firebase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  KeyRound,
  User,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Monitor,
  Smartphone,
  Users,
  UserPlus,
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
  return ROLE_REDIRECT_MAP[role.trim().toLowerCase()] || "/sekretariat";
}

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState<"login" | "register">("login");
  
  // Registration State
  const [regFullName, setRegFullName] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regKk, setRegKk] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regSuccess, setRegSuccess] = useState<{ username: string; name: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const redirectUrl = getRedirectUrlByRole(String(user.role));
      router.replace(redirectUrl);
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
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Login gagal. Silakan periksa kembali username dan password Anda.");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      const redirectUrl = getRedirectUrlByRole(String(resData.data?.role || ""));
      router.push(redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke akun Anda.");
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
      const redirectUrl = getRedirectUrlByRole(String(resData.data?.role || ""));
      router.push(redirectUrl);
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
      setError("Konfirmasi kata sandi tidak sesuai. Periksa kembali.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          whatsapp: regWhatsapp,
          familyCardNumber: regKk,
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
      setError(err instanceof Error ? err.message : "Pendaftaran gagal.");
    } finally {
      setLoading(false);
    }
  };

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
          className="lg:col-span-7 space-y-8 p-2 lg:p-6"
        >
          {/* Version Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>P3HM &amp; MPHM Lirboyo • Sistem Informasi Pesantren</span>
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
              Pilih portal login sesuai peran Anda di Pondok Pesantren Putri Hidayatul Mubtadi&apos;at Lirboyo Kediri.
            </p>
          </div>

          {/* Dedicated Portal Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Card 1: Sekretariat */}
            <div 
              onClick={() => router.push("/loginsekr")}
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
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
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
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
              className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
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
            <span>Dilindungi enkripsi sesi berlapis &amp; database terenkripsi 2026/2027.</span>
          </div>
        </motion.div>

        {/* Right Universal Auth Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-5 w-full"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            {/* Top Glow Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500" />

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 mb-6 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
              <button
                type="button"
                onClick={() => { setViewMode("login"); setError(null); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  viewMode === "login"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Masuk Langsung
              </button>
              <button
                type="button"
                onClick={() => { setViewMode("register"); setError(null); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  viewMode === "register"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Daftar Wali Santri
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success Registration Notification */}
            {regSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Pendaftaran Berhasil!</span>
                </div>
                <p>Selamat {regSuccess.name}, akun Wali Santri Anda telah terdaftar.</p>
                <p className="font-mono text-[11px] bg-zinc-950 p-2 rounded-xl text-cyan-300 border border-zinc-800">
                  Username: <strong className="text-white">{regSuccess.username}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("login");
                    setRegSuccess(null);
                  }}
                  className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Klik di sini untuk Masuk
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {viewMode === "login" ? (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Username Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Username / ID Pengguna</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Masukkan username Anda..."
                          className="w-full pl-11 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
                        />
                        <User className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Kata Sandi</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-11 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
                        />
                        <KeyRound className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Masuk ke Portal System</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Google OAuth Login Button */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      className="w-full py-3 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Masuk dengan Akun Google</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* REGISTRATION VIEW */
                <motion.div
                  key="register-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Nama Lengkap Wali
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="Nama Lengkap Wali Sesuai KTP"
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        No. Kartu Keluarga (KK)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          required
                          value={regKk}
                          onChange={(e) => setRegKk(e.target.value)}
                          placeholder="16 Digit No. KK Santriwati"
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        No. WhatsApp / HP
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="tel"
                          required
                          value={regWhatsapp}
                          onChange={(e) => setRegWhatsapp(e.target.value)}
                          placeholder="cth: 08123456789"
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Username Pilihan
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="cth: wali_santri01"
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                          Kata Sandi
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Kata Sandi"
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                          Konfirmasi
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Konfirmasi"
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Daftar Akun Wali Santri</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
