"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { getHijriAndMasehiDate } from "../../lib/hijri";

interface HijriDateDisplayProps {
  date?: Date;
  className?: string;
  showIcon?: boolean;
}

export function HijriDateDisplay({ date = new Date(), className = "", showIcon = true }: HijriDateDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const formattedDate = mounted ? getHijriAndMasehiDate(date) : "";

  return (
    <div className={`flex items-center gap-2 text-sm text-zinc-650 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/60 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl w-fit shadow-xs ${className}`}>
      {showIcon && <Calendar className="w-4 h-4 text-blue-500" />}
      <span className="font-semibold">{formattedDate || "Loading tanggal..."}</span>
    </div>
  );
}
