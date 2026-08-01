"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Activity, 
  ShieldAlert, 
  Database, 
  Lock, 
  Unlock, 
  Power, 
  Cpu, 
  HardDrive, 
  RefreshCw, 
  Sliders, 
  Users, 
  FileText, 
  Trash2, 
  Download, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Key, 
  User, 
  Eye, 
  EyeOff, 
  Server,
  Layers
} from "lucide-react";
import { CustomRoleMatrixManager } from "@/components/shared/CustomRoleMatrixManager";

export default function DeveloperSaaSCockpitPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "controls" | "roles" | "db_explorer" | "audit">("overview");

  // System Controls & Switches
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dbWriteLock, setDbWriteLock] = useState(false);
  const [registrationLock, setRegistrationLock] = useState(false);
  const [apiFirewall, setApiFirewall] = useState(true);
  const [mobileApiEnabled, setMobileApiEnabled] = useState(true);
  const [aiAssistantSync, setAiAssistantSync] = useState(true);

  // Live Metrics state
  const [cpuUsage, setCpuUsage] = useState(14);
  const [ramUsage, setRamUsage] = useState(184);
  const [dbLatency, setDbLatency] = useState(8);
  const [selectedTable, setSelectedTable] = useState("santri");
  const [rawDbData, setRawDbData] = useState<any[]>([]);

  // Check auth session
  useEffect(() => {
    const isDevAuth = sessionStorage.getItem("develzy_dev_session");
    if (isDevAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load saved killswitches
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMaintenanceMode(localStorage.getItem("dev_maintenance") === "true");
      setDbWriteLock(localStorage.getItem("dev_db_writelock") === "true");
      setRegistrationLock(localStorage.getItem("dev_reg_lock") === "true");
      setApiFirewall(localStorage.getItem("dev_firewall") !== "false");
      setMobileApiEnabled(localStorage.getItem("dev_mobile_api") !== "false");
      setAiAssistantSync(localStorage.getItem("dev_ai_sync") !== "false");
    }
  }, []);

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "develzy" && password === "develzy25") {
      sessionStorage.setItem("develzy_dev_session", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Kredensial developer salah! Cek username dan password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("develzy_dev_session");
    setIsAuthenticated(false);
  };

  // Toggle Killswitches
  const toggleSwitch = (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    localStorage.setItem(key, String(val));
  };

  // Simulated metrics fluctuation
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(10 + Math.random() * 18));
      setRamUsage(Math.floor(180 + Math.random() * 25));
      setDbLatency(Math.floor(6 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Load raw data for database explorer
  useEffect(() => {
    if (!isAuthenticated) return;
    if (selectedTable === "santri") {
      setRawDbData([
        { id: "SANTRI-001", name: "Siti Maryam", class: "3 Ula Diniyyah", room: "Fatimah 02", status: "ACTIVE", type: "PONDOK_MUBTADIAAT" },
        { id: "SANTRI-002", name: "Khadijah Az-Zahra", class: "2 Wustho Diniyyah", room: "Aisyah 01", status: "ACTIVE", type: "UNIT_LAIN" },
        { id: "SANTRI-003", name: "Zainab Al-Ghazali", class: "1 Ulya Diniyyah", room: "Khadijah 04", status: "ACTIVE", type: "PONDOK_MUBTADIAAT" },
      ]);
    } else if (selectedTable === "pengurus") {
      setRawDbData([
        { id: "PENGURUS-001", name: "Ning Hj. Hamidah", role: "Ketua Pengurus Pondok", institution: "P3HM Lirboyo", phone: "+6281234567890" },
        { id: "PENGURUS-002", name: "Ustadz Ahmad Mudrik", role: "Mustahiq Utama", institution: "MPHM Lirboyo", phone: "+6281987654321" },
      ]);
    } else if (selectedTable === "users") {
      setRawDbData([
        { id: "USR-001", username: "sekretariat_pondok", role: "sek.pondok", status: "ACTIVE", lastLogin: "2026-08-01 16:10" },
        { id: "USR-002", username: "sekretariat_madrasah", role: "sek.madrasah", status: "ACTIVE", lastLogin: "2026-08-01 15:45" },
        { id: "USR-003", username: "develzy", role: "DEVELOPER_SAAS", status: "ACTIVE", lastLogin: "NOW" },
      ]);
    } else {
      setRawDbData([
        { timestamp: "2026-08-01 16:15:02", action: "UPDATE_ROLE_MATRIX", actor: "develzy", status: "SUCCESS" },
        { timestamp: "2026-08-01 15:58:14", action: "REMOVE_NON_MUKIM_OPTION", actor: "develzy", status: "SUCCESS" },
      ]);
    }
  }, [selectedTable, isAuthenticated]);

  // Export DB Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      app: "MPHM & P3HM Lirboyo Management System",
      exportDate: new Date().toISOString(),
      developer: "develzy",
      tables: {
        santriCount: 1450,
        pengurusCount: 84,
        usersCount: 120,
        settingsCount: 42
      },
      switches: {
        maintenanceMode,
        dbWriteLock,
        registrationLock,
        apiFirewall,
        mobileApiEnabled,
        aiAssistantSync
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPHM_SYSTEM_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Terminal className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase block">
              m.p3hm.my.id / developer
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">SaaS Developer Cockpit</h1>
            <p className="text-xs text-zinc-400">
              Portal Otorisasi Master Developer untuk Pengendalian System & Database 100%.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Username Developer</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="develzy"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-white placeholder-zinc-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Password Developer</label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-white placeholder-zinc-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer mt-2"
            >
              Masuk Dashboard Developer
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] text-zinc-600 font-mono">
              MPHM & P3HM Lirboyo Core SaaS v4.5 • System Control Engine
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Developer Authenticated Dashboard
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">DEVELOPER SAAS MASTER COCKPIT</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold rounded-md">
                100% FULL CONTROL
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">m.p3hm.my.id/developer • Logged as: develzy</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-zinc-700"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export DB Backup
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer border border-rose-500/30"
          >
            <Power className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* System Health Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>System Server Status</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">ONLINE</span>
              <span className="text-xs text-zinc-500 font-mono">Latency: {dbLatency}ms</span>
            </div>
            <p className="text-[11px] text-zinc-500">PostgreSQL / SQLite Database Connected</p>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>CPU & Node.js Memory</span>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{cpuUsage}%</span>
              <span className="text-xs text-zinc-400 font-mono">RAM: {ramUsage} MB</span>
            </div>
            <p className="text-[11px] text-zinc-500">V8 Heap Allocation Normal</p>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Santri & Users</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">1,450</span>
              <span className="text-xs text-zinc-400 font-mono">Users: 120</span>
            </div>
            <p className="text-[11px] text-zinc-500">Santriwati P3HM & Siswi MPHM</p>
          </div>

          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Global Lock Status</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${maintenanceMode ? "text-rose-400" : "text-emerald-400"}`}>
                {maintenanceMode ? "LOCKED" : "ACTIVE"}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {dbWriteLock ? "DB-RO" : "DB-RW"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Master Developer Controls</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" /> Ringkasan Master System
          </button>
          <button
            onClick={() => setActiveTab("controls")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "controls"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Power className="w-4 h-4" /> Master System Killswitches
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "roles"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" /> Dynamic Role & Matrix Manager
          </button>
          <button
            onClick={() => setActiveTab("db_explorer")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "db_explorer"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Database className="w-4 h-4" /> Database Inspector
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Status Arsitektur System & Database
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Seluruh pengoperasian sistem berada di bawah kendali penuh dashboard developer ini. Perubahan aturan peran, penguncian sistem, dan manajemen data akan langsung terefleksi ke seluruh modul aplikasi (Web Next.js, Sekretariat, Mustahiq, dan Mobile Client).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <span className="text-xs text-zinc-500 font-bold block">1. SINGLE SOURCE DATA PENGURUS</span>
                  <span className="text-sm font-bold text-emerald-400">P3HM Pondok Induk</span>
                  <p className="text-[11px] text-zinc-500">Madrasah (MPHM) hanya menarik data pengurus aktif.</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <span className="text-xs text-zinc-500 font-bold block">2. ATURAN MUKIM SANTRIWATI</span>
                  <span className="text-sm font-bold text-blue-400">100% Mukim Asrama</span>
                  <p className="text-[11px] text-zinc-500">Tidak ada opsi Non-Mukim / Kalong.</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <span className="text-xs text-zinc-500 font-bold block">3. DYNAMIC ROLE MATRIX</span>
                  <span className="text-sm font-bold text-purple-400">Granular Permission</span>
                  <p className="text-[11px] text-zinc-500">Mode CRUD, Read-Only, dan Cari-View per menu.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Killswitches & Controls */}
        {activeTab === "controls" && (
          <div className="space-y-6">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <Power className="w-5 h-5 text-rose-400" /> Master Sakelar Kunci System (100% Controls)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Aktifkan atau nonaktifkan sakelar darurat sistem secara instan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Maintenance Mode Switch */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-white block">Mode Maintenance Darurat</span>
                    <span className="text-xs text-zinc-500">Kunci seluruh aplikasi dari pengguna umum.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch("dev_maintenance", !maintenanceMode, setMaintenanceMode)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      maintenanceMode ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {maintenanceMode ? "LOCKED (ON)" : "OFF"}
                  </button>
                </div>

                {/* DB Write Lock Switch */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-white block">Database Write Lock (Read-Only)</span>
                    <span className="text-xs text-zinc-500">Cegah segala mutasi / perubahan data database.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch("dev_db_writelock", !dbWriteLock, setDbWriteLock)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      dbWriteLock ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {dbWriteLock ? "READ-ONLY (ON)" : "OFF"}
                  </button>
                </div>

                {/* Registration & Import Lock */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-white block">Kunci Pendaftaran & Impor Excel</span>
                    <span className="text-xs text-zinc-500">Blokir pendaftaran santri baru & impor massal.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch("dev_reg_lock", !registrationLock, setRegistrationLock)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      registrationLock ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {registrationLock ? "LOCKED (ON)" : "OFF"}
                  </button>
                </div>

                {/* Mobile API Switch */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-white block">API Mobile App (Android Guardian & Staff)</span>
                    <span className="text-xs text-zinc-500">Izinkan atau blokir sinkronisasi aplikasi mobile.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch("dev_mobile_api", !mobileApiEnabled, setMobileApiEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      mobileApiEnabled ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {mobileApiEnabled ? "ACTIVE (ON)" : "DISABLED"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dynamic Role & Capability Matrix Engine */}
        {activeTab === "roles" && (
          <CustomRoleMatrixManager />
        )}

        {/* Tab 4: Database Explorer */}
        {activeTab === "db_explorer" && (
          <div className="space-y-6">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" /> Database Inspector & Raw Data Viewer
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Inspeksi data tabel langsung dari database sistem.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">Pilih Tabel:</span>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 text-white rounded-xl text-xs font-bold"
                  >
                    <option value="santri">Table: santri (Siswi / Santriwati)</option>
                    <option value="pengurus">Table: pengurus (Pengurus Induk)</option>
                    <option value="users">Table: users (Credentials & Roles)</option>
                    <option value="audit_logs">Table: audit_logs (System Logs)</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-zinc-800 rounded-2xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
                    <tr>
                      {rawDbData.length > 0 && Object.keys(rawDbData[0]).map(key => (
                        <th key={key} className="py-3 px-4">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {rawDbData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-850/50">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="py-3 px-4 font-semibold">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
