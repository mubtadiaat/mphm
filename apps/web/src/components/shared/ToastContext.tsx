"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type: ToastType, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType, title?: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, title, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-5 right-5 z-[60] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info className="w-5 h-5 text-blue-500" />;
            let borderColor = "border-blue-500/20 dark:border-blue-500/10";
            let glowColor = "shadow-blue-500/5";
            let indicatorBg = "bg-blue-500";
            let defaultTitle = "Info";

            if (t.type === "success") {
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
              borderColor = "border-emerald-500/20 dark:border-emerald-500/10";
              glowColor = "shadow-emerald-500/5";
              indicatorBg = "bg-emerald-500";
              defaultTitle = "Berhasil";
            } else if (t.type === "error") {
              icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
              borderColor = "border-rose-500/20 dark:border-rose-500/10";
              glowColor = "shadow-rose-500/5";
              indicatorBg = "bg-rose-500";
              defaultTitle = "Kesalahan";
            } else if (t.type === "warning") {
              icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
              borderColor = "border-amber-500/20 dark:border-amber-500/10";
              glowColor = "shadow-amber-500/5";
              indicatorBg = "bg-amber-500";
              defaultTitle = "Peringatan";
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                className={`pointer-events-auto relative overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border ${borderColor} rounded-2xl p-4 shadow-lg ${glowColor} flex gap-3.5 items-start`}
              >
                {/* Visual Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${indicatorBg}`} />
                
                <div className="shrink-0 pt-0.5">{icon}</div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {t.title || defaultTitle}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed">
                    {t.message}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Animated progress bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: 0 }}
                  transition={{ duration: (t.duration || 4000) / 1000, ease: "linear" }}
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${indicatorBg}/30`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
