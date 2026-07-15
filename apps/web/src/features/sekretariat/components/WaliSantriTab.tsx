"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { useGuardians, Guardian } from "../queries/useGuardians";
import { TableActions } from "@/components/shared/TableActions";

interface SiswaTabProps {
  onViewDetail: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function WaliSantriTab({ onViewDetail, selectedYearId }: SiswaTabProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: remoteData = { data: [], total: 0 }, isLoading } = useGuardians(searchQuery, pageIndex, pageSize);
  const [guardiansList, setGuardiansList] = useState<Guardian[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Sync with TanStack Query data
  useEffect(() => {
    if (remoteData) {
      queueMicrotask(() => {
        setGuardiansList(remoteData.data);
        setTotalCount(remoteData.total);
      });
    }
  }, [remoteData]);

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
        onRowClick={(row) => onViewDetail(row as unknown as Record<string, unknown>)}
        tableName="wali_santri"
        importExportProps={{
          title: "Data Wali Santri",
          headers: ["name", "nik", "phone", "address"],
          onImportSuccess: (rows) => {
            console.log("Imported rows:", rows);
            // toast(`Berhasil mengimpor ${rows.length} baris data`, "success", "Import Data");
          }
        }}
      />
    </div>
  );
}
