"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { useAuditLog, AuditLog } from "@/features/sekretariat/queries/useAuditLog";
import { Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditLogTabProps {
  onViewDetail: (data: Record<string, unknown>) => void;
}

export function AuditLogTab({ onViewDetail }: AuditLogTabProps) {
  const { data: logsList = [], isLoading } = useAuditLog();
  const [detailData, setDetailData] = useState<Record<string, any> | null>(null);

  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: "timestamp",
      header: "Waktu Kejadian",
      meta: { align: "left" },
      cell: (info) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{new Date(info.getValue() as string).toLocaleString("id-ID")}</span>
    },
    {
      accessorKey: "userId",
      header: "Pelaku Aksi",
      meta: { align: "left" },
      cell: (info) => <span className="font-bold text-zinc-800 dark:text-zinc-200">{info.getValue() as string}</span>
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { align: "center" },
      cell: (info) => <div className="flex justify-center"><PillBadge label={info.getValue() as string} variant="info" /></div>
    },
    {
      accessorKey: "module",
      header: "Modul Sistem",
      meta: { align: "left" },
      cell: (info) => <span className="font-semibold text-zinc-700 dark:text-zinc-300">{info.getValue() as string}</span>
    },
    {
      accessorKey: "action",
      header: "HTTP Method",
      meta: { align: "center" },
      cell: (info) => {
        const val = info.getValue() as string;
        return <div className="text-center"><span className={`font-mono text-xs font-extrabold ${val === "DELETE" ? "text-rose-500" : val === "POST" ? "text-emerald-500" : "text-amber-500"}`}>{val}</span></div>;
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-zinc-500/10 via-slate-500/5 to-transparent border border-zinc-500/20 dark:border-zinc-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-zinc-650 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Keamanan Sistem</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Forensic Audit Log
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Jejak digital forensik transaksi data penting, perubahan nilai, dan mutasi santri seumur hidup.
          </p>
        </div>
      </div>

      <UniversalDataGrid
        columns={columns}
        data={logsList}
        pageCount={1}
        pageIndex={0}
        pageSize={10}
        loading={isLoading}
        onRowClick={(row) => setDetailData(row as unknown as Record<string, any>)}
        tableName="audit_log"
      />

      {/* Detail Modal */}
      <AnimatePresence>
        {detailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDetailData(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Detail Jejak Digital Audit
                </h3>
                <button onClick={() => setDetailData(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Waktu</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono text-xs">{new Date(detailData.timestamp).toLocaleString("id-ID")}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">User ID (Pelaku)</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{detailData.userId || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Role Pelaku</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">{detailData.role || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Modul</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">{detailData.module || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Metode HTTP</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold font-mono">{detailData.action || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Path URL</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono text-xs">{detailData.targetPath || "-"}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Data Payload</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">
                        <pre className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-[10px] font-mono overflow-x-auto max-w-xs md:max-w-md">
                          {detailData.details || "-"}
                        </pre>
                      </td>
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
