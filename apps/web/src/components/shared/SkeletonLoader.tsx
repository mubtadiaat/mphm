"use client";

import React from "react";
import { PremiumLoader } from "./PremiumLoader";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-200 via-zinc-150 to-zinc-200 dark:from-zinc-800/80 dark:via-zinc-700/60 dark:to-zinc-800/80 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    </div>
  );
}

export function SkeletonLoader({ type = "table", message }: { type?: "table" | "cards" | "profile" | "full"; message?: string }) {
  if (type === "full") {
    return <PremiumLoader message={message || "Memuat Modul Sistem..."} />;
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex flex-col gap-4 shadow-sm relative overflow-hidden">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex flex-col md:flex-row gap-6 w-full items-center shadow-sm">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  // Default: Table Shimmer Rows with Premium Overlay
  return (
    <div className="w-full flex flex-col gap-4 p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex-1"></div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex flex-col gap-4.5 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 items-center p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

