"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  KeyRound,
  User,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
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
      
      if (backendRole === "Sekretariat") clientRoleKey = "sekretariat";
      else if (backendRole === "Mufattisy") clientRoleKey = "mufattisy";
      else if (backendRole === "Mundzir") clientRoleKey = "mundzir";
      else if (backendRole === "Mustahiq") clientRoleKey = "mustahiq";
      else if (backendRole === "Petugas Keamanan") clientRoleKey = "keamanan";
      else if (backendRole === "Wali Santri") clientRoleKey = "wali_santri";
      
      const matchedRole = roles.find(r => r.id === clientRoleKey);
      if (matchedRole) {
        redirectUrl = matchedRole.href;
      }
      
      router.push(redirectUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghubungkan ke server API.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
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
        <div className="mb-6 text-center flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4 shadow-2xl rounded-full bg-white/5 p-3 border border-white/10 backdrop-blur-md">
            {/* Fallback shadow block to give 3D floating effect */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl -z-10 animate-pulse"></div>
            <img 
              src="/logo.png" 
              alt="Logo Lirboyo" 
              width={100} 
              height={100} 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <ShieldCheck className="w-4 h-4" />
            Portal Resmi
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-white/70 tracking-tight drop-shadow-sm mb-1">
            MPHM LIRBOYO
          </h1>
          
          <p className="text-blue-100/80 text-sm font-medium tracking-wide">
            Sistem Informasi Managament Akademik
          </p>
        </div>

        {/* 3D Glassmorphic Card */}
        <div className="w-full relative group perspective-[1000px]">
          {/* Card outer glow */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          
          <div className="relative w-full bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transform transition-transform duration-300 hover:scale-[1.01]">
            
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Masuk Akun</h2>
              <p className="text-xs text-slate-400">Silakan masukkan kredensial Anda</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Username</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: admin_sekretariat"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-600 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-600 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden group/btn rounded-2xl p-px disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                  <div className="relative bg-linear-to-b from-white/10 to-transparent flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-transform active:scale-[0.98]">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
                        <span className="text-blue-100">Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk Sistem</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-12 text-center">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            MPHM Enterprise &bull; Basis Database Terpadu
          </p>
        </div>
      </div>
    </div>
  );
}
