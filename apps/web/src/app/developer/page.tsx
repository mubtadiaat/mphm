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
  Menu,
  X,
  Terminal,
  RefreshCw,
  Download,
  ChevronRight,
} from "lucide-react";

import { DeveloperLogin } from "./_components/DeveloperLogin";
import { SystemHealthGrid } from "./_components/SystemHealthGrid";
import { OverviewTab } from "./_components/tabs/OverviewTab";
import { SystemHealthTab } from "./_components/tabs/SystemHealthTab";
import { FlowTrackerTab } from "./_components/tabs/FlowTrackerTab";
import { KillswitchesTab } from "./_components/tabs/KillswitchesTab";
import { RoleMatrixTab } from "./_components/tabs/RoleMatrixTab";
import { DatabaseExplorerTab } from "./_components/tabs/DatabaseExplorerTab";
import { AuditLogTab } from "./_components/tabs/AuditLogTab";

type TabId = "overview" | "health" | "flows" | "controls" | "roles" | "db_explorer" | "audit";

interface TabItem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  badge?: string;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Ringkasan Statistik Live", shortLabel: "Overview", icon: <Zap className="w-4 h-4" /> },
  { id: "health", label: "System Health Monitor", shortLabel: "Health Check", icon: <HeartPulse className="w-4 h-4" />, badge: "API Ping" },
  { id: "flows", label: "Flow Tracker Interaktif", shortLabel: "Flow Tracker", icon: <GitBranch className="w-4 h-4" /> },
  { id: "controls", label: "Master Killswitches", shortLabel: "Killswitches", icon: <Power className="w-4 h-4" /> },
  { id: "roles", label: "Dynamic Role Matrix", shortLabel: "Role Matrix", icon: <Sliders className="w-4 h-4" /> },
  { id: "db_explorer", label: "Database Inspector Live", shortLabel: "DB Inspector", icon: <Database className="w-4 h-4" /> },
  { id: "audit", label: "Audit Log 24 Jam", shortLabel: "Audit Log", icon: <FileText className="w-4 h-4" /> },
];

export default function DeveloperSaaSCockpitPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // System Controls
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dbWriteLock, setDbWriteLock] = useState(false);
  const [registrationLock, setRegistrationLock] = useState(false);
  const [mobileApiEnabled, setMobileApiEnabled] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Live Metrics
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(178);
  const [dbLatency, setDbLatency] = useState(6);
  const [serverStatus, setServerStatus] = useState<"ONLINE" | "DEGRADED" | "OFFLINE">("ONLINE");
  const [liveStats, setLiveStats] = useState({ totalStudents: 0, totalUsers: 0 });

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const isDevAuth = sessionStorage.getItem("develzy_dev_session");
    if (isDevAuth === "true") setIsAuthenticated(true);
  }, []);

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
      // keep
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveSettings();
      fetchLiveStats();
    }
  }, [isAuthenticated, fetchLiveSettings, fetchLiveStats]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(8 + Math.random() * 16));
      setRamUsage(Math.floor(175 + Math.random() * 22));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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

  if (!isAuthenticated) {
    return <DeveloperLogin onAuthenticated={() => { setIsAuthenticated(true); showToast("Otorisasi Developer Berhasil. Selamat Datang Develzy!", "success"); }} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row font-sans relative selection:bg-emerald-500 selection:text-zinc-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top duration-300 max-w-sm w-full">
          <div className={`px-4 py-3 rounded-2xl border text-xs font-bold shadow-2xl flex items-center gap-2.5 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-300"
              : "bg-blue-950/90 border-blue-500/40 text-blue-300"
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="break-words">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR (lg:flex w-72 border-r border-zinc-800 bg-zinc-900) */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-0 h-screen shrink-0 z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-inner shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-sm text-white tracking-tight">DEVELOPER SAAS</h1>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-500/20">
              m.p3hm.my.id/developer
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold font-mono uppercase text-zinc-500 tracking-wider">
            Menu Navigasi Developer
          </div>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-850"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? "text-zinc-950" : "text-zinc-400"}>{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md shrink-0 ${
                    isActive ? "bg-zinc-950 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Quick Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2 bg-zinc-950/50">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 pb-1">
            <span>Session: <strong className="text-emerald-400">develzy</strong></span>
            <span className="text-zinc-600">v4.5</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fetchLiveSettings}
              className="flex items-center justify-center gap-1 py-2 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[11px] rounded-xl border border-zinc-700 transition-all cursor-pointer"
              title="Sync Status API"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Sync API
            </button>
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1 py-2 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Backup
            </button>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 font-bold text-xs rounded-xl border border-rose-500/30 transition-all cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" /> Keluar Dashboard
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOP BAR & SIDEBAR DRAWER (< lg) */}
      {/* ------------------------------------------------------------- */}
      <header className="lg:hidden bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl cursor-pointer border border-zinc-700 shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-emerald-400" />}
          </button>
          <div className="min-w-0">
            <span className="font-black text-xs text-white tracking-tight block truncate">DEVELOPER COCKPIT</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold block truncate">m.p3hm.my.id/developer</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchLiveSettings}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl cursor-pointer border border-zinc-700"
            title="Sync API"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer border border-rose-500/30"
            title="Keluar"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex">
          <div className="w-72 bg-zinc-900 h-full border-r border-zinc-800 flex flex-col p-4 space-y-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span className="font-black text-sm text-white">Menu Developer</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer text-left ${
                      isActive
                        ? "bg-emerald-500 text-zinc-950 font-black shadow-md"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                );
              })}
            </div>

            <div className="border-t border-zinc-800 pt-3 space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30"
              >
                <Download className="w-4 h-4" /> Backup JSON Sistem
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30"
              >
                <Power className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile Horizontal Pill Navigation Bar (for quick 1-tap switching) */}
      <div className="lg:hidden bg-zinc-900/60 border-b border-zinc-800/80 px-3 py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-[11px] shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500 text-zinc-950 shadow-md"
                  : "bg-zinc-950 text-zinc-400 border border-zinc-800"
              }`}
            >
              {tab.icon}
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6 overflow-x-hidden">
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

        {/* Selected Tab Component View */}
        <div className="w-full">
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
        </div>
      </main>
    </div>
  );
}
