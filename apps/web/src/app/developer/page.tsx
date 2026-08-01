"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Power,
  Database,
  Sliders,
  CheckCircle2,
  GitBranch,
  FileText,
  Zap,
  HeartPulse,
} from "lucide-react";

import { DeveloperLogin } from "./_components/DeveloperLogin";
import { DeveloperNavbar } from "./_components/DeveloperNavbar";
import { SystemHealthGrid } from "./_components/SystemHealthGrid";
import { OverviewTab } from "./_components/tabs/OverviewTab";
import { SystemHealthTab } from "./_components/tabs/SystemHealthTab";
import { FlowTrackerTab } from "./_components/tabs/FlowTrackerTab";
import { KillswitchesTab } from "./_components/tabs/KillswitchesTab";
import { RoleMatrixTab } from "./_components/tabs/RoleMatrixTab";
import { DatabaseExplorerTab } from "./_components/tabs/DatabaseExplorerTab";
import { AuditLogTab } from "./_components/tabs/AuditLogTab";

type TabId = "overview" | "health" | "flows" | "controls" | "roles" | "db_explorer" | "audit";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Ringkasan Statistik Live", icon: <Zap className="w-4 h-4" /> },
  { id: "health", label: "System Health Monitor", icon: <HeartPulse className="w-4 h-4" /> },
  { id: "flows", label: "Flow Tracker Interaktif", icon: <GitBranch className="w-4 h-4" /> },
  { id: "controls", label: "Master Killswitches", icon: <Power className="w-4 h-4" /> },
  { id: "roles", label: "Dynamic Role Matrix", icon: <Sliders className="w-4 h-4" /> },
  { id: "db_explorer", label: "Database Inspector Live", icon: <Database className="w-4 h-4" /> },
  { id: "audit", label: "Audit Log 24 Jam", icon: <FileText className="w-4 h-4" /> },
];

export default function DeveloperSaaSCockpitPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // System Controls (Synced with Live API & DB)
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dbWriteLock, setDbWriteLock] = useState(false);
  const [registrationLock, setRegistrationLock] = useState(false);
  const [mobileApiEnabled, setMobileApiEnabled] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Live System Metrics
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(178);
  const [dbLatency, setDbLatency] = useState(6);
  const [serverStatus, setServerStatus] = useState<"ONLINE" | "DEGRADED" | "OFFLINE">("ONLINE");

  // Live Stats from API
  const [liveStats, setLiveStats] = useState({ totalStudents: 0, totalUsers: 0 });

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check Auth Session
  useEffect(() => {
    const isDevAuth = sessionStorage.getItem("develzy_dev_session");
    if (isDevAuth === "true") setIsAuthenticated(true);
  }, []);

  // Fetch Live Server Settings from DB
  const fetchLiveSettings = useCallback(async () => {
    try {
      const startTime = performance.now();
      const res = await fetch("/api/settings");
      const endTime = performance.now();
      setDbLatency(Math.round(endTime - startTime));

      if (res.ok) {
        const json = await res.json();
        const settings = json.data || {};
        setMaintenanceMode(settings.systemMaintenance === "true" || settings.systemMaintenance === true);
        setDbWriteLock(settings.dbWriteLock === "true" || settings.dbWriteLock === true);
        setRegistrationLock(settings.registrationLock === "true" || settings.registrationLock === true);
        setMobileApiEnabled(settings.mobileApiEnabled !== "false" && settings.mobileApiEnabled !== false);
        setServerStatus("ONLINE");
      }
    } catch {
      setServerStatus("DEGRADED");
    }
  }, []);

  // Fetch live stats
  const fetchLiveStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        const d = json.data || json;
        setLiveStats({
          totalStudents: d.totalStudents ?? 0,
          totalUsers: d.totalUsers ?? 0,
        });
      }
    } catch {
      // keep previous
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveSettings();
      fetchLiveStats();
    }
  }, [isAuthenticated, fetchLiveSettings, fetchLiveStats]);

  // Simulated System Telemetry
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(8 + Math.random() * 16));
      setRamUsage(Math.floor(175 + Math.random() * 22));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Save Setting to Live DB
  const saveSettingToLiveDb = async (settingKey: string, valueKeyInSettings: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(settingKey, String(value));
    localStorage.setItem(valueKeyInSettings, String(value));
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [valueKeyInSettings]: String(value) }),
      });
      if (res.ok) {
        showToast(`Parameter '${valueKeyInSettings}' 100% diperbarui di Database Server! (${value ? "AKTIF/LOCKED" : "NONAKTIF/NORMAL"})`, "success");
      } else {
        showToast(`Parameter '${valueKeyInSettings}' disimpan lokal (API Server merespon lambat).`, "info");
      }
    } catch {
      showToast(`Mode offline. Parameter '${valueKeyInSettings}' tersimpan di local storage.`, "info");
    }
  };

  // Export DB Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      app: "MPHM & P3HM Lirboyo SaaS Management System",
      exportDate: new Date().toISOString(),
      developer: "develzy",
      serverStatus: { status: serverStatus, latencyMs: dbLatency, cpuUsagePercent: cpuUsage, ramUsageMB: ramUsage },
      settings: { systemMaintenance: maintenanceMode, dbWriteLock, registrationLock, mobileApiEnabled },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPHM_SAAS_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Berkas Backup JSON Sistem berhasil didownload!", "success");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("develzy_dev_session");
    setIsAuthenticated(false);
  };

  // Login Screen
  if (!isAuthenticated) {
    return <DeveloperLogin onAuthenticated={() => { setIsAuthenticated(true); showToast("Otorisasi Developer Berhasil. Selamat Datang Develzy!", "success"); }} />;
  }

  // Authenticated Dashboard
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className={`px-4 py-3 rounded-2xl border text-xs font-bold shadow-2xl flex items-center gap-2.5 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-300"
              : "bg-blue-950/90 border-blue-500/40 text-blue-300"
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <DeveloperNavbar onSyncApi={fetchLiveSettings} onExportBackup={handleExportBackup} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Status Grid */}
        <SystemHealthGrid
          serverStatus={serverStatus}
          dbLatency={dbLatency}
          cpuUsage={cpuUsage}
          ramUsage={ramUsage}
          maintenanceMode={maintenanceMode}
          dbWriteLock={dbWriteLock}
          liveStats={liveStats}
        />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-zinc-950 shadow-md"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "health" && <SystemHealthTab />}
        {activeTab === "flows" && <FlowTrackerTab />}
        {activeTab === "controls" && (
          <KillswitchesTab
            maintenanceMode={maintenanceMode}
            dbWriteLock={dbWriteLock}
            registrationLock={registrationLock}
            mobileApiEnabled={mobileApiEnabled}
            onToggle={saveSettingToLiveDb}
            setMaintenanceMode={setMaintenanceMode}
            setDbWriteLock={setDbWriteLock}
            setRegistrationLock={setRegistrationLock}
            setMobileApiEnabled={setMobileApiEnabled}
          />
        )}
        {activeTab === "roles" && <RoleMatrixTab />}
        {activeTab === "db_explorer" && <DatabaseExplorerTab />}
        {activeTab === "audit" && <AuditLogTab />}
      </main>
    </div>
  );
}
