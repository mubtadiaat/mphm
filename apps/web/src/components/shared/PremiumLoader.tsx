"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

interface PremiumLoaderProps {
  message?: string;
  subtext?: string;
  compact?: boolean;
}

export function PremiumLoader({
  message = "Memuat Data Sistem...",
  subtext = "Harap tunggu sebentar, menyinkronkan data instansi...",
  compact = false
}: PremiumLoaderProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="relative flex items-center justify-center w-5 h-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-5 h-5 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 border-r-emerald-500"
          />
          <Sparkles className="w-2.5 h-2.5 text-emerald-500 absolute" />
        </div>
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{message}</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
      {/* Subtle Glowing Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main Glassmorphism Loading Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-8 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full space-y-5"
      >
        {/* Animated Multi-Ring Spinner */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-500/30 dark:border-emerald-400/30 absolute"
          />
          
          {/* Middle Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            className="w-14 h-14 rounded-full border-2 border-emerald-500 border-t-transparent border-l-transparent absolute shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          />

          {/* Inner Pulsing Core */}
          <motion.div
            animate={{ scale: [0.85, 1.15, 0.85] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-9 h-9 bg-linear-to-tr from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg text-white"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <h4 className="font-black text-base text-zinc-900 dark:text-white tracking-tight">
            {message}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xs leading-relaxed">
            {subtext}
          </p>
        </div>

        {/* Shimmering Progress Bar Indicator */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden relative">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="w-1/2 h-full bg-linear-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-full shadow-xs"
          />
        </div>
      </motion.div>
    </div>
  );
}
