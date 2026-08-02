"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Layers } from "lucide-react";
import { useWorkspace } from "@/components/shared/WorkspaceContext";

interface GuidedEmptyStateProps {
  title: string;
  description: string;
  prerequisiteStep: string;
  actionLabel: string;
  actionHref: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function GuidedEmptyState({
  title,
  description,
  prerequisiteStep,
  actionLabel,
  actionHref,
  icon: IconComponent = Layers,
}: GuidedEmptyStateProps) {
  let isPondok = false;
  try {
    const ws = useWorkspace();
    isPondok = ws.activeWorkspace === "pondok";
  } catch (_) {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 sm:p-10 rounded-3xl flex flex-col items-center justify-center text-center gap-6 shadow-xl my-8 max-w-2xl mx-auto border ${
        isPondok
          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100"
          : "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-blue-950 dark:text-blue-100"
      }`}
    >
      <div className={`p-4 rounded-2xl border shadow-inner ${
        isPondok
          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
          : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
      }`}>
        <IconComponent className="w-10 h-10 animate-bounce text-blue-600 dark:text-blue-400" />
      </div>

      <div className="space-y-3 max-w-xl">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-xs ${
          isPondok
            ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
            : "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
        }`}>
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Prasyarat: {prerequisiteStep}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <Link
        href={actionHref}
        className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer text-white border group ${
          isPondok
            ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-400/30"
            : "bg-blue-600 hover:bg-blue-500 border-blue-400/30"
        }`}
      >
        <span>{actionLabel}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
