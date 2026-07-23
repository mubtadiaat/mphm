"use client";

import { useState, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ImportExportToolbar } from "@/components/shared/ImportExportToolbar";

interface UniversalDataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearch?: (query: string) => void;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  tableName?: string;
  importExportProps?: {
    title: string;
    headers: string[];
    disableImport?: boolean;
    disableExport?: boolean;
    onImportSuccess?: (importedRows: Record<string, string>[]) => void;
  };
}

export function UniversalDataGrid<TData, TValue>({
  columns,
  data,
  onSearch,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  loading = false,
  onRowClick,
  tableName,
  importExportProps,
}: UniversalDataGridProps<TData, TValue>) {
  "use no memo";
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && tableName) {
      const saved = localStorage.getItem(`col_vis_${tableName}`);
      if (saved) {
        try {
          setColumnVisibility(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, [tableName]);

  useEffect(() => {
    if (isMounted && typeof window !== "undefined" && tableName) {
      localStorage.setItem(`col_vis_${tableName}`, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility, tableName, isMounted]);

  // 1. Debounce Search logic (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(globalFilter);
    }, 300);

    return () => clearTimeout(handler);
  }, [globalFilter]);

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (onSearchRef.current) {
      onSearchRef.current(debouncedFilter);
    }
  }, [debouncedFilter]);

  const [filteredData, setFilteredData] = useState<TData[]>(data);

  useEffect(() => {
    if (onSearch) {
      setFilteredData(data);
      return;
    }
    if (!debouncedFilter.trim()) {
      setFilteredData(data);
      return;
    }
    const query = debouncedFilter.toLowerCase().trim();
    const filtered = data.filter((row) => {
      if (!row) return false;
      const rowObj = row as Record<string, unknown>;
      return Object.keys(rowObj).some((key) => {
        const val = rowObj[key];
        if (val === null || val === undefined) return false;
        if (typeof val === "object") return false;
        return String(val).toLowerCase().includes(query);
      });
    });
    setFilteredData(filtered);
  }, [data, debouncedFilter, onSearch]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true, // Server-side pagination
    pageCount,
  });

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all duration-300">
      {/* 1. Table Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari data (otomatis)..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 dark:text-zinc-200"
          />
        </div>

        {/* Import Export Actions (Replaces Column Manager) */}
        {importExportProps && (
          <ImportExportToolbar
            title={importExportProps.title}
            headers={importExportProps.headers}
            data={data as unknown as Record<string, string | number | boolean | null | undefined>[]}
            disableImport={importExportProps.disableImport}
            disableExport={importExportProps.disableExport}
            onImportSuccess={importExportProps.onImportSuccess}
          />
        )}
      </div>

      {/* 2. Loading State */}
      {loading && (
        <div className="h-1 bg-blue-500 animate-pulse w-full"></div>
      )}

      {/* 3. Table Container (Desktop / Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const metaAlign = (header.column.columnDef.meta as { align?: string } | undefined)?.align;
                  const alignClass = metaAlign === "center" ? "text-center" : metaAlign === "right" ? "text-right" : "text-left";
                  return (
                    <th key={header.id} className={`px-6 py-4 font-bold text-xs uppercase tracking-wider ${alignClass} text-zinc-500 dark:text-zinc-400`}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={`transition-colors duration-150 ${onRowClick ? "cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40" : "hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30"}`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const metaAlign = (cell.column.columnDef.meta as { align?: string } | undefined)?.align;
                    const alignClass = metaAlign === "center" ? "text-center" : metaAlign === "right" ? "text-right" : "text-left";
                    return (
                      <td key={cell.id} className={`px-6 py-4 text-zinc-700 dark:text-zinc-300 whitespace-nowrap ${alignClass} align-middle`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">
                  Data tidak ditemukan atau kosong.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Mobile Card-Stack List (Hidden on Desktop) */}
      <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <div 
              key={row.id} 
              onClick={() => onRowClick && onRowClick(row.original)}
              className={`p-4 flex flex-col gap-2 ${onRowClick ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-850/20"}`}
            >
              {row.getVisibleCells().map((cell) => {
                // Jangan tampilkan actions di baris data mobile biasa, taruh paling bawah jika ada
                const isActions = cell.column.id === "actions";
                return (
                  <div key={cell.id} className={`flex ${isActions ? "justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800" : "justify-between"} text-sm`}>
                    {!isActions && (
                      <span className="font-semibold text-zinc-400 dark:text-zinc-500">
                        {typeof cell.column.columnDef.header === "string"
                          ? cell.column.columnDef.header
                          : cell.column.id}
                      </span>
                    )}
                    <span className="text-zinc-700 dark:text-zinc-300 text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-zinc-500">
            Data tidak ditemukan atau kosong.
          </div>
        )}
      </div>

      {/* 5. Pagination Toolbar */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>baris</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onPageChange?.(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="p-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Halaman <strong className="text-zinc-900 dark:text-zinc-200">{pageIndex + 1}</strong> dari{" "}
            <strong className="text-zinc-900 dark:text-zinc-200">{pageCount}</strong>
          </span>

          <button
            onClick={() => onPageChange?.(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            className="p-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-350 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
