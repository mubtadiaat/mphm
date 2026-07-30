"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    handleNativeGoogleSignIn?: (email: string, idToken?: string, displayName?: string) => Promise<void>;
  }
}

export default function NativeGoogleSignInHandler() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.handleNativeGoogleSignIn = async (email: string, idToken?: string, displayName?: string) => {
      try {
        console.log("Native Google Sign-In Callback Triggered:", { email, idToken, displayName });
        
        const res = await fetch("/api/auth/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            uid: idToken || undefined,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

          const userRole = data.data?.role;
          if (userRole === "GUARDIAN") {
            router.replace("/guardian");
          } else if (userRole === "STAFF" || userRole === "TEACHER") {
            router.replace("/staff");
          } else {
            router.replace("/sekretariat");
          }
        } else {
          // If unregistered or error
          window.location.href = `/auth/google/callback?email=${encodeURIComponent(email)}`;
        }
      } catch (err) {
        console.error("Native Google Login Handler Error:", err);
        window.location.href = `/auth/google/callback?email=${encodeURIComponent(email)}`;
      }
    };

    return () => {
      delete window.handleNativeGoogleSignIn;
    };
  }, [router, queryClient]);

  return null;
}
