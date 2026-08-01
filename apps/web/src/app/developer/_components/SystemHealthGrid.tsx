"use client";
import React from "react";
import { Radio, Cpu, Users, ShieldAlert } from "lucide-react";

interface SystemHealthGridProps {
  serverStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
  dbLatency: number;
  cpuUsage: number;
  ramUsage: number;
  maintenanceMode: boolean;
  dbWriteLock: boolean;
  liveStats: {
    totalStudents: number;
    totalUsers: number;
  };
}

export function SystemHealthGrid({
  serverStatus,
  dbLatency,
  cpuUsage,
  ramUsage,
  maintenanceMode,
  dbWriteLock,
  liveStats,
}: SystemHealthGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status 1: Server Connectivity */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <span>Server & Gateway Status</span>
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-black ${serverStatus === "ONLINE" ? "text-emerald-400" : serverStatus === "DEGRADED" ? "text-amber-400" : "text-rose-400"}`}>
            {serverStatus}
          </span>
          <span className="text-xs text-zinc-400 font-mono">Ping: {dbLatency}ms</span>
        </div>
        <p className="text-[11px] text-zinc-500">PostgreSQL / Prisma Engine Live Connected</p>
      </div>

      {/* Status 2: Memory & CPU */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <span>CPU & Heap Memory</span>
          <Cpu className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{cpuUsage}%</span>
          <span className="text-xs text-zinc-400 font-mono">Heap: {ramUsage} MB</span>
        </div>
        <p className="text-[11px] text-zinc-500">V8 Next.js Edge Runtime Allocated</p>
      </div>

      {/* Status 3: Database Entity Counts */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <span>Total Santriwati & Users</span>
          <Users className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{liveStats.totalStudents.toLocaleString("id-ID")}</span>
          <span className="text-xs text-zinc-400 font-mono">Acc: {liveStats.totalUsers}</span>
        </div>
        <p className="text-[11px] text-zinc-500">Santriwati P3HM & Siswi MPHM Lirboyo</p>
      </div>

      {/* Status 4: Global Maintenance Lock */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 shadow-md hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <span>Status Pemeliharaan</span>
          <ShieldAlert className={`w-4 h-4 ${maintenanceMode ? "text-rose-400" : "text-emerald-400"}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-black ${maintenanceMode ? "text-rose-400" : "text-emerald-400"}`}>
            {maintenanceMode ? "TERKUNCI" : "NORMAL"}
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            {dbWriteLock ? "READ-ONLY" : "FULL-RW"}
          </span>
        </div>
        <p className="text-[11px] text-zinc-500">
          {maintenanceMode ? "Akses publik & wali dikunci" : "Seluruh modul berjalan normal"}
        </p>
      </div>
    </div>
  );
}
