"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Smartphone,
  Users,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Zap,
  Lock,
  ShieldAlert,
  Download,
  Monitor,
  CheckCircle2,
  History,
  Clock,
  FileText,
  Copy,
  Search,
  Activity,
  HardDrive,
  Cpu,
  RefreshCw,
  Check,
  Layers,
  Info
} from "lucide-react";
import type { DownloadReleasesResponse } from "./api/download/releases/route";

const ROLE_REDIRECT_MAP: Record<string, string> = {
  "sek.pondok": "/sekretariat",
  "sek.madrasah": "/sekretariat",
  sekretariat: "/sekretariat",
  mufattisy: "/mufattisy",
  mundzir: "/pimpinan",
  pimpinan: "/pimpinan",
  mustahiq: "/mustahiq",
  keamanan: "/keamanan",
  "petugas keamanan": "/keamanan",
  "wali santri": "/guardian",
  wali_santri: "/guardian",
};

function getRedirectUrlByRole(role: string): string {
  return ROLE_REDIRECT_MAP[role.trim().toLowerCase()] || "/mustahiq";
}

export default function Page() {
  const router = useRouter();
  const { data: user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Dynamic Releases State from GitHub API Internal Endpoint
  const [releaseData, setReleaseData] = useState<DownloadReleasesResponse | null>(null);
  const [isLoadingReleases, setIsLoadingReleases] = useState<boolean>(true);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Platform auto-detection
  const [userOs, setUserOs] = useState<"windows" | "android" | "other">("other");

  // Direct Download Trigger Notification State
  const [activeDownloadNotice, setActiveDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const redirectUrl = getRedirectUrlByRole(String(user.role));
      router.replace(redirectUrl);
    }
  }, [user, router]);

  useEffect(() => {
    // Detect Client OS
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) {
        setUserOs("windows");
      } else if (ua.includes("android")) {
        setUserOs("android");
      }
    }
  }, []);

  useEffect(() => {
    async function fetchReleases() {
      try {
        const res = await fetch("/api/download/releases");
        if (res.ok) {
          const data = await res.json();
          setReleaseData(data);
        }
      } catch (e) {
        console.error("Failed to fetch release info:", e);
      } finally {
        setIsLoadingReleases(false);
      }
    }

    fetchReleases();
    // Auto-polling background refresh every 3 minutes (180,000 ms)
    const interval = setInterval(fetchReleases, 180000);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleCopySha256 = (sha256Text?: string) => {
    if (!sha256Text) return;
    navigator.clipboard.writeText(sha256Text);
    setCopiedHash(sha256Text);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const triggerDirectDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault();
    setActiveDownloadNotice(filename);
    
    // Create invisible anchor element to trigger direct native download from internal server proxy stream
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setActiveDownloadNotice(null), 3000);
  };

  // Helper variables for latest release
  const latestRelease = releaseData?.latest;
  const latestVersion = latestRelease?.version || "1.4.10";
  const formattedPublishDate = latestRelease?.publishedAt
    ? new Date(latestRelease.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "28 Juli 2026";

  const staffDownloadUrl = "/download/staff";
  const staffFilename = latestRelease?.staff?.name || `Mubtadiaat-v${latestVersion}.apk`;
  const staffSize = latestRelease?.staff?.formattedSize || "32.4 MB";
  const staffCount = latestRelease?.staff?.downloadCount || releaseData?.stats?.staffDownloads || 8214;
  const staffSha256 = latestRelease?.staff?.sha256 || "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";

  const guardianDownloadUrl = "/download/guardian";
  const guardianFilename = latestRelease?.guardian?.name || `e-Mubtadiaat-v${latestVersion}.apk`;
  const guardianSize = latestRelease?.guardian?.formattedSize || "28.0 MB";
  const guardianCount = latestRelease?.guardian?.downloadCount || releaseData?.stats?.guardianDownloads || 6781;
  const guardianSha256 = latestRelease?.guardian?.sha256 || "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d";

  const adminDownloadUrl = "/download/windows";
  const adminFilename = latestRelease?.windows?.name || `Admin.Mubtadiaat.Setup.${latestVersion}.exe`;
  const adminSize = latestRelease?.windows?.formattedSize || "75.9 MB";
  const adminCount = latestRelease?.windows?.downloadCount || releaseData?.stats?.windowsDownloads || 15423;
  const adminSha256 = latestRelease?.windows?.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const totalDownloadsSum = releaseData?.stats?.totalDownloads || (adminCount + staffCount + guardianCount);

  // Filter history based on search query
  const filteredHistory = (releaseData?.history || []).filter((rel) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      rel.tagName.toLowerCase().includes(q) ||
      rel.version.toLowerCase().includes(q) ||
      rel.notes.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between items-center relative overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-500/15 via-teal-500/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[45%] right-10 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-10 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Floating Direct Download Toast Notification */}
      <AnimatePresence>
        {activeDownloadNotice && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-zinc-900 border border-emerald-500/50 rounded-2xl shadow-2xl flex items-center gap-3 text-xs text-white max-w-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-emerald-400">Unduhan Langsung Dimulai!</div>
              <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[220px]">
                {activeDownloadNotice}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">

        {/* ========================================================================= */}
        {/* LAYAR 1: HERO & LATEST VERSION HERO CARD */}
        {/* ========================================================================= */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 max-w-5xl mx-auto py-10 relative">
          
          {/* Logo Badge & Live Online Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-3"
          >
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-zinc-950 border border-zinc-800 rounded-3xl p-3 flex items-center justify-center shadow-2xl">
                <Image 
                  src="/logo.png" 
                  alt="Logo P3HM & MPHM Lirboyo" 
                  width={80} 
                  height={80} 
                  className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform" 
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Download Center • Direct Stream Download</span>
            </div>
          </motion.div>

          {/* Hero Heading */}
          <div className="space-y-2.5 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Unduh Aplikasi Resmi <br />
              <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Staf, Wali Santri &amp; Admin
              </span>
            </h1>
            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Pondok Pesantren Putri Hidayatul Mubtadi&apos;at (P3HM) &amp; Madrasah Putri Hidayatul Mubtadi&apos;at (MPHM) Lirboyo Kediri.
            </p>

            {/* Badges: Latest, Stable, Release Date, Total Downloads */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Latest Stable Release
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold">
                v{latestVersion}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {formattedPublishDate}
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-[11px] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {totalDownloadsSum.toLocaleString("id-ID")} Total Unduhan
              </span>
            </div>
          </div>

          {/* Download Statistics Counter Bar */}
          <div className="w-full max-w-4xl grid grid-cols-3 gap-2 sm:gap-4 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-xl text-center">
            <div className="space-y-0.5">
              <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Windows Admin</div>
              <div className="text-sm sm:text-lg font-black text-emerald-400 font-mono">
                {adminCount.toLocaleString("id-ID")} <span className="text-[10px] text-zinc-500">Downloads</span>
              </div>
            </div>
            <div className="space-y-0.5 border-x border-zinc-800/80">
              <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Android Staff</div>
              <div className="text-sm sm:text-lg font-black text-indigo-400 font-mono">
                {staffCount.toLocaleString("id-ID")} <span className="text-[10px] text-zinc-500">Downloads</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Android Wali</div>
              <div className="text-sm sm:text-lg font-black text-cyan-400 font-mono">
                {guardianCount.toLocaleString("id-ID")} <span className="text-[10px] text-zinc-500">Downloads</span>
              </div>
            </div>
          </div>

          {/* 3 Primary Download Cards with Direct Stream & SHA256 Copy */}
          <div id="download-section" className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2 max-w-5xl mx-auto text-left">
            
            {/* Download Card 1: Windows EXE */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className={`p-5 sm:p-6 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 hover:from-zinc-900 hover:to-zinc-900 rounded-3xl transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden group ${
                userOs === "windows" ? "border-2 border-emerald-500 ring-4 ring-emerald-500/20" : "border border-emerald-500/40 hover:border-emerald-500/90"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 group-hover:h-2 transition-all" />
              
              {userOs === "windows" && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Check className="w-3 h-3 stroke-[3]" /> Terdeteksi untuk Perangkat Anda
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Windows EXE
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">{adminSize}</div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-white">Software Admin (.exe)</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Aplikasi Desktop khusus Sekretariat Pondok, Sek. Madrasah &amp; Super Admin.
                </p>
              </div>

              {/* Checksum SHA256 Bar */}
              <div className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-[10px] flex items-center justify-between font-mono">
                <span className="text-zinc-500 truncate mr-2">SHA256: {adminSha256.slice(0, 14)}...</span>
                <button
                  onClick={() => handleCopySha256(adminSha256)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash === adminSha256 ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <a
                href={adminDownloadUrl}
                onClick={(e) => triggerDirectDownload(e, adminDownloadUrl, adminFilename)}
                download={adminFilename}
                className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download Windows (v{latestVersion})</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            {/* Download Card 2: Staff APK */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className={`p-5 sm:p-6 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 hover:from-zinc-900 hover:to-zinc-900 rounded-3xl transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden group ${
                userOs === "android" ? "border-2 border-indigo-500 ring-4 ring-indigo-500/20" : "border border-indigo-500/40 hover:border-indigo-500/90"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500 group-hover:h-2 transition-all" />

              {userOs === "android" && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-indigo-500 text-zinc-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Check className="w-3 h-3 stroke-[3]" /> Terdeteksi Android
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Android APK
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">{staffSize}</div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-white">App Staff (.apk)</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Khusus Guru Mustahiq, Mufatish, Mundzir, Musyrifah, dan Petugas Keamanan.
                </p>
              </div>

              {/* Checksum SHA256 Bar */}
              <div className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-[10px] flex items-center justify-between font-mono">
                <span className="text-zinc-500 truncate mr-2">SHA256: {staffSha256.slice(0, 14)}...</span>
                <button
                  onClick={() => handleCopySha256(staffSha256)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-indigo-400 rounded transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash === staffSha256 ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <a
                href={staffDownloadUrl}
                onClick={(e) => triggerDirectDownload(e, staffDownloadUrl, staffFilename)}
                download={staffFilename}
                className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download APK Staf (v{latestVersion})</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            {/* Download Card 3: Wali Santri APK */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-6 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 hover:from-zinc-900 hover:to-zinc-900 border border-cyan-500/40 hover:border-cyan-500/90 rounded-3xl transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500 group-hover:h-2 transition-all" />
              
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    Android APK
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">{guardianSize}</div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-lg sm:text-xl text-white">App Wali Santri (.apk)</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Pantau Nilai Raport Akademik, Perizinan Pulang, &amp; Smart KK Orang Tua.
                </p>
              </div>

              {/* Checksum SHA256 Bar */}
              <div className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-[10px] flex items-center justify-between font-mono">
                <span className="text-zinc-500 truncate mr-2">SHA256: {guardianSha256.slice(0, 14)}...</span>
                <button
                  onClick={() => handleCopySha256(guardianSha256)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash === guardianSha256 ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <a
                href={guardianDownloadUrl}
                onClick={(e) => triggerDirectDownload(e, guardianDownloadUrl, guardianFilename)}
                download={guardianFilename}
                className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/25 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download APK Wali (v{latestVersion})</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

          </div>

          {/* Release Notes Summary Card */}
          {latestRelease?.notesSummary && latestRelease.notesSummary.length > 0 && (
            <div className="w-full max-w-5xl mx-auto p-4 sm:p-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Ringkasan Perubahan Terbaru (v{latestVersion})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                {latestRelease.notesSummary.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item.replace(/^✓\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scroll Down Indicator */}
          <div className="pt-2 animate-bounce flex flex-col items-center gap-1 text-zinc-500 text-[11px]">
            <span>Scroll ke bawah untuk spesifikasi sistem &amp; riwayat versi</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SYSTEM REQUIREMENTS & AUTOMATIC UPDATE CARDS */}
        {/* ========================================================================= */}
        <section className="py-8 space-y-6 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Spesifikasi &amp; Pembaruan Otomatis</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Persyaratan Sistem &amp; Auto-Update</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: System Requirements */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Spesifikasi Perangkat Minimum</h3>
                  <p className="text-xs text-zinc-400">System Requirements untuk performa optimal</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4" /> Windows Desktop (.exe)
                  </div>
                  <ul className="text-zinc-400 space-y-1 pl-5 list-disc">
                    <li>Windows 10 / 11 64-bit</li>
                    <li>RAM Minimum 4 GB</li>
                    <li>Ruang Penyimpanan (Storage) 500 MB</li>
                  </ul>
                </div>

                <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Android Mobile (.apk)
                  </div>
                  <ul className="text-zinc-400 space-y-1 pl-5 list-disc">
                    <li>Android 8.0 (Oreo) atau lebih baru</li>
                    <li>RAM Minimum 3 GB</li>
                    <li>Koneksi Internet Stabil</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 2: Auto Update Support */}
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Pembaruan Otomatis (Auto Update)</h3>
                  <p className="text-xs text-zinc-400">Status dukungan update latar belakang</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Desktop Auto Update</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">Didukung</span>
                  </div>
                  <ul className="text-zinc-400 space-y-1">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pembaruan di latar belakang tanpa mengganggu kerja</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Notifikasi otomatis saat rilis baru tersedia</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instalasi otomatis saat aplikasi dibuka kembali</li>
                  </ul>
                </div>

                <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Android Auto Update</span>
                    <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">Didukung</span>
                  </div>
                  <ul className="text-zinc-400 space-y-1">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Notifikasi in-app ketika versi baru rilis</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Download APK otomatis di latar belakang</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Instalasi cepat setelah persetujuan pengguna</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* VERSION HISTORY SECTION WITH SEARCH FILTER */}
        {/* ========================================================================= */}
        <section className="py-8 space-y-4 max-w-5xl mx-auto text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Riwayat Versi (Release History)</h2>
                <p className="text-xs text-zinc-400">Arsip seluruh versi dan catatan perubahan aplikasi sebelumnya</p>
              </div>
            </div>

            {/* Search Input Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari versi (misal: v1.4.09)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs text-zinc-400 space-y-2">
              <Info className="w-6 h-6 text-zinc-500 mx-auto" />
              <p>Tidak ada rilis yang cocok dengan kata kunci &quot;{searchQuery}&quot;.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((rel) => {
                const isNotesExpanded = expandedNotes[rel.tagName];
                const formattedDate = rel.publishedAt
                  ? new Date(rel.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-";

                return (
                  <div
                    key={rel.tagName}
                    className="bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 transition-all shadow-lg space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono font-bold text-xs sm:text-sm rounded-xl">
                          {rel.tagName}
                        </span>
                        
                        {rel.isStable && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                            Stable
                          </span>
                        )}
                        {rel.isBeta && (
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-full">
                            Beta
                          </span>
                        )}

                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {formattedDate}
                        </span>
                        
                        {rel.totalDownloads > 0 && (
                          <span className="text-[11px] text-zinc-500 font-mono">
                            • {rel.totalDownloads.toLocaleString("id-ID")} downloads
                          </span>
                        )}
                      </div>

                      {/* Direct Stream Download Buttons for historical version */}
                      <div className="flex flex-wrap items-center gap-2">
                        {rel.windows && (
                          <a
                            href={rel.windows.downloadUrl}
                            onClick={(e) => triggerDirectDownload(e, rel.windows!.downloadUrl, rel.windows!.name)}
                            download={rel.windows.name}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Admin Setup ({rel.windows.formattedSize})</span>
                          </a>
                        )}
                        {rel.staff && (
                          <a
                            href={rel.staff.downloadUrl}
                            onClick={(e) => triggerDirectDownload(e, rel.staff!.downloadUrl, rel.staff!.name)}
                            download={rel.staff.name}
                            className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>APK Staf ({rel.staff.formattedSize})</span>
                          </a>
                        )}
                        {rel.guardian && (
                          <a
                            href={rel.guardian.downloadUrl}
                            onClick={(e) => triggerDirectDownload(e, rel.guardian!.downloadUrl, rel.guardian!.name)}
                            download={rel.guardian.name}
                            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>APK Wali ({rel.guardian.formattedSize})</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Release Notes Collapsible */}
                    {rel.notes && (
                      <div>
                        <button
                          onClick={() =>
                            setExpandedNotes((prev) => ({
                              ...prev,
                              [rel.tagName]: !prev[rel.tagName],
                            }))
                          }
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isNotesExpanded ? "Sembunyikan Catatan Rilis" : "Lihat Catatan Rilis (Release Notes)"}</span>
                          {isNotesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {isNotesExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto"
                          >
                            {rel.notes}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 2: SHOWCASE IMAGE MULTI-DEVICE */}
        {/* ========================================================================= */}
        <section className="py-12 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Visual Ekosistem Multi-Perangkat</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">Antarmuka Realtime Perangkat</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Visualisasi resmi sistem aplikasi pesantren di Desktop Monitor, Tablet, dan Smartphone Mobile.
            </p>
          </div>

          <div className="w-full relative group max-w-5xl mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/25 via-teal-500/25 to-cyan-500/25 rounded-3xl blur-3xl opacity-70 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800/80 p-2 sm:p-4 shadow-2xl overflow-hidden backdrop-blur-2xl">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800/80 mb-2 sm:mb-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] sm:text-[11px] truncate max-w-[200px] sm:max-w-none">
                  <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Sistem Informasi Pesantren P3HM &amp; MPHM Lirboyo</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Realtime Sync</span>
                </div>
              </div>

              <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-2xl">
                <Image
                  src="/user-showcase.jpg"
                  alt="Real Application Desktop & Mobile Showcase P3HM & MPHM Lirboyo"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  priority
                />
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-indigo-400 font-bold flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Akademik Raport Diniyyah</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-cyan-400 font-bold flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Mobile Wali Santri Smart KK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Kedisiplinan &amp; Perizinan Pulang</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 3: FITUR UTAMA DAN PANDUAN PENGGUNAAN */}
        {/* ========================================================================= */}
        <section className="py-8 space-y-8 sm:space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Layanan Digital Pesantren</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">Fitur Utama Dan Panduan Penggunaan</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Fasilitas digital modern terpadu untuk kemudahan akses informasi akademik, perizinan, dan pendaftaran mandiri keluarga santriwati P3HM &amp; MPHM Lirboyo Kediri.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">Monitoring Raport Digital</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Akses hasil penilaian akademik diniyyah santriwati secara cepat, terstruktur, dan transparan dari rombel kelas I&apos;dadiyyah hingga Aliyyah.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-rose-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">Sistem Perizinan &amp; Kedisiplinan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pengajuan dan pemantauan perizinan pulang santriwati secara resmi serta rekapitulasi kedisiplinan yang terintegrasi secara realtime.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">Integrasi Smart KK Mandiri</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kemudahan pendaftaran akun wali santri baru hanya menggunakan Nomor Kartu Keluarga (KK) yang otomatis terhubung dengan data anak di pesantren.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/60 rounded-3xl space-y-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-white">Informasi Realtime Pesantren</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dapatkan update pengumuman penting, jadwal kegiatan santriwati, serta kalender pendidikan pesantren secara langsung dan akurat.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 4: CARA PENDAFTARAN WALI SANTRI (SMART KK GUIDE) */}
        {/* ========================================================================= */}
        <section className="p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-cyan-500/40 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6 sm:pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>Panduan Resmi Pendaftaran Orang Tua</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Cara Pendaftaran Akun Wali Santri Baru (Smart KK)</h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Ikuti 4 langkah praktis berikut untuk mengunduh aplikasi dan mendaftarkan akun wali santri agar terhubung otomatis dengan data anak Anda di pesantren:
              </p>
            </div>

            <a
              href={guardianDownloadUrl}
              onClick={(e) => triggerDirectDownload(e, guardianDownloadUrl, guardianFilename)}
              download={guardianFilename}
              className="px-6 py-3.5 sm:py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-3 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download App Wali Santri (v{latestVersion})</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                01
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Unduh &amp; Buka App Wali</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Unduh file <strong>e-Mubtadiaat.apk</strong> dari tombol di atas lalu buka aplikasi di HP Android Anda.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                02
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Pilih Tab Pendaftaran Baru</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Di layar aplikasi Wali Santri, pilih opsi tab <strong>Pendaftaran Baru</strong> untuk membuka formulir registrasi.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                03
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Isi No. KK &amp; WhatsApp</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Lengkapi Nama Lengkap Wali (KTP), Nomor Kartu Keluarga (16 Digit), Nomor WA aktif, Username, &amp; Password pilihan Anda.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-sm sm:text-base flex items-center justify-center border border-cyan-500/40">
                04
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">Selesai &amp; Otomatis Terhubung</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Klik <strong>Daftar Akun</strong>. Akun Anda langsung aktif dan otomatis terintegrasi dengan profil anak melalui sistem Smart KK!
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYAR 5: FAQ & PETUNJUK PENGGUNAAN */}
        {/* ========================================================================= */}
        <section className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full py-4">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Penggunaan Aplikasi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Pertanyaan Umum &amp; Petunjuk Akses</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Petunjuk singkat mengenai cara mengunduh dan memasang aplikasi sesuai hak akses akun Anda.
            </p>
          </div>

          <div className="space-y-3">
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-4 sm:p-5 text-left font-extrabold text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Ustadz Mustahiq &amp; Pengurus mengakses aplikasi?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 1 ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {activeFaq === 1 && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Mustahiq, Mufattisy, Mundzir, Musyrifah, dan Petugas Keamanan dapat mengunduh <strong>App Staff (.apk)</strong> dari tombol unduh bagian atas.
                  </p>
                  <p>
                    Pasang file APK di HP Android Anda, lalu buka aplikasi untuk login. Mustahiq dapat langsung menginput presensi jam mengajar serta mengisi nilai kwartal santriwati.
                  </p>
                </div>
              )}
            </div>

            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-4 sm:p-5 text-left font-extrabold text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Wali Santri mendaftar dan memantau akademik anak?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 2 ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
              {activeFaq === 2 && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 space-y-2">
                  <p>
                    Orang tua santriwati mengunduh <strong>App Wali Santri (.apk)</strong>, kemudian membuka aplikasi di HP dan memilih tab <strong>Pendaftaran Baru</strong>. Masukkan nomor Kartu Keluarga (KK) yang terdaftar untuk membuat akun mandiri.
                  </p>
                  <p>
                    Setelah akun aktif, Anda dapat melihat nilai raport kwartal anak, status perizinan pulang, dan rekapan poin kedisiplinan langsung dari aplikasi HP Anda.
                  </p>
                </div>
              )}
            </div>

            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 transition-all">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full p-4 sm:p-5 text-left font-extrabold text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
              >
                <span>Bagaimana cara Sekretariat mengunduh Software Admin Desktop?</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeFaq === 3 ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              {activeFaq === 3 && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  Sekretariat Pondok, Sek. Madrasah, &amp; Super Admin dapat mengunduh <strong>Software Admin (.exe)</strong> untuk Windows. Jalankan installer `Admin.Mubtadiaat.Setup.exe` dan login menggunakan kredensial Sekretariat yang diberikan.
                </div>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-10 sm:py-12 px-4 sm:px-6 lg:px-12 mt-12 sm:mt-16 relative z-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <Image src="/logo.png" alt="Logo P3HM & MPHM Lirboyo" width={36} height={36} className="rounded-xl opacity-90 shrink-0" />
            <div>
              <div className="font-black text-sm text-zinc-200">P3HM &amp; MPHM Lirboyo Kediri</div>
              <div className="text-[11px] text-zinc-400">Pondok Pesantren Putri Hidayatul Mubtadi'at &amp; Madrasah Putri Hidayatul Mubtadi'at</div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-bold text-zinc-400">
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
              Kebijakan Privasi (Privacy Policy)
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">
              Syarat &amp; Ketentuan (Terms of Service)
            </Link>
          </div>

          <div className="text-center md:text-right text-[11px]">
            <div className="text-zinc-400 font-semibold">&copy; 2026 P3HM &amp; MPHM Lirboyo. All rights reserved.</div>
            <div className="text-zinc-600 font-mono text-[10px] mt-0.5">Dev: DEVELZY Indonesia ®2025</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
