"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { 
  ShieldCheck, 
  KeyRound,
  User,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
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
  const [regSuccess, setRegSuccess] = useState<{username: string} | null>(null);
  const [loading, setLoading] = useState(false);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.m.p3hm.my.id";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Login failed");
      }

      let redirectUrl = "/";
      const backendRole = resData.data.role;
      let clientRoleKey = "mufattisy";
      
      const roleStr = String(backendRole).trim().toLowerCase();
      
      if (roleStr === "sekretariat") clientRoleKey = "sekretariat";
      else if (roleStr === "mufattisy") clientRoleKey = "mufattisy";
      else if (roleStr === "mundzir") clientRoleKey = "mundzir";
      else if (roleStr === "mustahiq") clientRoleKey = "mustahiq";
      else if (roleStr === "petugas keamanan") clientRoleKey = "keamanan";
      else if (roleStr === "wali santri") clientRoleKey = "wali_santri";
      
      const matchedRole = roles.find(r => r.id === clientRoleKey);
      if (matchedRole) {
        redirectUrl = matchedRole.href;
      }
      
      // Update cache immediately to prevent loop redirection
      queryClient.setQueryData(["auth-session"], resData.data);
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      
      router.push(redirectUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghubungkan ke server API.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.m.p3hm.my.id";
      const response = await fetch(`${apiUrl}/api/auth/register-wali`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: regWhatsapp, kk: regKk }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Pendaftaran gagal");
      }

      setRegSuccess({ username: resData.data.username });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghubungkan ke server API.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full bg-slate-900 flex flex-col items-center justify-center p-4 sm:px-6 relative font-sans overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MCAwaC00MHY0MGg0MFYweiIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMSAxSDM5VjFIMXptMSAxSDM4VjJIMnoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPgo8L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="max-w-[420px] w-full z-10 flex flex-col items-center">
        
        {/* Header / Logo */}
        <div className="mb-2 sm:mb-4 lg:mb-6 text-center flex flex-col items-center">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-2 sm:mb-3 shadow-2xl rounded-full bg-white/5 p-2 sm:p-3 border border-white/10 backdrop-blur-md">
            {/* Fallback shadow block to give 3D floating effect */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl -z-10 animate-pulse"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="Logo Lirboyo" 
              width={100} 
              height={100} 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 sm:mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Portal Resmi
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-white/70 tracking-tight drop-shadow-sm mb-1">
            MPHM LIRBOYO
          </h1>
          
          <p className="text-blue-100/80 text-[10px] sm:text-xs lg:text-sm font-medium tracking-wide">
            Sistem Informasi Managament Akademik
          </p>
        </div>

        {/* 3D Glassmorphic Card */}
        <div className="w-full relative group perspective-[1000px]">
          {/* Card outer glow */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          
          <div className="relative w-full bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 sm:p-5 lg:p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transform transition-transform duration-300 hover:scale-[1.01]">
            
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="text-center mb-3 sm:mb-5">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5">
                {viewMode === "login" ? "Masuk Akun" : "Daftar Wali Santri"}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
                {viewMode === "login" ? "Silakan masukkan kredensial Anda" : "Masukkan Nomor WhatsApp dan KK"}
              </p>
            </div>

            {error && (
              <div className="mb-3 sm:mb-5 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2 text-red-400 text-[10px] sm:text-xs lg:text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {viewMode === "login" ? (
              <>
                <form onSubmit={handleLoginSubmit} className="space-y-2 sm:space-y-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Username</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: admin_sekretariat"
                      className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-3 bg-slate-950/80 border border-slate-700/60 focus:border-blue-500 rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                      <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 sm:pl-11 pr-10 py-2 sm:py-3 bg-slate-950/80 border border-slate-700/60 focus:border-blue-500 rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1.5 sm:pt-2 flex gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative flex-1 overflow-hidden group/btn rounded-xl sm:rounded-2xl p-px disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                    <div className="relative bg-linear-to-b from-white/10 to-transparent flex items-center justify-center gap-2 py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm lg:text-base font-bold tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-transform active:scale-[0.98]">
                      {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-200" /> : <span>Masuk</span>}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode("register"); setError(null); }}
                    disabled={loading}
                    className="relative flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xs sm:text-sm lg:text-base font-bold tracking-wide transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Daftar
                  </button>
                </div>
              </form>
              
              {/* Helper Kredensial Uji Coba */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] text-blue-300 space-y-1">
                <div className="font-bold uppercase tracking-wider">Kredensial Demo / Uji Coba:</div>
                <div>• Sekretariat (Admin): <span className="font-mono text-white font-bold select-all">admin_mphm</span> / <span className="font-mono text-white font-bold select-all">madrasahp3hm123</span></div>
                <div>• Mustahiq (Wali Kelas): <span className="font-mono text-white font-bold select-all">mustahiq01</span> / <span className="font-mono text-white font-bold select-all">mphm123</span></div>
                <div>• Mufattisy (Pengawas): <span className="font-mono text-white font-bold select-all">mufattisy01</span> / <span className="font-mono text-white font-bold select-all">mphm123</span></div>
                <div>• Wali Santri: <span className="font-mono text-white font-bold select-all">wali01</span> / <span className="font-mono text-white font-bold select-all">mphm123</span></div>
              </div>
              </>
            ) : (
              <>
                <form onSubmit={handleRegisterSubmit} className="space-y-2 sm:space-y-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Nomor WhatsApp</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input 
                      type="text"
                      required
                      value={regWhatsapp}
                      onChange={(e) => setRegWhatsapp(e.target.value)}
                      placeholder="Cth: 08123456789"
                      className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-3 bg-slate-950/80 border border-slate-700/60 focus:border-blue-500 rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Nomor KK (Kartu Keluarga)</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                      <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input 
                      type="text"
                      required
                      value={regKk}
                      onChange={(e) => setRegKk(e.target.value)}
                      placeholder="Masukkan digit Nomor KK"
                      className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-3 bg-slate-950/80 border border-slate-700/60 focus:border-blue-500 rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-1.5 sm:pt-2 flex gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative flex-1 overflow-hidden group/btn rounded-xl sm:rounded-2xl p-px disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                    <div className="relative bg-linear-to-b from-white/10 to-transparent flex items-center justify-center gap-2 py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm lg:text-base font-bold tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-transform active:scale-[0.98]">
                      {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-200" /> : <span>Daftar</span>}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode("login"); setError(null); }}
                    disabled={loading}
                    className="relative flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xs sm:text-sm lg:text-base font-bold tracking-wide transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>

              {/* Helper KK Registrasi */}
              <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] text-indigo-300 space-y-1">
                <div className="font-bold uppercase tracking-wider">Petunjuk Uji Coba Registrasi Wali:</div>
                <div>Gunakan data dummy yang terdaftar di database:</div>
                <div>• No. WhatsApp: <span className="font-mono text-white font-bold select-all">081200000005</span> (Ayah) atau <span className="font-mono text-white font-bold select-all">081200000006</span> (Ibu)</div>
                <div>• Nomor KK (Kartu Keluarga): <span className="font-mono text-white font-bold select-all">3200001111111111</span></div>
              </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-3 sm:mt-6 text-center">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-widest">
            MPHM Enterprise &bull; Basis Database Terpadu
          </p>
        </div>
      </div>

      {/* Registration Success Modal */}
      {regSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pendaftaran Sukses</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Akun Wali Santri Anda telah dibuat. Silakan login menggunakan kredensial berikut:
            </p>
            <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-800 mb-6 shadow-inner">
              <div className="text-xs text-slate-500 mb-1">Username (No WA):</div>
              <div className="font-mono text-sm text-blue-400 font-bold mb-3">{regSuccess.username}</div>
              <div className="text-xs text-slate-500 mb-1">Password Default:</div>
              <div className="font-mono text-sm text-emerald-400 font-bold">mphm123</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername(regSuccess.username);
                setPassword("");
                setRegSuccess(null);
                setViewMode("login");
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] cursor-pointer"
            >
              Login Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
