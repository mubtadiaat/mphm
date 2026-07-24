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
  Lock,
  Phone,
  FileText
} from "lucide-react";

// Helper: Role → Redirect URL mapping (digunakan di semua login handlers)
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
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regKk, setRegKk] = useState("");
  const [regSuccess, setRegSuccess] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [waContact, setWaContact] = useState("6281234567890");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.system_whatsapp_contact) {
          setWaContact(d.data.system_whatsapp_contact);
        }
      })
      .catch(() => {});
  }, []);

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

  const handleQuickLogin = async (usr: string, pwd: string) => {
    setError(null);
    setLoading(true);
    setUsername(usr);
    setPassword(pwd);

    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usr, password: pwd }),
        credentials: "include",
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Login gagal.");
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
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: regWhatsapp,
          familyCardNumber: regKk
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Pendaftaran akun gagal.");
      }

      setRegSuccess({ username: resData.data.username });
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
        
        {/* Left Hero Section (Desktop Branding & Highlights) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 space-y-8 p-4 lg:p-6"
        >
          {/* Version Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>MPHM Enterprise v4.0 • System Realtime 2026/2027</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
              Sistem Informasi <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Akademik Pesantren
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl font-normal">
              Portal terpadu pengurusan santri, manajemen raport kwartal, presensi real-time, dan pengawasan pimpinan pesantren.
            </p>
          </div>

          {/* Institutional Guarantee Footer */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 pt-4 border-t border-zinc-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dilindungi enkripsi sesi berlapis & database terenkripsi.</span>
          </div>
        </motion.div>

        {/* Right Auth Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-5 w-full"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            {/* Top Glow Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 mb-6 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
              <button
                type="button"
                onClick={() => { setViewMode("login"); setError(null); }}
                className={`py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  viewMode === "login"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Masuk Portal
              </button>
              <button
                type="button"
                onClick={() => { setViewMode("register"); setError(null); }}
                className={`py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  viewMode === "register"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Daftar Akun Wali
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
                      <label className="text-xs font-bold text-zinc-300">Username / ID Pengguna</label>
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
                      <label className="text-xs font-bold text-zinc-300">Kata Sandi</label>
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
                      className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Masuk Portal MPHM</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-5">
                    <div className="border-t border-zinc-800 w-full" />
                    <span className="bg-zinc-900 px-3 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                      Opsi Masuk Cepat
                    </span>
                    <div className="border-t border-zinc-800 w-full" />
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs sm:text-sm transition-all duration-200 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {googleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>Masuk dengan Gmail</span>
                           {/* Pilihan Portal Login Spesiﬁk */}
                  <div className="pt-4 space-y-2 border-t border-zinc-800/80">
                    <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider text-center">
                      Pilih Portal Spesifik Aplikasi
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href="/loginsekr"
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold text-center transition-all"
                      >
                        <span>💻 Sekretariat</span>
                        <span className="text-[9px] text-emerald-300/70 font-normal">Windows Desktop</span>
                      </a>
                      <a
                        href="/loginStaff"
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold text-center transition-all"
                      >
                        <span>📱 Staf Lapangan</span>
                        <span className="text-[9px] text-indigo-300/70 font-normal">Android App</span>
                      </a>
                      <a
                        href="/loginguardiant"
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold text-center transition-all"
                      >
                        <span>👨‍👩‍👧 Wali Santri</span>
                        <span className="text-[9px] text-cyan-300/70 font-normal">Android App</span>
                      </a>
                    </div>
                  </div>

                  {/* Tombol Akses Uji Coba Role Sementara (Hanya Mode Pengembang/Development) */}
                  {process.env.NODE_ENV !== "production" && (
                    <div className="pt-3 space-y-2 border-t border-zinc-800/80">
                      <span className="block text-[10px] font-extrabold text-amber-400 uppercase tracking-wider text-center">
                        ⚡ Akses Uji Coba Role (Dev Mode Only)
                      </span>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {/* Sek.Pondok */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("sek_pondok", "admin123")}
                          disabled={loading}
                          title="Sekretariat Pondok (Hanya Layar Besar / Desktop)"
                          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          🏠 Sek.Pondok
                        </button>

                        {/* Sek.Madrasah */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("sek_madrasah", "admin123")}
                          disabled={loading}
                          title="Sekretariat Madrasah (Hanya Layar Besar / Desktop)"
                          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          🏫 Sek.Madrasah
                        </button>

                        {/* Mundzir */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("pimpinan01", "mphm123")}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          👳 Mundzir
                        </button>

                        {/* Mufatish */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("mufattisy01", "mphm123")}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          🔍 Mufatish
                        </button>

                        {/* Mustahiq */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("mustahiq01", "mphm123")}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          📚 Mustahiq
                        </button>

                        {/* Keamanan */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("keamanan01", "mphm123")}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          🛡️ Keamanan
                        </button>

                        {/* Wali Santri */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin("wali01", "mphm123")}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          👨‍👩‍👧 Wali Santri
                        </button>
                      </div>
                    </div>
                  )}on>
                    </div>
                  </div>

                  {/* WhatsApp Bantuan Login */}
                  <div className="pt-4 border-t border-zinc-800/80 text-center">
                    <a
                      href={`https://wa.me/${waContact.replace(/[^0-9]/g, "")}?text=Assalamu'alaikum%20Sekretariat%20MPHM,%20saya%20mengalami%20kendala%20saat%20login%20ke%20sistem.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-emerald-500/10"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Kendala Login? Hubungi WhatsApp Sekretariat</span>
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {regSuccess ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Pendaftaran Berhasil!</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Akun Wali Santri Anda telah dibuat dengan username: <br />
                        <strong className="text-emerald-400 text-base font-mono mt-1 block">{regSuccess.username}</strong>
                      </p>
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 text-left space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Langkah Selanjutnya:</span>
                        </div>
                        <p>1. Silakan masuk menggunakan username di atas dan password default: <code className="text-emerald-400">mubtadiaat123</code></p>
                        <p>2. Setelah masuk, Anda dapat menautkan akun Gmail di menu <strong>Pengaturan Akun</strong> untuk akses masuk instan selanjutnya.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setViewMode("login"); setRegSuccess(null); }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
                      >
                        Kembali ke Form Login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span className="leading-relaxed">
                          Pendaftaran resmi khusus Wali Santri aktif. Setelah terdaftar, Anda dapat menautkan akun Gmail di menu <strong>Pengaturan Akun</strong>.
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-300">Nomor WhatsApp Aktif</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={regWhatsapp}
                            onChange={(e) => setRegWhatsapp(e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="w-full pl-11 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
                          />
                          <Phone className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-300">Nomor Kartu Keluarga (KK)</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={regKk}
                            onChange={(e) => setRegKk(e.target.value)}
                            placeholder="Contoh: 3512345678900001"
                            className="w-full pl-11 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
                          />
                          <FileText className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Daftarkan Akun Wali Santri"}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
