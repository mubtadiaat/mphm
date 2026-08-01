"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Database, Search, RefreshCw } from "lucide-react";
import { JsonInspectorModal } from "../shared/JsonInspectorModal";

const DB_TABLES = [
  { value: "people", label: "Table: people (Santriwati, Pengurus, Wali)", endpoint: "/api/admin/people" },
  { value: "users", label: "Table: user_accounts (Akun Login)", endpoint: "/api/admin/users" },
  { value: "classes", label: "Table: academic_classes (Rombel Kelas)", endpoint: "/api/admin/classes" },
  { value: "years", label: "Table: academic_years (Tahun Ajaran)", endpoint: "/api/academic/years" },
  { value: "subjects", label: "Table: subjects (Mata Pelajaran)", endpoint: "/api/admin/subjects" },
  { value: "rooms", label: "Table: rooms (Asrama & Kamar)", endpoint: "/api/admin/rooms" },
  { value: "scores", label: "Table: student_scores (Nilai Kwartal)", endpoint: "/api/assessment/scores" },
  { value: "violations", label: "Table: violations (Pelanggaran)", endpoint: "/api/disciplinary/violations" },
  { value: "permits", label: "Table: student_permits (Perizinan)", endpoint: "/api/disciplinary/permits" },
  { value: "audit_logs", label: "Table: audit_logs (Log Aktivitas)", endpoint: "/api/admin/audit-log" },
  { value: "recycle_bin", label: "Table: soft_deleted (Recycling Bin)", endpoint: "/api/admin/recycle-bin" },
  { value: "settings", label: "Table: system_settings (Konfigurasi)", endpoint: "/api/settings" },
  { value: "telemetry", label: "Table: app_telemetry (Versi & Telemetry)", endpoint: "/api/admin/telemetry" },
  { value: "violation_types", label: "Table: violation_types (Jenis Pelanggaran)", endpoint: "/api/admin/violations/types" },
  { value: "violation_categories", label: "Table: violation_categories (Kategori)", endpoint: "/api/admin/violations/categories" },
  { value: "violation_severities", label: "Table: violation_severities (Tingkat)", endpoint: "/api/admin/violations/severities" },
];

export function DatabaseExplorerTab() {
  const [selectedTable, setSelectedTable] = useState(DB_TABLES[0].value);
  const [rawDbData, setRawDbData] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRowDetail, setSelectedRowDetail] = useState<any | null>(null);

  const currentTable = DB_TABLES.find((t) => t.value === selectedTable) || DB_TABLES[0];

  const fetchTableData = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch(currentTable.endpoint);
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data)
          ? json.data
          : json.data && typeof json.data === "object"
          ? Object.entries(json.data).map(([k, v]) => ({ key: k, value: String(v) }))
          : Array.isArray(json)
          ? json
          : [];
        setRawDbData(data);
      } else {
        setRawDbData([]);
      }
    } catch {
      setRawDbData([]);
    } finally {
      setIsLoadingDb(false);
    }
  }, [currentTable.endpoint]);

  useEffect(() => {
    fetchTableData();
  }, [selectedTable, fetchTableData]);

  const filteredDbData = rawDbData.filter((row) => {
    if (!searchQuery) return true;
    return JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" /> Database Inspector — Real-time Record Explorer
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Inspeksi data tabel langsung dari Database Server ({DB_TABLES.length} tabel tersedia).</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden"
              />
            </div>

            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer max-w-xs"
            >
              {DB_TABLES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchTableData}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all cursor-pointer"
              title="Reload Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDb ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">#</th>
                {filteredDbData.length > 0 &&
                  Object.keys(filteredDbData[0])
                    .slice(0, 8)
                    .map((key) => (
                      <th key={key} className="py-3 px-4">
                        {key}
                      </th>
                    ))}
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredDbData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500 font-sans text-xs">
                    {isLoadingDb ? "Memuat data database..." : "Tidak ada record ditemukan dalam tabel ini."}
                  </td>
                </tr>
              ) : (
                filteredDbData.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-600">{idx + 1}</td>
                    {Object.values(row)
                      .slice(0, 8)
                      .map((val: any, vIdx) => (
                        <td key={vIdx} className="py-3 px-4 font-semibold max-w-xs truncate">
                          {val === null || val === undefined
                            ? "-"
                            : typeof val === "object"
                            ? JSON.stringify(val).slice(0, 60)
                            : String(val).slice(0, 80)}
                        </td>
                      ))}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRowDetail(row)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Inspect JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-xs text-zinc-500 font-mono pt-1">
          <span>
            Total Record: {filteredDbData.length} baris{filteredDbData.length > 50 ? " (menampilkan 50 teratas)" : ""}
          </span>
          <span>Endpoint: {currentTable.endpoint}</span>
        </div>
      </div>

      {selectedRowDetail && <JsonInspectorModal data={selectedRowDetail} onClose={() => setSelectedRowDetail(null)} />}
    </div>
  );
}
