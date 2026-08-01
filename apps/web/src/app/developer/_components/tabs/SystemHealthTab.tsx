"use client";
import React, { useState } from "react";
import { Activity, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";

interface EndpointResult {
  endpoint: string;
  method: string;
  label: string;
  module: string;
  status: number | null;
  latency: number | null;
  error: string | null;
}

const ENDPOINTS_TO_CHECK: Omit<EndpointResult, "status" | "latency" | "error">[] = [
  { endpoint: "/api/settings", method: "GET", label: "Konfigurasi Sistem", module: "Settings" },
  { endpoint: "/api/admin/dashboard/stats", method: "GET", label: "Dashboard Statistik", module: "Dashboard" },
  { endpoint: "/api/admin/people", method: "GET", label: "Data People (Santriwati & Pengurus)", module: "People" },
  { endpoint: "/api/admin/rooms", method: "GET", label: "Data Asrama (Blok & Kamar)", module: "Rooms" },
  { endpoint: "/api/admin/users", method: "GET", label: "Data Akun Users", module: "Users" },
  { endpoint: "/api/admin/subjects", method: "GET", label: "Master Mata Pelajaran", module: "Kurikulum" },
  { endpoint: "/api/admin/classes", method: "GET", label: "Data Rombel / Kelas", module: "Academic" },
  { endpoint: "/api/academic/years", method: "GET", label: "Tahun Ajaran", module: "Academic" },
  { endpoint: "/api/academic/classes", method: "GET", label: "Kelas Akademik", module: "Academic" },
  { endpoint: "/api/assessment/matrix", method: "GET", label: "Matriks Penilaian Kwartal", module: "Assessment" },
  { endpoint: "/api/assessment/scores", method: "GET", label: "Daftar Nilai Santri", module: "Assessment" },
  { endpoint: "/api/disciplinary/violations", method: "GET", label: "Data Pelanggaran Santri", module: "Disciplinary" },
  { endpoint: "/api/disciplinary/permits", method: "GET", label: "Data Perizinan Santri", module: "Disciplinary" },
  { endpoint: "/api/admin/audit-log", method: "GET", label: "Audit Log Aktivitas", module: "Audit" },
  { endpoint: "/api/admin/recycle-bin", method: "GET", label: "Recycling Bin", module: "System" },
  { endpoint: "/api/admin/onboarding/status", method: "GET", label: "Onboarding Status", module: "System" },
  { endpoint: "/api/admin/telemetry", method: "GET", label: "Telemetry & Versi DB", module: "System" },
  { endpoint: "/api/admin/violations/types", method: "GET", label: "Master Jenis Pelanggaran", module: "Disciplinary" },
  { endpoint: "/api/admin/violations/categories", method: "GET", label: "Kategori Pelanggaran", module: "Disciplinary" },
  { endpoint: "/api/admin/violations/severities", method: "GET", label: "Tingkat Keparahan", module: "Disciplinary" },
  { endpoint: "/api/auth/me", method: "GET", label: "Sesi Autentikasi", module: "Auth" },
  { endpoint: "/api/download/releases", method: "GET", label: "Rilis Download", module: "Download" },
  { endpoint: "/api/guardian/stats", method: "GET", label: "Statistik Wali Santri", module: "Guardian" },
  { endpoint: "/api/mustahiq/dashboard/stats", method: "GET", label: "Statistik Mustahiq", module: "Mustahiq" },
];

export function SystemHealthTab() {
  const [results, setResults] = useState<EndpointResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runHealthCheck = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const allResults: EndpointResult[] = [];

    for (let i = 0; i < ENDPOINTS_TO_CHECK.length; i++) {
      const ep = ENDPOINTS_TO_CHECK[i];
      const start = performance.now();
      let status: number | null = null;
      let error: string | null = null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(ep.endpoint, { signal: controller.signal });
        clearTimeout(timeout);
        status = res.status;
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          error = body.slice(0, 200);
        }
      } catch (err: any) {
        status = null;
        error = err?.name === "AbortError" ? "Timeout (>8s)" : (err?.message || "Network Error");
      }

      const latency = Math.round(performance.now() - start);
      allResults.push({ ...ep, status, latency, error });
      setResults([...allResults]);
      setProgress(Math.round(((i + 1) / ENDPOINTS_TO_CHECK.length) * 100));
    }

    setIsRunning(false);
  };

  const healthy = results.filter((r) => r.status !== null && r.status >= 200 && r.status < 400).length;
  const warnings = results.filter((r) => r.status !== null && r.status >= 400 && r.status < 500).length;
  const errors = results.filter((r) => r.status === null || r.status >= 500).length;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> System Health Monitor — Endpoint API Checker
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Periksa status kesehatan seluruh {ENDPOINTS_TO_CHECK.length} endpoint API sistem secara real-time.
            </p>
          </div>
          <button
            type="button"
            onClick={runHealthCheck}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? `Checking... ${progress}%` : "Run Health Check"}
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div className="bg-cyan-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Summary */}
        {results.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="ok" label={`${healthy} Sehat`} />
            {warnings > 0 && <StatusBadge status="warning" label={`${warnings} Auth/Forbidden`} />}
            {errors > 0 && <StatusBadge status="error" label={`${errors} Error / Timeout`} />}
            <span className="text-xs text-zinc-500 font-mono flex items-center">Total: {results.length}/{ENDPOINTS_TO_CHECK.length}</span>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Latency</th>
                  <th className="py-3 px-4">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-mono">
                {results.map((r, idx) => {
                  const isOk = r.status !== null && r.status >= 200 && r.status < 400;
                  const isWarn = r.status !== null && r.status >= 400 && r.status < 500;
                  return (
                    <tr key={idx} className={`hover:bg-zinc-900/50 transition-colors ${!isOk && !isWarn ? "bg-rose-950/10" : ""}`}>
                      <td className="py-3 px-4 font-bold text-zinc-600">{idx + 1}</td>
                      <td className="py-3 px-4">
                        {isOk ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> {r.status}</span>
                        ) : isWarn ? (
                          <span className="flex items-center gap-1 text-amber-400 font-bold"><AlertTriangle className="w-3.5 h-3.5" /> {r.status}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 font-bold"><XCircle className="w-3.5 h-3.5" /> {r.status ?? "ERR"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-400 text-[10px] font-bold">{r.module}</span></td>
                      <td className="py-3 px-4 text-zinc-400">{r.method} {r.endpoint}</td>
                      <td className="py-3 px-4 font-sans text-zinc-300">{r.label}</td>
                      <td className="py-3 px-4 text-right text-zinc-400">{r.latency != null ? `${r.latency}ms` : "-"}</td>
                      <td className="py-3 px-4 text-rose-400 max-w-xs truncate">{r.error || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500 space-y-3">
            <Activity className="w-12 h-12 text-zinc-700" />
            <p className="text-sm font-bold">Klik &quot;Run Health Check&quot; untuk memeriksa status seluruh endpoint API</p>
            <p className="text-xs text-zinc-600">Sistem akan menguji {ENDPOINTS_TO_CHECK.length} endpoint satu per satu</p>
          </div>
        )}
      </div>
    </div>
  );
}
