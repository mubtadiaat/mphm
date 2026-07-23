"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle, Trash2, HelpCircle } from "lucide-react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ToastContextType {
  toast: (message: string, type: ToastType, title?: string, duration?: number) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

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

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const handleConfirmResponse = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info className="w-5 h-5 text-blue-500" />;
            let borderColor = "border-blue-500/20 dark:border-blue-500/10";
            let glowColor = "shadow-blue-500/10";
            let indicatorBg = "bg-blue-500";
            let defaultTitle = "Info";

            if (t.type === "success") {
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
              borderColor = "border-emerald-500/20 dark:border-emerald-500/10";
              glowColor = "shadow-emerald-500/10";
              indicatorBg = "bg-emerald-500";
              defaultTitle = "Berhasil";
            } else if (t.type === "error") {
              icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
              borderColor = "border-rose-500/20 dark:border-rose-500/10";
              glowColor = "shadow-rose-500/10";
              indicatorBg = "bg-rose-500";
              defaultTitle = "Kesalahan";
            } else if (t.type === "warning") {
              icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
              borderColor = "border-amber-500/20 dark:border-amber-500/10";
              glowColor = "shadow-amber-500/10";
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
                className={`pointer-events-auto relative overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border ${borderColor} rounded-2xl p-4 shadow-xl ${glowColor} flex gap-3.5 items-start`}
              >
                {/* Visual Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${indicatorBg}`} />
                
                <div className="shrink-0 pt-0.5">{icon}</div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">
                    {t.title || defaultTitle}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 font-semibold leading-relaxed">
                    {t.message}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
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

      {/* Premium Confirm Modal Portal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirmResponse(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {confirmState.options.type === "danger" ? (
                  <div className="w-16 h-16 bg-rose-500/15 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/10">
                    <Trash2 className="w-8 h-8" />
                  </div>
                ) : confirmState.options.type === "warning" ? (
                  <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-500/15 border border-blue-500/30 text-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                )}

                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {confirmState.options.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-sm">
                  {confirmState.options.message}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmResponse(false)}
                  className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
                >
                  {confirmState.options.cancelText || "Batal"}
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmResponse(true)}
                  className={`flex-1 py-3 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer text-white shadow-lg active:scale-95 ${
                    confirmState.options.type === "danger"
                      ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                      : confirmState.options.type === "warning"
                      ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                      : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                  }`}
                >
                  {confirmState.options.confirmText || "Ya, Lanjutkan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
