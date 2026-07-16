"use client";
import dynamic from "next/dynamic";

const DocumentTemplateBuilder = dynamic(
  () => import("@/components/shared/DocumentTemplateBuilder").then((mod) => mod.DocumentTemplateBuilder),
  { ssr: false }
);

export default function DocumentTemplatePage() {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 lg:p-10 shadow-sm min-h-screen">
        <DocumentTemplateBuilder />
      </div>
    </div>
  );
}
