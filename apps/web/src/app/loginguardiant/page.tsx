"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
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
  CheckCircle2
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 border border-cyan-500/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-2">
              <Heart className="w-3.5 h-3.5 fill-cyan-400" />
              <span>Android Wali Santri App</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Portal Wali Santri</h1>
            <p className="text-xs text-zinc-400 mt-1">Akses Informasi Akademik &amp; Kedisiplinan Anak</p>
          </div>
        </div>

        {/* Tab Switcher: Login vs Pendaftaran */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "login"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Masuk Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pendaftaran Baru</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Success Alert after Registration */}
        {regSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Pendaftaran Berhasil!</span>
            </div>
            <p>Selamat {regSuccess.name}, akun Wali Santri Anda telah berhasil dibuat.</p>
            <p className="font-mono text-[11px] bg-zinc-950 p-2 rounded-xl text-cyan-300 border border-zinc-800">
              Username: <strong className="text-white">{regSuccess.username}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setRegSuccess(null);
              }}
              className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Klik di sini untuk Masuk
            </button>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Username Wali / No. KK / No. HP
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cth: wali01 / 08123456789"
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-10 py-3 text-sm font-medium transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Masuk Portal Wali Santri</span>
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
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Nama Lengkap Wali Santri
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nama Lengkap Sesuai KTP"
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
                  placeholder="16 digit Nomor KK"
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                No. WhatsApp / HP Aktif
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
              disabled={regLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
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

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
          <a href="/" className="hover:text-cyan-400 transition-colors">← Kembali ke Halaman Utama</a>
        </div>
      </div>
    </div>
  );
}
