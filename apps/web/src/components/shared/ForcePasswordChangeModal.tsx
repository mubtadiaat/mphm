"use client";

import { useState } from "react";
import { useAuth, UserSession } from "../../lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";
import { useToast } from "./ToastContext";
import { createPortal } from "react-dom";
import { signInWithGoogle, logoutFirebase } from "@/lib/firebase/client";
import { CheckCircle2, Loader2, Lock } from "lucide-react";

export function ForcePasswordChangeModal() {
  const { data: user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleLinking, setGoogleLinking] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: user?.fullName || "",
          newPassword,
        }),
      });
    },
    onSuccess: () => {
      toast("Kata sandi berhasil diperbarui!", "success", "Berhasil");
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    },
    onError: (err: unknown) => {
      toast(err instanceof Error ? err.message : "Gagal mengubah kata sandi.", "error");
    },
  });

  const handleLinkGoogle = async () => {
    setGoogleLinking(true);
    try {
      const { user: fbUser, error: fbError } = await signInWithGoogle();
      if (fbError || !fbUser) {
        throw new Error(fbError || "Gagal melakukan otentikasi dengan Google.");
      }

      const res = await apiRequest<{ status: string; message: string; data?: { email?: string; googleLinked?: boolean } }>("/api/auth/google-link", {
        method: "POST",
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
        }),
      });

      queryClient.setQueryData<UserSession>(["auth-session"], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          googleLinked: true,
          email: fbUser.email,
        };
      });

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      toast(res.message || "Akun Google berhasil ditautkan!", "success", "Berhasil Ditautkan");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal menautkan akun Google.", "error", "Penautan Gagal");
    } finally {
      setGoogleLinking(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setGoogleLinking(true);
    try {
      await logoutFirebase();
      const res = await apiRequest<{ status: string; message: string }>("/api/auth/google-link", {
        method: "DELETE",
      });

      queryClient.setQueryData<UserSession>(["auth-session"], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          googleLinked: false,
          email: null,
        };
      });

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      toast(res.message || "Tautan akun Google berhasil dilepas.", "success", "Berhasil");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal melepaskan penautan.", "error", "Gagal");
    } finally {
      setGoogleLinking(false);
    }
  };

  if (typeof window === "undefined" || isLoading || !user || !user.mustChangePassword) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Konfirmasi kata sandi baru tidak cocok!", "error", "Validasi Gagal");
      return;
    }
    if (newPassword.length < 6) {
      toast("Kata sandi minimal 6 karakter!", "error", "Validasi Gagal");
      return;
    }
    mutation.mutate();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Selamat Datang, {user?.fullName || "Pengguna"}!</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
            Anda menggunakan kata sandi bawaan sistem. Silakan langsung buat <span className="font-bold text-emerald-600 dark:text-emerald-400">Kata Sandi Baru</span> demi keamanan akun Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Kata Sandi Baru *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan kata sandi baru (min 6 karakter)..."
              className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 font-semibold transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Ulangi Kata Sandi Baru *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi kata sandi baru..."
              className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 font-semibold transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            {mutation.isPending ? "Simpan Perubahan..." : "Simpan Kata Sandi Baru"}
          </button>
        </form>

        {/* Section Penautan Akun Google */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block text-center">
            Tautkan Akun Google (Login Cepat)
          </span>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div className="min-w-0">
                {user?.googleLinked ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Terhubung ({user.email})</span>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Tautkan Gmail agar bisa login 1-klik.</p>
                )}
              </div>
            </div>

            {user?.googleLinked ? (
              <button
                type="button"
                onClick={handleUnlinkGoogle}
                disabled={googleLinking}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/40 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {googleLinking ? "..." : "Lepas"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLinkGoogle}
                disabled={googleLinking}
                className="px-3.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-all border border-zinc-300 dark:border-zinc-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
              >
                {googleLinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Tautkan</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(modalContent, document.body);
}
