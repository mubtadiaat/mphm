"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Layers, Home, BookOpen, Building2, Plus, Users, Calendar, ShieldAlert } from "lucide-react";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-zinc-900 border border-blue-500/30 rounded-3xl flex flex-col items-center justify-center text-center gap-5 shadow-lg my-6 max-w-3xl mx-auto"
    >
      <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
        <IconComponent className="w-10 h-10 animate-pulse" />
      </div>

      <div className="space-y-2 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prasyarat: {prerequisiteStep}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      <Link
        href={actionHref}
        className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-blue-400/30 group"
      >
        <span>{actionLabel}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
