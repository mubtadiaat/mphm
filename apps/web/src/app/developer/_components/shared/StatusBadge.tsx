"use client";
import React from "react";

interface StatusBadgeProps {
  status: "online" | "degraded" | "offline" | "error" | "warning" | "ok";
  label?: string;
  pulse?: boolean;
}

const colorMap: Record<StatusBadgeProps["status"], { bg: string; text: string; dot: string }> = {
  online:   { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  ok:       { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  degraded: { bg: "bg-amber-500/10 border-amber-500/30",     text: "text-amber-400",   dot: "bg-amber-400" },
  warning:  { bg: "bg-amber-500/10 border-amber-500/30",     text: "text-amber-400",   dot: "bg-amber-400" },
  offline:  { bg: "bg-rose-500/10 border-rose-500/30",       text: "text-rose-400",    dot: "bg-rose-400" },
  error:    { bg: "bg-rose-500/10 border-rose-500/30",       text: "text-rose-400",    dot: "bg-rose-400" },
};

export function StatusBadge({ status, label, pulse = false }: StatusBadgeProps) {
  const c = colorMap[status] || colorMap.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${pulse ? "animate-pulse" : ""}`} />
      {label || status}
    </span>
  );
}
