"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles,
  ArrowRight,
  Smartphone,
  Download,
  Monitor,
  CheckCircle2,
  History,
  Clock,
  Search,
  Activity,
  Check,
  Info,
  ShieldCheck,
  Layers,
  ChevronDown,
  Building2,
  Lock,
  UserCheck,
  Zap,
  HelpCircle,
  Bot,
  Send,
  X,
  MessageSquare,
  Loader2
} from "lucide-react";
import type { DownloadReleasesResponse } from "./api/download/releases/route";
import { filterHighestVersionPerDate } from "@/lib/releaseUtils";

const ROLE_REDIRECT_MAP: Record<string, string> = {
  "sek.pondok": "/sekretariat",
  "sek.madrasah": "/sekretariat",
  "mustahiq": "/mustahiq",
  "mufattisy": "/mufattisy",
  "mundzir": "/mufattisy",
  "musyrifah": "/mufattisy",
  "pengurus": "/mustahiq",
  "pimpinan": "/pimpinan",
  "keamanan": "/keamanan",
  "wali_santri": "/guardian",
  "wali": "/guardian",
  "guardian": "/guardian",
};

export function getRedirectUrlByRole(role?: string): string {
  if (!role) return "/auth/loginsekr";
  const r = role.toLowerCase().trim();
  return ROLE_REDIRECT_MAP[r] || "/sekretariat";
}

