"use client";

import { RecycleBinTab } from "../../../../features/sekretariat/components/RecycleBinTab";

export default function RecycleBinPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Recycling Bin</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Semua data yang dihapus dari sistem akan masuk ke sini. Data akan dihapus secara permanen secara otomatis setelah 24-48 jam.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <RecycleBinTab />
      </div>
    </div>
  );
}
