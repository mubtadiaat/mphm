"use client";

import { useState, useEffect } from "react";
import { User, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { useGuardians, Guardian } from "../queries/useGuardians";
import { useToast } from "@/components/shared/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

interface SiswaTabProps {
  onViewDetail: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

const DEFAULT_PAGINATED_DATA = { data: [], total: 0 };

export function WaliSantriTab({ onViewDetail }: SiswaTabProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailData, setDetailData] = useState<Record<string, any> | null>(null);

  const { data: remoteData = DEFAULT_PAGINATED_DATA, isLoading } = useGuardians(searchQuery, pageIndex, pageSize);
  const [guardiansList, setGuardiansList] = useState<Guardian[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  // Sync with TanStack Query data
  useEffect(() => {
    if (remoteData) {
      setGuardiansList(remoteData.data);
      setTotalCount(remoteData.total);
    }
  }, [remoteData.data, remoteData.total]);

  // Columns definition: Wali Santri (Smart KK Mapping)
  const guardianColumns: ColumnDef<typeof guardiansList[number], unknown>[] = [
    {
      accessorKey: "guardianName",
      header: "Nama Wali",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {info.getValue() as string ? (info.getValue() as string).substring(0, 2).toUpperCase() : "WL"}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{info.getValue() as string}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Hubungan: {info.row.original.relation}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "familyCardNumber",
      header: "Nomor KK (Kartu Keluarga)",
      cell: (info) => <span className="font-mono text-xs text-zinc-800 dark:text-zinc-300 font-bold">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "nik",
      header: "NIK Wali",
      cell: (info) => <span className="font-mono text-xs text-zinc-800 dark:text-zinc-300 font-bold">{info.getValue() as string || "-"}</span>,
    },
    {
      accessorKey: "phone",
      header: "No. HP / WhatsApp",
      cell: (info) => <span className="text-zinc-700 dark:text-zinc-300 text-xs font-mono">{info.getValue() as string}</span>,
    },
    {
      id: "children",
      header: "Jumlah Anak Binaan",
      cell: (info) => (
        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-md border border-blue-150 dark:border-blue-900/40">
          {info.row.original.childrenCount} Santri
        </span>
      ),
    },
  ];

  // const { toast } = useToast();

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Manajemen Kesiswaan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Wali Santri
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Sistem pemetaan Smart KK Mapping untuk mengelola jaringan keluarga santriwati secara terpusat.
          </p>
        </div>
      </div>

      <UniversalDataGrid
        columns={guardianColumns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={guardiansList as unknown as Record<string, unknown>[]}
        pageCount={Math.ceil(totalCount / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        onRowClick={(row) => setDetailData(row as unknown as Record<string, any>)}
        tableName="wali_santri"
        importExportProps={{
          title: "Data Master Wali Santri",
          headers: ["Nama Lengkap Wali", "NIK Wali (16 Digit)", "No. HP / WA Wali", "Nomor Kartu Keluarga (KK)"],
          onImportSuccess: async (rows) => {
            let count = 0;
            for (const r of rows) {
              const nameVal = r["Nama Lengkap Wali"] || r["nama"] || "";
              if (!nameVal.trim()) continue;
              const phoneVal = r["No. HP / WA Wali"] || r["phone"] || "";
              const kkVal = r["Nomor Kartu Keluarga (KK)"] || r["familyCardNumber"] || "";
              const nikVal = r["NIK Wali (16 Digit)"] || r["nik"] || "";
              try {
                const res = await fetch("/api/admin/people", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fullName: nameVal,
                    nik: nikVal || null,
                    phoneNumber: phoneVal || null,
                    gender: "L",
                    role: "guardian",
                    guardianName: nameVal,
                    guardianPhone: phoneVal,
                    familyCardNumber: kkVal || null,
                  }),
                });
                if (!res.ok) {
                  const errData = await res.json().catch(() => ({}));
                  throw new Error(errData.message || `HTTP ${res.status}`);
                }
                count++;
              } catch (err) {
                console.error("Import row failed:", err);
              }
            }
            if (count > 0) {
              toast(`Berhasil mengimpor ${count} data Wali Santri!`, "success", "Import Berhasil");
            }
          }
        }}
      />

      {/* Detail Modal */}
      <AnimatePresence>
        {detailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDetailData(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  Detail Wali Santri
                </h3>
                <button onClick={() => setDetailData(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 capitalize w-1/3 text-left">Nama Wali</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{detailData.guardianName || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 capitalize w-1/3 text-left">Hubungan</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">{detailData.relation || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 capitalize w-1/3 text-left">NIK</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{detailData.nik || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 capitalize w-1/3 text-left">No Telepon</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{detailData.phoneNumber || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 capitalize w-1/3 text-left">Nomor KK</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{detailData.familyCardNumber || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
