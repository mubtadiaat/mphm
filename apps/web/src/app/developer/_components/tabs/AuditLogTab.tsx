"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FileText, RefreshCw, Search, Filter } from "lucide-react";
import { JsonInspectorModal } from "../shared/JsonInspectorModal";

interface AuditLogEntry {
  id?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  details?: string;
  ipAddress?: string;
  createdAt?: string;
  [key: string]: any;
}

export function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"today" | "7days" | "30days">("today");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/audit-log");
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Time-based filtering
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.createdAt || "");
    const now = new Date();
    const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);

    let passesTime = true;
    if (timeFilter === "today") passesTime = diffHours <= 24;
    else if (timeFilter === "7days") passesTime = diffHours <= 168;
    else if (timeFilter === "30days") passesTime = diffHours <= 720;

    const passesSearch = searchQuery
      ? JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return passesTime && passesSearch;
  });

  const formatDate = (d: string | undefined) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" /> Audit Log 24 Jam — Aktivitas Sistem Real-Time
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Catatan seluruh aktivitas pengguna dan perubahan data di sistem.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
              {(["today", "7days", "30days"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTimeFilter(f)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    timeFilter === f
                      ? "bg-emerald-500 text-zinc-950"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f === "today" ? "24 Jam" : f === "7days" ? "7 Hari" : "30 Hari"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchAuditLogs}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Entitas</th>
                <th className="py-3 px-4">Detail</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500 text-xs">
                    {isLoading ? "Memuat audit log..." : "Tidak ada log aktivitas ditemukan untuk periode ini."}
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 100).map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-600 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="py-3 px-4 font-bold text-white">{log.userName || log.userId || "-"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-400 text-[10px] font-bold">{log.userRole || "-"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${
                        log.action?.includes("CREATE") || log.action?.includes("INSERT")
                          ? "text-emerald-400"
                          : log.action?.includes("DELETE")
                          ? "text-rose-400"
                          : log.action?.includes("UPDATE")
                          ? "text-amber-400"
                          : "text-zinc-300"
                      }`}>
                        {log.action || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono">{log.entityType || "-"}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</td>
                    <td className="py-3 px-4 text-zinc-500 max-w-xs truncate">{log.details || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-xs text-zinc-500 font-mono pt-1">
          <span>Total Log: {filteredLogs.length} entri{filteredLogs.length > 100 ? " (menampilkan 100 teratas)" : ""}</span>
          <span>Filter: {timeFilter === "today" ? "24 Jam Terakhir" : timeFilter === "7days" ? "7 Hari" : "30 Hari"}</span>
        </div>
      </div>

      {selectedLog && <JsonInspectorModal data={selectedLog} onClose={() => setSelectedLog(null)} title="Inspect Audit Log Detail" />}
    </div>
  );
}
