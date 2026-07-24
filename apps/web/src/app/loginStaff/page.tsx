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
  Smartphone,
  CheckCircle2
} from "lucide-react";

export default function LoginStaffPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const roleStr = String(user.role).toLowerCase();
      if (roleStr.includes("mustahiq")) router.replace("/mustahiq");
      else if (roleStr.includes("mufat")) router.replace("/mufattisy");
      else if (roleStr.includes("mundzir") || roleStr.includes("pimpinan")) router.replace("/pimpinan");
      else if (roleStr.includes("keamanan")) router.replace("/keamanan");
      else router.replace("/mustahiq");
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
        body: JSON.stringify({ username, password, portal: "staff" }),
        credentials: "include",
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Login Staf gagal. Periksa username dan password Anda.");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

      const roleStr = String(resData.data?.role || "").toLowerCase();
      if (roleStr.includes("mustahiq")) router.push("/mustahiq");
      else if (roleStr.includes("mufat")) router.push("/mufattisy");
      else if (roleStr.includes("mundzir") || roleStr.includes("pimpinan")) router.push("/pimpinan");
      else if (roleStr.includes("keamanan")) router.push("/keamanan");
      else router.push("/mustahiq");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke Portal Staf Lapangan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 border border-indigo-500/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Android Mobile Staff App</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Portal Staf Lapangan</h1>
            <p className="text-xs text-zinc-400 mt-1">Mustahiq • Mufatish • Mundzir • Keamanan</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Username Staf / Guru
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cth: mustahiq01 / mufattisy01"
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium transition-all outline-none"
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
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-zinc-600 rounded-2xl pl-10 pr-10 py-3 text-sm font-medium transition-all outline-none"
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
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Masuk Aplikasi Staf</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
          <a href="/" className="hover:text-indigo-400 transition-colors">← Kembali ke Halaman Utama</a>
        </div>
      </div>
    </div>
  );
}
