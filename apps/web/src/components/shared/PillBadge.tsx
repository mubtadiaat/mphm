"use client";

interface PillBadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "gold" | "neutral";
  customColor?: string;
}

export function PillBadge({ label, variant = "neutral", customColor }: PillBadgeProps) {
  const baseStyles = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors duration-150";
  
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
    info: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
    gold: "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30",
    neutral: "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  };

  const style = customColor
    ? { backgroundColor: `${customColor}10`, color: customColor, borderColor: `${customColor}30`, borderWidth: "1px" }
    : undefined;

  return (
    <span
      className={`${baseStyles} ${customColor ? "" : variants[variant]}`}
      style={style}
    >
      {label}
    </span>
  );
}
