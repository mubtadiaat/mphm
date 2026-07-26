"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/shared/ToastContext";
import { SystemSettingsProvider } from "@/components/providers/SystemSettingsProvider";
import { ForcePasswordChangeModal } from "@/components/shared/ForcePasswordChangeModal";

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes stale time (INSTANT responses on switching menus!)
            gcTime: 30 * 60 * 1000, // 30 minutes memory cache retention
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <SystemSettingsProvider>
            {children}
            <ForcePasswordChangeModal />
          </SystemSettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
