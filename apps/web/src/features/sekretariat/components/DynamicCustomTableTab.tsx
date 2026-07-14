"use client";

import { useState, useEffect } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { useRoleUIConfig, RoleTypes } from "@/lib/useRoleUIConfig";

interface CustomFieldDef {
  name: string;
  label: string;
  type: "text" | "number";
}

interface CustomTableDef {
  key: string;
  name: string;
  fields: CustomFieldDef[];
}

interface CustomRowData {
  id: string;
  [key: string]: unknown;
}

interface DynamicCustomTableTabProps {
  tableKey: string;
  role: RoleTypes;
  onViewDetail?: (data: Record<string, unknown>) => void;
}

export function DynamicCustomTableTab({ tableKey, role, onViewDetail }: DynamicCustomTableTabProps) {
  const [tableDef, setTableDef] = useState<CustomTableDef | null>(null);
  const [tableData, setTableData] = useState<CustomRowData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [viewingDetailData, setViewingDetailData] = useState<Record<string, unknown> | null>(null);

  const { canDoAction } = useRoleUIConfig(role);
  const route = `/${role}/custom-${tableKey}`;
  const canView = canDoAction(route, "view");
  const canInput = canDoAction(route, "input");
  const canEdit = canDoAction(route, "edit");
  const canDelete = canDoAction(route, "delete");
  const canExport = canDoAction(route, "export");
  const canImport = canDoAction(route, "import");

  // Load definition and data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRegistry = localStorage.getItem("custom_tables_registry");
      if (savedRegistry) {
        try {
          const registry: CustomTableDef[] = JSON.parse(savedRegistry);
          const found = registry.find((t) => t.key === tableKey);
          if (found) {
            queueMicrotask(() => {
              setTableDef(found);
              
              // Pre-fill blank form data
              const initialForm: Record<string, string> = {};
              found.fields.forEach((f) => {
                initialForm[f.name] = "";
              });
              setFormData(initialForm);
            });
          }
        } catch (e) {
          console.error("Failed to parse registry", e);
        }
      }

      const savedData = localStorage.getItem(`custom_table_data_${tableKey}`);
      if (savedData) {
        try {
          queueMicrotask(() => setTableData(JSON.parse(savedData)));
        } catch (e) {
          console.error("Failed to parse custom table data", e);
        }
      }
    }
  }, [tableKey]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl gap-4 animate-fade-in">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Akses Ditutup</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          Modul tabel kustom ini dinonaktifkan oleh Sekretariat melalui Pengaturan Pusat.
        </p>
      </div>
    );
  }

  if (!tableDef) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <p className="text-zinc-500">Memuat definisi tabel atau tabel tidak ditemukan...</p>
      </div>
    );
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleAddRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInput) return;
    
    // Parse form values matching the types
    const newRow: CustomRowData = {
      id: `row-${Date.now()}`
    };

    tableDef.fields.forEach((field) => {
      const val = formData[field.name];
      newRow[field.name] = field.type === "number" ? (Number(val) || 0) : val;
    });

    const nextData = [newRow, ...tableData];
    setTableData(nextData);
    localStorage.setItem(`custom_table_data_${tableKey}`, JSON.stringify(nextData));

    // Reset Form
    const resetForm: Record<string, string> = {};
    tableDef.fields.forEach((f) => {
      resetForm[f.name] = "";
    });
    setFormData(resetForm);
    setShowAddModal(false);
  };

  const handleDeleteRow = (id: string) => {
    if (!canDelete) return;
    const nextData = tableData.filter((row) => row.id !== id);
    setTableData(nextData);
    localStorage.setItem(`custom_table_data_${tableKey}`, JSON.stringify(nextData));
  };

  // Build columns dynamically
  const columns: ColumnDef<CustomRowData, unknown>[] = [
    ...tableDef.fields.map((field) => ({
      accessorKey: field.name,
      header: field.label,
      cell: (info: { getValue: () => unknown }) => {
        const val = info.getValue();
        if (typeof val === "number") {
          return <span className="font-mono">{val}</span>;
        }
        return <span className="text-sm text-zinc-800 dark:text-zinc-200">{String(val || "-")}</span>;
      }
    })),
    {
      id: "actions",
      header: "Aksi",
      cell: (info: { row: { original: CustomRowData } }) => (
        <TableActions 
          onEdit={canEdit ? () => console.log("Edit Custom Row") : undefined} 
          onDelete={canDelete ? () => handleDeleteRow(info.row.original.id) : undefined} 
          onDetail={() => {
            if (onViewDetail) {
              onViewDetail(info.row.original);
            } else {
              setViewingDetailData(info.row.original);
            }
          }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white capitalize">
            {tableDef.name}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Tabel kustom dinamis untuk pencatatan dan pengelolaan data {tableDef.name.toLowerCase()}.
          </p>
        </div>

        {canInput && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Baru</span>
          </button>
        )}
      </div>

      <UniversalDataGrid
        columns={columns}
        data={tableData}
        pageCount={1}
        pageIndex={0}
        pageSize={10}
        onRowClick={(row) => {
          if (onViewDetail) {
            onViewDetail(row as unknown as Record<string, unknown>);
          } else {
            setViewingDetailData(row as unknown as Record<string, unknown>);
          }
        }}
        tableName={`custom_${tableKey}`}
        importExportProps={{
          title: tableDef.name,
          headers: tableDef.fields.map((f) => f.label),
          disableImport: !canImport,
          disableExport: !canExport,
          onImportSuccess: (importedRows) => {
            if (!canImport) return;
            const mapped: CustomRowData[] = importedRows.map((r, idx) => {
              const row: CustomRowData = {
                id: `row-imported-${Date.now()}-${idx}`
              };
              tableDef.fields.forEach((field) => {
                const val = r[field.label] || "";
                row[field.name] = field.type === "number" ? (Number(val) || 0) : val;
              });
              return row;
            });
            const nextData = [...mapped, ...tableData];
            setTableData(nextData);
            localStorage.setItem(`custom_table_data_${tableKey}`, JSON.stringify(nextData));
          }
        }}
      />

      {/* Add New Custom Row Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Tambah Data Baru ({tableDef.name})</h3>
                  <p className="text-xs text-zinc-500">Masukkan nilai untuk masing-masing kolom kustom yang terdaftar.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddRowSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {tableDef.fields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{field.label}</label>
                    <input 
                      type={field.type === "number" ? "number" : "text"} 
                      required
                      value={formData[field.name] || ""} 
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                      className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                    />
                  </div>
                ))}

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Internal Details View Modal */}
      <AnimatePresence>
        {viewingDetailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingDetailData(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Detail Data Kustom</h3>
                  <p className="text-xs text-zinc-550">Informasi nilai kolom kustom terdaftar.</p>
                </div>
                <button 
                  onClick={() => setViewingDetailData(null)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                {tableDef.fields.map((field) => {
                  const val = viewingDetailData[field.name];
                  return (
                    <div key={field.name} className="py-3 flex justify-between gap-4 first:pt-0 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                      <span className="text-zinc-500 font-semibold shrink-0">{field.label}</span>
                      <span className="text-zinc-900 dark:text-white font-bold text-right wrap-break-word">{String(val !== undefined && val !== null ? val : "-")}</span>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-150 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setViewingDetailData(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
