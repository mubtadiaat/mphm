"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { useAuditLog, AuditLog } from "@/features/sekretariat/queries/useAuditLog";
import { Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditLogTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
}

export function AuditLogTab({ onViewDetail }: AuditLogTabProps) {
  const { data: logsList = [], isLoading } = useAuditLog();
  const [detailData, setDetailData] = useState<Record<string, any> | null>(null);

  const formatEventDate = (dateVal?: string | Date) => {
    if (!dateVal) return "-";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return "-";
    }
  };

  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      id: "timestamp",
      header: "Waktu Kejadian",
      meta: { align: "left" },
      cell: ({ row }) => {
        const raw = (row.original as any).timestamp || (row.original as any).createdAt;
        return (
          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
            {formatEventDate(raw)}
          </span>
        );
      }
    },
    {
      accessorKey: "userId",
      header: "Pelaku Aksi",
      meta: { align: "left" },
      cell: ({ row }) => {
        const userId = row.original.userId || "SYSTEM";
        const fullName = (row.original as any).fullName || userId;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">{fullName}</span>
            <span className="text-[10px] text-zinc-400 font-mono">@{userId}</span>
          </div>
        );
      }
    },
    {
      id: "role",
      header: "Role",
      meta: { align: "center" },
      cell: ({ row }) => {
        const roleVal = (row.original as any).role || "Sekretariat";
        let badgeVariant: "info" | "success" | "warning" | "gold" | "neutral" = "info";
        if (roleVal === "sek.madrasah") badgeVariant = "success";
        else if (roleVal === "sek.pondok") badgeVariant = "gold";
        else if (roleVal === "Mustahiq") badgeVariant = "warning";
        return (
          <div className="flex justify-center">
            <PillBadge label={roleVal} variant={badgeVariant} />
          </div>
        );
      }
    },
    {
      id: "module",
      header: "Modul Sistem",
      meta: { align: "left" },
      cell: ({ row }) => {
        const modVal = (row.original as any).module || (row.original as any).entity || "Sistem";
        return <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">{modVal}</span>;
      }
    },
    {
      accessorKey: "action",
      header: "Aksi / Method",
      meta: { align: "center" },
      cell: ({ row }) => {
        const act = row.original.action || "INFO";
        let colorClass = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
        if (act === "DELETE" || act.includes("DELETE")) colorClass = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20";
        else if (act === "POST" || act === "CREATE" || act === "LOGIN") colorClass = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
        else if (act === "PUT" || act === "UPDATE" || act === "LOGOUT") colorClass = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";

        return (
          <div className="text-center">
            <span className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-extrabold ${colorClass}`}>
              {act}
            </span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-zinc-500/10 via-slate-500/5 to-transparent border border-zinc-500/20 dark:border-zinc-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Audit Log 24 Jam Realtime (Active & Rolling Purge)</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Audit Log Aktivitas Sistem
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xl">
            Jejak digital forensik transaksi data, sesi login/logout, penautan akun, dan perubahan CRUD 24 jam terakhir. Log secara otomatis dibersihkan secara bergulir setelah 24 jam.
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
        onRowClick={(row) => {
          const rowData = row as unknown as Record<string, any>;
          setDetailData(rowData);
          if (onViewDetail) onViewDetail(rowData);
        }}
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
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono text-xs">{formatEventDate(detailData.timestamp || detailData.createdAt)}</td>
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
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">{detailData.module || detailData.entity || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Aksi / Method</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold font-mono">{detailData.action || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Target Path</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono text-xs">{detailData.targetPath || "-"}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Deskripsi / Payload</td>
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
