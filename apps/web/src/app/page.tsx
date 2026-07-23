"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { signInWithGoogle } from "@/lib/firebase/client";
import { SpotlightCard } from "@/components/ui/spotlight-card";
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
  CheckCircle2
} from "lucide-react";

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

  const roles = [
    { id: "sekretariat", href: "/sekretariat" },
    { id: "mufattisy", href: "/mufattisy" },
    { id: "mundzir", href: "/pimpinan" },
    { id: "mustahiq", href: "/mustahiq" },
    { id: "keamanan", href: "/keamanan" },
    { id: "wali_santri", href: "/guardian" },
  ];

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const roleStr = String(user.role).trim().toLowerCase();
      let clientRoleKey = "mufattisy";
      if (roleStr === "sekretariat") clientRoleKey = "sekretariat";
      else if (roleStr === "mufattisy") clientRoleKey = "mufattisy";
      else if (roleStr === "mundzir") clientRoleKey = "mundzir";
      else if (roleStr === "mustahiq") clientRoleKey = "mustahiq";
      else if (roleStr === "petugas keamanan") clientRoleKey = "keamanan";
      else if (roleStr === "wali santri") clientRoleKey = "wali_santri";

      const matchedRole = roles.find(r => r.id === clientRoleKey);
      if (matchedRole) {
        router.replace(matchedRole.href);
      }
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

      let redirectUrl = "/sekretariat";
      const backendRole = String(resData.data?.role || "").trim().toLowerCase();

      if (backendRole === "sekretariat") redirectUrl = "/sekretariat";
      else if (backendRole === "mufattisy") redirectUrl = "/mufattisy";
      else if (backendRole === "mundzir") redirectUrl = "/pimpinan";
      else if (backendRole === "mustahiq") redirectUrl = "/mustahiq";
      else if (backendRole === "petugas keamanan" || backendRole === "keamanan") redirectUrl = "/keamanan";
      else if (backendRole === "wali santri") redirectUrl = "/guardian";

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Gagal masuk ke akun Anda.");
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
        throw new Error(fbError || "Gagal melakukan otentikasi dengan Google.");
      }

      // Sync Firebase User with Backend Database
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Gagal menautkan akun Google.");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

      const roleStr = String(resData.data?.role || "").trim().toLowerCase();
      let redirectUrl = "/guardian";
      if (roleStr === "sekretariat") redirectUrl = "/sekretariat";
      else if (roleStr === "mufattisy") redirectUrl = "/mufattisy";
      else if (roleStr === "mundzir") redirectUrl = "/pimpinan";
      else if (roleStr === "mustahiq") redirectUrl = "/mustahiq";
      else if (roleStr === "keamanan") redirectUrl = "/keamanan";

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Login Google gagal.");
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
    } catch (err: any) {
      setError(err.message || "Pendaftaran gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            MPHM Enterprise v4.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Portal Informasi Santri
          </h1>
          <p className="text-sm text-zinc-400 max-w-xs">
            Sistem Manajemen Akademik & Pusat Data Abadi Pesantren
          </p>
        </div>

        {/* Aceternity UI Spotlight Card Container */}
        <SpotlightCard className="p-8 border border-zinc-800/80 bg-zinc-900/90 backdrop-blur-2xl shadow-2xl rounded-3xl">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
            <button
              onClick={() => { setViewMode("login"); setError(null); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                viewMode === "login"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Masuk Portal
            </button>
            <button
              onClick={() => { setViewMode("register"); setError(null); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                viewMode === "register"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {viewMode === "login" ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 group"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Masuk Akun Google</span>
                </button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-zinc-800 w-full" />
                  <span className="bg-zinc-900 px-3 text-xs text-zinc-500 font-medium">atau Username</span>
                  <div className="border-t border-zinc-800 w-full" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Username / ID Pengguna</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Kata Sandi</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Masuk Aplikasi</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {regSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Pendaftaran Berhasil!</h3>
                    <p className="text-xs text-zinc-400">
                      Akun Anda berhasil dibuat dengan username: <br />
                      <strong className="text-emerald-400 text-sm">{regSuccess.username}</strong>
                    </p>
                    <button
                      onClick={() => { setViewMode("login"); setRegSuccess(null); }}
                      className="w-full py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl hover:bg-emerald-500 transition-colors"
                    >
                      Kembali ke Login
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>Daftar Cepat dengan Google</span>
                    </button>

                    <div className="relative flex items-center justify-center my-4">
                      <div className="border-t border-zinc-800 w-full" />
                      <span className="bg-zinc-900 px-3 text-xs text-zinc-500 font-medium">atau Data Manual</span>
                      <div className="border-t border-zinc-800 w-full" />
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Nomor WhatsApp Aktif</label>
                        <input
                          type="text"
                          required
                          value={regWhatsapp}
                          onChange={(e) => setRegWhatsapp(e.target.value)}
                          placeholder="08123456789"
                          className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Nomor Kartu Keluarga (KK)</label>
                        <input
                          type="text"
                          required
                          value={regKk}
                          onChange={(e) => setRegKk(e.target.value)}
                          placeholder="3512345678900001"
                          className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Daftarkan Akun Wali"}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SpotlightCard>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-zinc-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Sistem Informasi Terenkripsi & Dilindungi Hak Cipta MPHM</span>
        </div>
      </motion.div>
    </div>
  );
}
