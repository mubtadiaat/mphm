"use client";

import { Construction } from "lucide-react";

export default function UnderConstructionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-indigo-500" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Segera Hadir</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
        Modul ini masih dalam tahap pengembangan dan akan segera tersedia pada pembaruan sistem berikutnya.
      </p>
    </div>
  );
}