export default function Page() {
  const router = useRouter();
  const { data: user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // AI Assistant Chat Help Drawer State
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isChatStreaming, setIsChatStreaming] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Assalamu'alaikum Wr. Wb. Saya Asisten Virtual Resmi P3HM & MPHM Lirboyo Kediri. Ada yang bisa saya bantu terkait informasi pesantren, madrasah, atau unduhan aplikasi?",
    },
  ]);

  // Dynamic Releases State from GitHub API Internal Endpoint
  const [releaseData, setReleaseData] = useState<DownloadReleasesResponse | null>(null);
  const [isLoadingReleases, setIsLoadingReleases] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        // 1. Try internal route first
        const res = await fetch("/api/download/releases", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.latest) {
            setReleaseData(data);
          }
        }

        // 2. Fetch directly from GitHub API client-side for 100% instant real-time updates
        const ghRes = await fetch("https://api.github.com/repos/mubtadiaat/app_software/releases?per_page=20");
        if (ghRes.ok) {
          const rawReleases = await ghRes.json();
          if (Array.isArray(rawReleases) && rawReleases.length > 0) {
            const validReleases = rawReleases.filter((r: any) => !r.draft);
            if (validReleases.length > 0) {
              const latestObj = validReleases[0];
              const version = (latestObj.tag_name || "").replace(/^v/i, "");
              
              let windowsAsset: any;
              let staffAsset: any;
              let guardianAsset: any;
              let winDl = 0, staffDl = 0, guardDl = 0, totalDl = 0;

              validReleases.forEach((rel: any) => {
                if (Array.isArray(rel.assets)) {
                  rel.assets.forEach((a: any) => {
                    const dl = Number(a.download_count || 0);
                    totalDl += dl;
                    const n = (a.name || "").toLowerCase();
                    if (n.endsWith(".exe")) winDl += dl;
                    else if (n.startsWith("mubtadiaat") && n.endsWith(".apk")) staffDl += dl;
                    else if (n.startsWith("e-mubtadiaat") && n.endsWith(".apk")) guardDl += dl;
                  });
                }
              });

              if (Array.isArray(latestObj.assets)) {
                latestObj.assets.forEach((a: any) => {
                  const n = (a.name || "").toLowerCase();
                  const assetData = {
                    name: a.name,
                    size: a.size || 0,
                    formattedSize: `${(a.size / (1024 * 1024)).toFixed(1)} MB`,
                    downloadCount: Number(a.download_count || 0),
                    downloadUrl: a.browser_download_url || "",
                  };
                  if (n.endsWith(".exe")) windowsAsset = assetData;
                  else if (n.startsWith("mubtadiaat") && n.endsWith(".apk")) staffAsset = assetData;
                  else if (n.startsWith("e-mubtadiaat") && n.endsWith(".apk")) guardianAsset = assetData;
                });
              }

              // Smart fallbacks across recent releases if latest release assets are still being uploaded by CI
              if (!windowsAsset) {
                for (const rel of validReleases) {
                  if (Array.isArray(rel.assets)) {
                    const found = rel.assets.find((a: any) => (a.name || "").toLowerCase().endsWith(".exe"));
                    if (found) {
                      windowsAsset = {
                        name: found.name,
                        size: found.size || 0,
                        formattedSize: `${(found.size / (1024 * 1024)).toFixed(1)} MB`,
                        downloadCount: Number(found.download_count || 0),
                        downloadUrl: found.browser_download_url || "",
                      };
                      break;
                    }
                  }
                }
              }

              if (!staffAsset) {
                for (const rel of validReleases) {
                  if (Array.isArray(rel.assets)) {
                    const found = rel.assets.find((a: any) => {
                      const n = (a.name || "").toLowerCase();
                      return n.startsWith("mubtadiaat") && n.endsWith(".apk");
                    });
                    if (found) {
                      staffAsset = {
                        name: found.name,
                        size: found.size || 0,
                        formattedSize: `${(found.size / (1024 * 1024)).toFixed(1)} MB`,
                        downloadCount: Number(found.download_count || 0),
                        downloadUrl: found.browser_download_url || "",
                      };
                      break;
                    }
                  }
                }
              }

              if (!guardianAsset) {
                for (const rel of validReleases) {
                  if (Array.isArray(rel.assets)) {
                    const found = rel.assets.find((a: any) => {
                      const n = (a.name || "").toLowerCase();
                      return n.startsWith("e-mubtadiaat") && n.endsWith(".apk");
                    });
                    if (found) {
                      guardianAsset = {
                        name: found.name,
                        size: found.size || 0,
                        formattedSize: `${(found.size / (1024 * 1024)).toFixed(1)} MB`,
                        downloadCount: Number(found.download_count || 0),
                        downloadUrl: found.browser_download_url || "",
                      };
                      break;
                    }
                  }
                }
              }

              const processedLatest = {
                version,
                tagName: latestObj.tag_name || `v${version}`,
                publishedAt: latestObj.published_at || latestObj.created_at,
                htmlUrl: latestObj.html_url || "",
                isLatest: true,
                isStable: !latestObj.prerelease,
                totalDownloads: (windowsAsset?.downloadCount || 0) + (staffAsset?.downloadCount || 0) + (guardianAsset?.downloadCount || 0),
                windows: windowsAsset,
                staff: staffAsset,
                guardian: guardianAsset,
              };

              const rawHistory = validReleases.slice(1).map((rel: any) => {
                let winA: any, stfA: any, trdA: any;
                let relDownloads = 0;
                if (Array.isArray(rel.assets)) {
                  rel.assets.forEach((a: any) => {
                    const dl = Number(a.download_count || 0);
                    relDownloads += dl;
                    const n = (a.name || "").toLowerCase();
                    const assetData = {
                      name: a.name,
                      size: a.size || 0,
                      formattedSize: `${(a.size / (1024 * 1024)).toFixed(1)} MB`,
                      downloadCount: dl,
                      downloadUrl: a.browser_download_url || "",
                    };
                    if (n.endsWith(".exe")) winA = assetData;
                    else if (n.startsWith("mubtadiaat") && n.endsWith(".apk")) stfA = assetData;
                    else if (n.startsWith("e-mubtadiaat") && n.endsWith(".apk")) trdA = assetData;
                  });
                }
                const v = (rel.tag_name || "").replace(/^v/i, "");
                return {
                  version: v,
                  tagName: rel.tag_name || `v${v}`,
                  publishedAt: rel.published_at || rel.created_at,
                  htmlUrl: rel.html_url || "",
                  isLatest: false,
                  isStable: !rel.prerelease,
                  totalDownloads: relDownloads,
                  windows: winA,
                  staff: stfA,
                  guardian: trdA,
                };
              });

              const processedHistory = filterHighestVersionPerDate(rawHistory);

              setReleaseData({
                latest: processedLatest,
                history: processedHistory,
                stats: {
                  windowsDownloads: winDl,
                  staffDownloads: staffDl,
                  guardianDownloads: guardDl,
                  totalDownloads: totalDl,
                },
                source: "github",
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed fetching live releases from GitHub API:", err);
      } finally {
        setIsLoadingReleases(false);
      }
    }

    fetchReleases();
  }, []);

  const latestRelease = releaseData?.latest;
  const historyList = releaseData?.history || [];

  const filteredHistory = historyList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.version.toLowerCase().includes(q) || item.tagName.toLowerCase().includes(q);
  });

  const handleTriggerDownload = (title: string, url?: string) => {
    const targetUrl = url || "https://github.com/mubtadiaat/app_software/releases/latest";
    setActiveDownloadNotice(`Unduhan ${title} sedang dimulai...`);
    window.location.href = targetUrl;
    setTimeout(() => {
      setActiveDownloadNotice(null);
    }, 4000);
  };

  const handleSendAiMessage = async (customText?: string) => {
    const text = (customText || inputPrompt).trim();
    if (!text || isChatStreaming) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: text }];
    setChatMessages(newMessages);
    if (!customText) setInputPrompt("");
    setIsChatStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error("Gagal terhubung ke AI Bantuan P3HM.");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream tidak tersedia.");

      let assistantText = "";
      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Mohon maaf, layanan AI Bantuan P3HM sedang mengalami gangguan sementara. Silakan coba kembali." },
      ]);
    } finally {
      setIsChatStreaming(false);
    }
  };

  const faqItems = [
    {
      q: "Bagaimana cara melakukan login akun pengurus atau wali santri?",
      a: "Seluruh pengurus (Sekretariat, Mustahiq, Mufattisy, Mundzir, Keamanan) serta Wali Santri WAJIB melakukan login melalui aplikasi resmi (Software Desktop Admin atau Aplikasi Mobile Android). Bebas browser umum demi menjamin keamanan data santri.",
    },
    {
      q: "Aplikasi mana yang harus saya unduh?",
      a: "• Software Desktop Admin (.exe): Khusus Pengurus Sekretariat Pondok & Sekretariat Madrasah.\n• App Staff & Pengurus (.apk): Khusus Guru Mustahiq, Mufattisy, Mundzir, Musyrifah, dan Pengurus.\n• App Wali Santri (.apk): Khusus Orang Tua / Wali Santri untuk memantau nilai akademik & perizinan.",
    },
    {
      q: "Mengapa instalasi Android meminta izin 'Sumber Tidak Dikenal'?",
      a: "Aplikasi ini didistribusikan secara independen oleh pihak Pondok & Madrasah Lirboyo (bukan dari PlayStore publik). Aktifkan izin 'Install unknown apps' pada HP Anda untuk melanjutkan instalasi.",
    },
    {
      q: "Bagaimana cara memperbarui aplikasi ke versi terbaru?",
      a: "Software Desktop Admin memiliki fitur Auto-Update otomatis. Untuk aplikasi Android, Anda dapat mengunduh berkas .apk versi terbaru di halaman ini kapan saja.",
    },
  ];

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background Animated Mesh Gradient & Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-emerald-600/30 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-[-50px] right-1/4 w-[450px] h-[450px] bg-indigo-600/30 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Floating Download Notification */}
      <AnimatePresence>
        {activeDownloadNotice && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-300"
          >
            <Download className="w-5 h-5 animate-bounce" />
            <span>{activeDownloadNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header / Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 p-1 shadow-lg shadow-emerald-950/50">
            <Image src="/logo.png" alt="Logo P3HM & MPHM" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              P3HM &amp; MPHM Lirboyo
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Pusat Rilis Software &amp; Aplikasi Resmi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex text-xs font-mono px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-emerald-400 items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {latestRelease?.version ? `Ecosystem v${latestRelease.version} Live` : "Memuat versi..."}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Portal Distribusi Aplikasi Resmi Pesantren &amp; Madrasah</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight"
          >
            Unduh Aplikasi{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              P3HM &amp; MPHM
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal"
          >
            Akses aman dan serba otomatis untuk seluruh layanan pendidikan Diniyyah &amp; Asrama Pondok Pesantren Putri Hidayatul Mubtadi'aat Lirboyo Kediri.
          </motion.p>

          {/* Smart OS Auto-detection Banner */}
          {userOs !== "other" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-xs font-mono text-emerald-300 shadow-xl"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Perangkat Anda terdeteksi:{" "}
                <strong className="text-white uppercase font-bold">{userOs === "windows" ? "Windows PC / Laptop" : "Smartphone Android"}</strong>. Rekomendasi aplikasi ditandai di bawah!
              </span>
            </motion.div>
          )}
        </section>

        {/* 3D INTERACTIVE DOWNLOAD CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* CARD 1: WINDOWS ADMIN DESKTOP */}
          <motion.div
            whileHover={{ y: -6 }}
            className={`relative rounded-3xl p-6 flex flex-col justify-between backdrop-blur-2xl transition-all duration-300 border ${
              userOs === "windows"
                ? "bg-slate-900/90 border-emerald-400 shadow-2xl shadow-emerald-950/80 ring-2 ring-emerald-500/30"
                : "bg-slate-900/60 border-white/10 hover:border-emerald-500/50"
            }`}
          >
            {userOs === "windows" && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Check className="w-3 h-3" /> Terdeteksi Untuk Anda
              </div>
            )}

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Monitor className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">WINDOWS EXE</span>
                  <span className="text-xs text-slate-400 font-mono">{latestRelease?.windows?.formattedSize || "75.9 MB"}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Software Admin Desktop</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Aplikasi Desktop khusus <strong className="text-emerald-300">Sekretariat Pondok</strong> &amp; <strong className="text-indigo-300">Sekretariat Madrasah</strong>. Dilengkapi Advanced Installer, otentikasi aman, dan pembaruan otomatis.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-[11px] text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verifikasi Otentikasi Sekretariat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  <span>Fitur Auto-Update Terpadu</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleTriggerDownload("Software Admin Windows (.exe)", latestRelease?.windows?.downloadUrl)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Windows {latestRelease?.version ? `(v${latestRelease.version})` : ''}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* CARD 2: APP STAFF & PENGURUS */}
          <motion.div
            whileHover={{ y: -6 }}
            className="relative rounded-3xl p-6 flex flex-col justify-between backdrop-blur-2xl transition-all duration-300 bg-slate-900/60 border border-white/10 hover:border-indigo-500/50"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider">ANDROID APK</span>
                  <span className="text-xs text-slate-400 font-mono">{latestRelease?.staff?.formattedSize || "5.8 MB"}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">App Staff &amp; Pengurus</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Aplikasi Android khusus <strong className="text-indigo-300">Mustahiq, Mufattisy, Mundzir, Musyrifah, dan Pengurus</strong>. Input nilai raport, absensi kelas, jurnal kedisiplinan, &amp; perizinan.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-[11px] text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Khusus Pengurus &amp; Mustahiq</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Manajemen Nilai &amp; Absensi</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleTriggerDownload("App Staff Android (.apk)", latestRelease?.staff?.downloadUrl)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-950/50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh APK Staff {latestRelease?.version ? `(v${latestRelease.version})` : ''}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* CARD 3: APP WALI SANTRI */}
          <motion.div
            whileHover={{ y: -6 }}
            className={`relative rounded-3xl p-6 flex flex-col justify-between backdrop-blur-2xl transition-all duration-300 border ${
              userOs === "android"
                ? "bg-slate-900/90 border-blue-400 shadow-2xl shadow-blue-950/80 ring-2 ring-blue-500/30"
                : "bg-slate-900/60 border-white/10 hover:border-blue-500/50"
            }`}
          >
            {userOs === "android" && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Check className="w-3 h-3" /> Terdeteksi Untuk Anda
              </div>
            )}

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider">ANDROID APK</span>
                  <span className="text-xs text-slate-400 font-mono">{latestRelease?.guardian?.formattedSize || "5.8 MB"}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">App Wali Santri</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Aplikasi Android khusus <strong className="text-blue-300">Orang Tua / Wali Santri</strong>. Pantau nilai raport akademik, catatan kedisiplinan, presensi, &amp; Smart KK wali.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-[11px] text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pantau Perkembangan Anak Realtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sistem Login Google One-Tap</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleTriggerDownload("App Wali Santri (.apk)", latestRelease?.guardian?.downloadUrl)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-400 hover:to-sky-500 text-white font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-950/50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh APK Wali {latestRelease?.version ? `(v${latestRelease.version})` : ''}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </section>

        {/* LIVE STATS COUNTER BAR */}
        <section className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 backdrop-blur-xl">
          <div className="text-center space-y-1 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
            <span className="text-xs text-slate-400 font-mono">Total Unduhan</span>
            <div className="text-2xl font-black text-white font-mono">{releaseData?.stats.totalDownloads || 0}</div>
          </div>
          <div className="text-center space-y-1 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
            <span className="text-xs text-emerald-400 font-mono">Software Windows</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{releaseData?.stats.windowsDownloads || 0}</div>
          </div>
          <div className="text-center space-y-1 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
            <span className="text-xs text-indigo-400 font-mono">App Staff APK</span>
            <div className="text-2xl font-black text-indigo-400 font-mono">{releaseData?.stats.staffDownloads || 0}</div>
          </div>
          <div className="text-center space-y-1 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
            <span className="text-xs text-blue-400 font-mono">App Wali APK</span>
            <div className="text-2xl font-black text-blue-400 font-mono">{releaseData?.stats.guardianDownloads || 0}</div>
          </div>
        </section>

        {/* RELEASE HISTORY TABLE WITH LIVE SEARCH */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Riwayat Versi Rilis (Release History)
              </h3>
              <p className="text-xs text-slate-400">Arsip rilis versi aplikasi sebelumnya di repositori resmi.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari versi (contoh: 1.4.10)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
            {isLoadingReleases ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400 animate-pulse">
                Memuat riwayat rilis dari server...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-mono">
                {searchQuery ? `Tidak ada versi rilis yang cocok dengan "${searchQuery}".` : "Belum ada riwayat rilis sebelumnya."}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredHistory.map((item) => (
                  <div key={item.version} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-white px-3 py-1 rounded-xl bg-slate-950 border border-white/10">
                        v{item.version}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{item.isStable ? "Stable Release" : "Pre-release"}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({new Date(item.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">Total Unduhan: {item.totalDownloads}x</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.windows && (
                        <button
                          onClick={() => handleTriggerDownload(`Windows v${item.version}`, item.windows?.downloadUrl)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
                        >
                          Windows ({item.windows.formattedSize})
                        </button>
                      )}
                      {item.staff && (
                        <button
                          onClick={() => handleTriggerDownload(`APK Staff v${item.version}`, item.staff?.downloadUrl)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
                        >
                          APK Staff ({item.staff.formattedSize})
                        </button>
                      )}
                      {item.guardian && (
                        <button
                          onClick={() => handleTriggerDownload(`APK Wali v${item.version}`, item.guardian?.downloadUrl)}
                          className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
                        >
                          APK Wali ({item.guardian.formattedSize})
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* INTERACTIVE FAQ ACCORDION */}
        <section className="space-y-6 pt-4 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Pertanyaan Sering Diajukan (FAQ)
            </h3>
            <p className="text-xs text-slate-400">Panduan umum penggunaan &amp; penginstalan aplikasi.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-white flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-emerald-400" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FLOATING AI HELP WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isAiOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-[92vw] sm:w-[420px] h-[540px] max-h-[80vh] mb-4 bg-slate-900/95 border border-emerald-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/80 to-slate-900 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Ada Pertanyaan?
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online • Asisten Lirboyo
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAiOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans text-xs">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-medium rounded-br-none shadow-md shadow-emerald-950/40"
                          : "bg-slate-950/80 border border-white/10 text-slate-200 rounded-bl-none font-mono"
                      }`}
                    >
                      {msg.content || (isChatStreaming && index === chatMessages.length - 1 ? "Sedang mengetik..." : "")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Questions Suggestions - Clean Hidden Scrollbar */}
              <div className="px-3 py-2 bg-slate-950/60 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => handleSendAiMessage("Bagaimana cara mengunduh software desktop Windows?")}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 border border-white/10 whitespace-nowrap cursor-pointer transition-colors"
                >
                  💻 Cara Unduh Desktop?
                </button>
                <button
                  onClick={() => handleSendAiMessage("Siapa saja yang boleh login ke aplikasi?")}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 border border-white/10 whitespace-nowrap cursor-pointer transition-colors"
                >
                  🔑 Siapa yang Boleh Login?
                </button>
                <button
                  onClick={() => handleSendAiMessage("Apa fungsi aplikasi Wali Santri?")}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 border border-white/10 whitespace-nowrap cursor-pointer transition-colors"
                >
                  📱 App Wali Santri?
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="p-3 bg-slate-950 border-t border-white/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Tanyakan sesuatu tentang P3HM/MPHM..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  disabled={isChatStreaming}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors font-mono disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isChatStreaming}
                  className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  {isChatStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2.5 shadow-2xl shadow-emerald-950/80 cursor-pointer ring-2 ring-emerald-400/40 hover:scale-105 transition-all"
        >
          <Bot className="w-5 h-5" />
          <span>Ada Pertanyaan?</span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
        </button>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-slate-950/80 py-8 text-center text-xs text-slate-500 font-mono space-y-2">
        <div>&copy; 2026 P3HM &amp; MPHM Lirboyo Kediri. All rights reserved.</div>
        <div className="text-[10px] text-slate-600">Dev: DEVELZY Indonesia ®2025 • Secured Official Distribution Platform</div>
      </footer>
    </div>
  );
}
