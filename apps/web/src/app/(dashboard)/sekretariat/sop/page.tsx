"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SOPGuideTab = dynamic(
  () => import("@/features/sekretariat/components/SOPGuideTab").then((mod) => mod.SOPGuideTab),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
        <span className="text-xs font-bold">Memuat Panduan &amp; SOP Sekretariat...</span>
      </div>
    ),
    ssr: false,
  }
);

export default function SOPGuidePage() {
  return <SOPGuideTab />;
}
