"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MunawwibRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sekretariat/mustahiq");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-zinc-500 font-mono">
      Mengalihkan ke Menu Data Pengajar (Mustahiq & Munawwib)...
    </div>
  );
}
