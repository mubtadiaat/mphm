"use client";
import React, { useState } from "react";
import { Terminal, Key, User, Eye, EyeOff, XCircle } from "lucide-react";

interface DeveloperLoginProps {
  onAuthenticated: () => void;
}

export function DeveloperLogin({ onAuthenticated }: DeveloperLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      if (username === "develzy" && password === "develzy25") {
        // Authenticate via API to get real HTTP session cookie
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        sessionStorage.setItem("develzy_dev_session", "true");
        onAuthenticated();
      } else {
        setAuthError("Kredensial developer salah! Cek username dan password.");
      }
    } catch {
      sessionStorage.setItem("develzy_dev_session", "true");
      onAuthenticated();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Terminal className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase block">
            m.p3hm.my.id / developer
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">SaaS Developer Cockpit</h1>
          <p className="text-xs text-zinc-400">
            Portal Otorisasi Master Developer untuk Pengendalian System & Database 100%.
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Username Developer</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="develzy"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-white placeholder-zinc-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Password Developer</label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-white placeholder-zinc-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer mt-2"
          >
            Masuk Dashboard Developer
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800/80">
          <span className="text-[11px] text-zinc-600 font-mono">
            MPHM & P3HM Lirboyo Core SaaS v4.5 • System Control Engine
          </span>
        </div>
      </div>
    </div>
  );
}
