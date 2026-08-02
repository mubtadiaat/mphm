"use client";
import React, { useState } from "react";
import { Activity, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Copy, Check, Code, Share2 } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { JsonInspectorModal } from "../shared/JsonInspectorModal";

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
  { endpoint: "/api/assessment/matrix?classId=default", method: "GET", label: "Matriks Penilaian Kwartal", module: "Assessment" },
  { endpoint: "/api/assessment/scores?classId=default", method: "GET", label: "Daftar Nilai Santri", module: "Assessment" },
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedErrorDetail, setSelectedErrorDetail] = useState<any | null>(null);

  const runHealthCheck = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    // Auto-renew session cookie for developer before running health check
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "develzy", password: "develzy25" }),
      });
    } catch {
      // ignore
    }

    // Dynamically fetch real active classId from DB for assessment endpoints
    let realClassId = "default";
    try {
      const classRes = await fetch("/api/admin/classes");
      if (classRes.ok) {
        const classJson = await classRes.json();
        const classes = Array.isArray(classJson.data) ? classJson.data : Array.isArray(classJson) ? classJson : [];
        if (classes.length > 0 && classes[0].id) {
          realClassId = classes[0].id;
        }
      }
    } catch {
      // fallback
    }

    const allResults: EndpointResult[] = [];

    for (let i = 0; i < ENDPOINTS_TO_CHECK.length; i++) {
      const ep = ENDPOINTS_TO_CHECK[i];
      let targetEndpoint = ep.endpoint;

      // Replace dummy classId with real active classId if available
      if (targetEndpoint.includes("classId=default")) {
        targetEndpoint = targetEndpoint.replace("classId=default", `classId=${realClassId}`);
      }

      const start = performance.now();
      let status: number | null = null;
      let error: string | null = null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(targetEndpoint, { signal: controller.signal });
        clearTimeout(timeout);
        status = res.status;
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          error = body || `HTTP ${res.status} ${res.statusText}`;
        }
      } catch (err: any) {
        status = null;
        error = err?.name === "AbortError" ? "Timeout (>8s)" : (err?.message || "Network Error");
      }

      const latency = Math.round(performance.now() - start);
      allResults.push({ ...ep, endpoint: targetEndpoint, status, latency, error });
      setResults([...allResults]);
      setProgress(Math.round(((i + 1) / ENDPOINTS_TO_CHECK.length) * 100));
    }

    setIsRunning(false);
  };

  const copyRowError = (row: EndpointResult, idx: number) => {
    const textToCopy = `[${row.status ?? "ERR"}] ${row.method} ${row.endpoint} (${row.label})\nError Details: ${row.error || "No error details"}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const copyAllErrors = () => {
    const errorRows = results.filter((r) => r.error || (r.status !== null && r.status >= 400));
    if (errorRows.length === 0) return;

    const formattedLog = errorRows.map((r, i) => 
      `${i + 1}. [HTTP ${r.status ?? "ERR"}] ${r.method} ${r.endpoint} (${r.label}) - ${r.module}\n   Details: ${r.error || "Unknown Error"}`
    ).join("\n\n");

    const header = `=== SYSTEM HEALTH ERROR LOG (${new Date().toLocaleString("id-ID")}) ===\nTotal Errors Found: ${errorRows.length}\n\n`;
    navigator.clipboard.writeText(header + formattedLog);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const healthy = results.filter((r) => r.status !== null && r.status >= 200 && r.status < 400).length;
  const warnings = results.filter((r) => r.status !== null && r.status >= 400 && r.status < 500).length;
  const errors = results.filter((r) => r.status === null || r.status >= 500).length;
  const errorCount = results.filter((r) => r.error || (r.status !== null && r.status >= 400)).length;

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 shrink-0" /> System Health Monitor — Endpoint API Checker
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Periksa status kesehatan seluruh {ENDPOINTS_TO_CHECK.length} endpoint API sistem secara real-time.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {errorCount > 0 && (
              <button
                type="button"
                onClick={copyAllErrors}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                title="Salin Seluruh Pesan Error ke Clipboard"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAll ? "Terfoto/Tercopy!" : `Copy All Errors (${errorCount})`}</span>
              </button>
            )}

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
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div className="bg-cyan-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Summary */}
        {results.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status="ok" label={`${healthy} Sehat`} />
              {warnings > 0 && <StatusBadge status="warning" label={`${warnings} Auth/Forbidden`} />}
              {errors > 0 && <StatusBadge status="error" label={`${errors} Error / Timeout`} />}
              <span className="text-xs text-zinc-400 font-mono">Total: {results.length}/{ENDPOINTS_TO_CHECK.length}</span>
            </div>

            {errorCount > 0 && (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Ditemukan {errorCount} endpoint bermasalah (Klik tombol Copy untuk salin pesan error)
              </span>
            )}
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Latency</th>
                  <th className="py-3 px-4">Error Log</th>
                  <th className="py-3 px-4 text-center">Salin Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-mono">
                {results.map((r, idx) => {
                  const isOk = r.status !== null && r.status >= 200 && r.status < 400;
                  const isWarn = r.status !== null && r.status >= 400 && r.status < 500;
                  const isCopied = copiedIndex === idx;

                  return (
                    <tr key={idx} className={`hover:bg-zinc-900/60 transition-colors ${!isOk && !isWarn ? "bg-rose-950/15" : isWarn ? "bg-amber-950/10" : ""}`}>
                      <td className="py-3 px-4 font-bold text-zinc-600">{idx + 1}</td>
                      <td className="py-3 px-4">
                        {isOk ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {r.status}</span>
                        ) : isWarn ? (
                          <span className="flex items-center gap-1 text-amber-400 font-bold"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {r.status}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 font-bold"><XCircle className="w-3.5 h-3.5 shrink-0" /> {r.status ?? "ERR"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-400 text-[10px] font-bold">{r.module}</span></td>
                      <td className="py-3 px-4 text-zinc-400">{r.method} {r.endpoint}</td>
                      <td className="py-3 px-4 font-sans text-zinc-300">{r.label}</td>
                      <td className="py-3 px-4 text-right text-zinc-400">{r.latency != null ? `${r.latency}ms` : "-"}</td>
                      <td className="py-3 px-4 max-w-xs">
                        {r.error ? (
                          <div 
                            onClick={() => setSelectedErrorDetail(r)}
                            className="text-rose-400 font-mono text-[11px] truncate cursor-pointer hover:underline flex items-center gap-1"
                            title="Klik untuk inspect & salin log error lengkap"
                          >
                            <Code className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{r.error}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.error ? (
                          <button
                            type="button"
                            onClick={() => copyRowError(r, idx)}
                            className={`px-2.5 py-1 rounded-lg font-sans text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto border ${
                              isCopied
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                            }`}
                            title="Salin Error Endpoint Ini"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? "Tercopy!" : "Copy Error"}</span>
                          </button>
                        ) : (
                          <span className="text-zinc-700 text-[10px]">-</span>
                        )}
                      </td>
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
            <p className="text-sm font-bold text-center">Klik &quot;Run Health Check&quot; untuk memeriksa status seluruh endpoint API</p>
            <p className="text-xs text-zinc-600 text-center">Sistem akan menguji {ENDPOINTS_TO_CHECK.length} endpoint satu per satu</p>
          </div>
        )}
      </div>

      {/* Inspect Error Modal */}
      {selectedErrorDetail && (
        <JsonInspectorModal
          data={{
            endpoint: selectedErrorDetail.endpoint,
            method: selectedErrorDetail.method,
            status: selectedErrorDetail.status,
            latencyMs: selectedErrorDetail.latency,
            module: selectedErrorDetail.module,
            errorMessage: selectedErrorDetail.error,
            timestamp: new Date().toISOString()
          }}
          onClose={() => setSelectedErrorDetail(null)}
          title={`Error Inspection: ${selectedErrorDetail.endpoint}`}
        />
      )}
    </div>
  );
}
