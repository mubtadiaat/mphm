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
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
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
