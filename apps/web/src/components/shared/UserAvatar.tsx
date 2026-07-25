"use client";

import React from "react";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({ name, avatarUrl, size = "md", className = "" }: UserAvatarProps) {
  const getInitials = (str: string) => {
    if (!str || !str.trim()) return "U";
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const dimClass =
    size === "xs"
      ? "w-6 h-6 text-[9px]"
      : size === "sm"
      ? "w-7 h-7 text-[10px]"
      : size === "lg"
      ? "w-10 h-10 text-sm"
      : size === "xl"
      ? "w-12 h-12 text-base"
      : "w-8.5 h-8.5 text-xs";

  if (avatarUrl && avatarUrl.trim() && avatarUrl !== "-") {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${dimClass} rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-2xs ${className}`}
      />
    );
  }

  // Generate consistent vibrant gradient based on name string
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-amber-500 to-orange-600",
    "from-rose-600 to-pink-700",
    "from-sky-500 to-blue-700",
    "from-violet-600 to-purple-700",
    "from-cyan-600 to-blue-700",
  ];
  const bgGradient = gradients[Math.abs(hash) % gradients.length];

  return (
    <div
      className={`${dimClass} rounded-full bg-linear-to-br ${bgGradient} text-white font-extrabold flex items-center justify-center shrink-0 border border-white/20 shadow-2xs uppercase tracking-wider ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
