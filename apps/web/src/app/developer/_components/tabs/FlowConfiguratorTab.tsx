"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GitBranch, Save, Lock, CheckCircle2, AlertTriangle, Shield, RefreshCw } from "lucide-react";

interface FlowConfig {
  id: string;
  name: string;
  module: string;
  keyStatus: string;
  keyMessage: string;
  defaultStatus: "ACTIVE" | "LOCKED" | "MAINTENANCE";
  description: string;
  targetRoutes: string[];
}

const FLOW_DEFINITIONS: FlowConfig[] = [
  {
    id: "pull_pondok",
    name: "Alur Tarik Data Santriwati Pondok → Madrasah",
    module: "Santriwati (P3HM/MPHM)",
    keyStatus: "flow_pull_pondok_status",
    keyMessage: "flow_pull_pondok_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol tombol & proses penarikan data santriwati dari Pondok Pesantren P3HM ke Diniyyah MPHM.",
    targetRoutes: ["/sekretariat/santri", "/api/academic/pull-pondok"],
  },
  {
    id: "assessment",
    name: "Alur Engine Penilaian Kwartal & Lock Nilai",
    module: "Akademik & Penilaian",
    keyStatus: "flow_assessment_status",
    keyMessage: "flow_assessment_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol pengisian nilai kwartal oleh Mustahiq dan fitur penguncian nilai kwartal.",
    targetRoutes: ["/mustahiq/penilaian", "/sekretariat/penilaian", "/api/assessment/scores"],
  },
  {
    id: "promotion",
    name: "Alur Kenaikan Kelas Masal & Roll-over",
    module: "Akademik & Promosi",
    keyStatus: "flow_promotion_status",
    keyMessage: "flow_promotion_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol eksekusi kenaikan kelas 1-Klik dan pemindahan rombel santriwati.",
    targetRoutes: ["/sekretariat/kenaikan-kelas", "/api/promotion/execute"],
  },
  {
    id: "permits",
    name: "Alur Perizinan Santri & Validasi Pos Keamanan",
    module: "Kedisiplinan & Perizinan",
    keyStatus: "flow_permits_status",
    keyMessage: "flow_permits_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol penerbitan izin keluar/pulang/sambangan dan validasi petugas keamanan.",
    targetRoutes: ["/sekretariat/perizinan", "/keamanan/perizinan", "/api/disciplinary/permits"],
  },
  {
    id: "violations",
    name: "Alur Pencatatan Pelanggaran & Poin Takzir",
    module: "Kedisiplinan & Takzir",
    keyStatus: "flow_violations_status",
    keyMessage: "flow_violations_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol pencatatan poin takzir pelanggaran santriwati dan perhitungan sanksi.",
    targetRoutes: ["/sekretariat/pelanggaran", "/api/disciplinary/violations"],
  },
  {
    id: "rooms",
    name: "Alur Penempatan Asrama Blok & Kamar Mukim",
    module: "Keasramaan (Rooms)",
    keyStatus: "flow_rooms_status",
    keyMessage: "flow_rooms_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol pengelolaan data blok, kamar, dan penempatan santriwati mukim.",
    targetRoutes: ["/sekretariat/rooms", "/api/admin/rooms"],
  },
  {
    id: "curriculum",
    name: "Alur Manajemen Kurikulum & Master Mapel",
    module: "Kurikulum Diniyyah",
    keyStatus: "flow_curriculum_status",
    keyMessage: "flow_curriculum_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol master mata pelajaran diniyyah per jenjang kelas.",
    targetRoutes: ["/sekretariat/kurikulum", "/api/admin/subjects"],
  },
  {
    id: "guardians",
    name: "Alur Smart KK Mapping & Portal Wali Santri",
    module: "Wali Santri",
    keyStatus: "flow_guardians_status",
    keyMessage: "flow_guardians_msg",
    defaultStatus: "ACTIVE",
    description: "Mengontrol pemetaan keluarga Smart KK dan portal pemantauan orang tua.",
    targetRoutes: ["/sekretariat/wali-santri", "/guardian", "/api/guardian/children"],
  },
];

export function FlowConfiguratorTab() {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchFlowSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        const settings = json.data || {};
        const newStatuses: Record<string, string> = {};
        const newMessages: Record<string, string> = {};

        FLOW_DEFINITIONS.forEach((f) => {
          newStatuses[f.id] = settings[f.keyStatus] || f.defaultStatus;
          newMessages[f.id] = settings[f.keyMessage] || "";
        });

        setStatuses(newStatuses);
        setMessages(newMessages);
      }
    } catch {
      // keep fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlowSettings();
  }, [fetchFlowSettings]);

  const saveFlowConfig = async (flow: FlowConfig) => {
    const statusVal = statuses[flow.id] || flow.defaultStatus;
    const msgVal = messages[flow.id] || "";

    setSavingId(flow.id);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [flow.keyStatus]: statusVal,
          [flow.keyMessage]: msgVal,
        }),
      });

      if (res.ok) {
        setToastMessage(`Konfigurasi alur '${flow.name}' berhasil disimpan ke Database Server!`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch {
      setToastMessage(`Gagal menyimpan alur '${flow.name}' ke Database.`);
      setTimeout(() => setToastMessage(null), 3500);
    } fontId: setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-emerald-400 shrink-0" /> Pengatur Alur Sistem Manual (Real-Time DB Persistence)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Atur status pengoperasian setiap alur sistem secara langsung di Database. Pengaturan ini langsung mengendalikan tombol & fitur di website.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchFlowSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-700 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} /> Refresh Settings
          </button>
        </div>

        {toastMessage && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Flow Cards List */}
        <div className="space-y-4">
          {FLOW_DEFINITIONS.map((flow) => {
            const currentStatus = statuses[flow.id] || flow.defaultStatus;
            const currentMsg = messages[flow.id] || "";
            const isSaving = savingId === flow.id;

            return (
              <div key={flow.id} className="p-4 sm:p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 hover:border-zinc-700 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-white">{flow.name}</span>
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[10px] font-bold rounded-md">
                        {flow.module}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{flow.description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-zinc-500">Rute Terikat:</span>
                      {flow.targetRoutes.map((r, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status Selector Switch */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setStatuses({ ...statuses, [flow.id]: "ACTIVE" })}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                        currentStatus === "ACTIVE"
                          ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      🟢 AKTIF
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatuses({ ...statuses, [flow.id]: "LOCKED" })}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                        currentStatus === "LOCKED"
                          ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      🟡 DIBATASI
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatuses({ ...statuses, [flow.id]: "MAINTENANCE" })}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                        currentStatus === "MAINTENANCE"
                          ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      🔴 MAINTENANCE
                    </button>
                  </div>
                </div>

                {/* Custom Notice Message for non-active statuses */}
                {currentStatus !== "ACTIVE" && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Pesan Peringatan Kustom untuk Pengguna Saat Mengakses Alur Ini:
                    </label>
                    <input
                      type="text"
                      placeholder={`Contoh: Fitur ${flow.name} sedang ditutup sementara oleh developer.`}
                      value={currentMsg}
                      onChange={(e) => setMessages({ ...messages, [flow.id]: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}

                {/* Save Button per Flow */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => saveFlowConfig(flow)}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? "Menyimpan ke DB..." : "Simpan Status Alur ini ke Database"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
