"use client";

import { useState } from "react";
import { useAuth } from "../../lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";
import { useToast } from "./ToastContext";
import { createPortal } from "react-dom";

export function ForcePasswordChangeModal() {
  const { data: user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: user?.fullName || "",
          oldPassword: "mphm123",
          newPassword,
        }),
      });
    },
    onSuccess: () => {
      toast("Password berhasil diubah!", "success");
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    },
    onError: (err: unknown) => {
      toast(err instanceof Error ? err.message : "Gagal mengubah password.", "error");
    },
  });

  if (isLoading || !user || !user.mustChangePassword) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Konfirmasi password tidak cocok!", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("Password minimal 6 karakter!", "error");
      return;
    }
    mutation.mutate();
  };

  const modalContent = (
    <div className="fixed inset-0 z-9999 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Selamat Datang, {user.fullName}!</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Anda menggunakan password default. Anda <span className="font-bold text-rose-500 dark:text-rose-400">Harus Mengganti Password</span> Demi Keamanan. Diharap mengingat password baru ini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Password Baru</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            {mutation.isPending ? "Menyimpan..." : "Ganti Password"}
          </button>
        </form>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(modalContent, document.body);
}
