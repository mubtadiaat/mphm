"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { useAuditLog, AuditLog } from "@/features/sekretariat/queries/useAuditLog";
import { Activity } from "lucide-react";

interface AuditLogTabProps {
  onViewDetail: (data: Record<string, unknown>) => void;
}

export function AuditLogTab({ onViewDetail }: AuditLogTabProps) {
  const { data: logsList = [], isLoading } = useAuditLog();

  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: "timestamp",
      header: "Waktu Kejadian",
      cell: (info) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{new Date(info.getValue() as string).toLocaleString("id-ID")}</span>
    },
    {
      accessorKey: "userId",
      header: "Pelaku Aksi",
      cell: (info) => <span className="font-bold text-zinc-800 dark:text-zinc-200">{info.getValue() as string}</span>
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => <PillBadge label={info.getValue() as string} variant="info" />
    },
    {
      accessorKey: "module",
      header: "Modul Sistem",
      cell: (info) => <span className="font-semibold text-zinc-700 dark:text-zinc-300">{info.getValue() as string}</span>
    },
    {
      accessorKey: "action",
      header: "HTTP Method",
      cell: (info) => {
        const val = info.getValue() as string;
        return <span className={`font-mono text-xs font-extrabold ${val === "DELETE" ? "text-rose-500" : val === "POST" ? "text-emerald-500" : "text-amber-500"}`}>{val}</span>;
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
        onRowClick={(row) => onViewDetail(row as unknown as Record<string, unknown>)}
        tableName="audit_log"
      />
    </div>
  );
}
