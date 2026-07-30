"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const email = searchParams.get("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setError("Email tidak ditemukan dalam parameter callback.");
      setLoading(false);
      return;
    }

    const processGoogleCallback = async () => {
      try {
        const res = await fetch("/api/auth/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal otentikasi Google.");
        }

        await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

        // Redirect based on role
        const userRole = data.data?.role;
        if (userRole === "GUARDIAN") {
          router.replace("/guardian");
        } else if (userRole === "STAFF" || userRole === "TEACHER") {
          router.replace("/staff");
        } else {
          router.replace("/sekretariat");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat otentikasi Google.");
        setLoading(false);
      }
    };

    processGoogleCallback();
  }, [email, router, queryClient]);

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-3xl rounded-[32px] p-8 text-center relative overflow-hidden z-10 shadow-2xl"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-slate-950 border border-amber-500/30 rounded-2xl p-2 flex items-center justify-center shadow-lg">
          <Image
            src="/logo.png"
            alt="Logo P3HM & MPHM"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
            <h2 className="text-xl font-black text-white">Memproses Login Google...</h2>
            <p className="text-xs text-slate-400">Mohon tunggu sebentar, sistem sedang memverifikasi akun Anda.</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs text-left">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Otentikasi Gagal</strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/loginguardiant")}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Kembali ke Halaman Login
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-black text-white">Berhasil Terverifikasi!</h2>
            <p className="text-xs text-slate-400">Mengalihkan Anda ke halaman utama...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh w-full bg-slate-950 text-white flex items-center justify-center">
        <div className="text-emerald-400 font-bold font-mono">Memuat Callback...</div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
