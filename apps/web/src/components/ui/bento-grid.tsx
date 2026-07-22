"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-6 dark:bg-zinc-900/80 dark:border-zinc-800/80 bg-white border border-zinc-200/80 backdrop-blur-md flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden",
        className
      )}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover/bento:bg-emerald-500/20 transition-all duration-500" />
      
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200 relative z-10">
        {icon && <div className="mb-2 text-emerald-600 dark:text-emerald-400">{icon}</div>}
        <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 text-lg">
          {title}
        </div>
        <div className="font-normal text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
          {description}
        </div>
      </div>
    </motion.div>
  );
};
