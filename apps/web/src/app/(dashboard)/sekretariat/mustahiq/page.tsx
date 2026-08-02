"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MustahiqRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sekretariat/pengajar");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-zinc-500 font-mono">
      Mengalihkan ke Menu Data Pengajar...
    </div>
  );
}
