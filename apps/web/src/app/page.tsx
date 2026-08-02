"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  ShieldCheck,
  ChevronRight,
  Bot,
  Send,
  X,
  MessageSquare,
  Loader2,
  Lock,
  UserCheck,
  Award,
  Calendar,
  PhoneCall,
  Check,
} from "lucide-react";

const ROLE_REDIRECT_MAP: Record<string, string> = {
  "sek.pondok": "/sekretariat",
  "sek.madrasah": "/sekretariat",
  "mustahiq": "/mustahiq",
  "pengurus": "/sekretariat",
  "wali_santri": "/guardian",
  "wali": "/guardian",
  "guardian": "/guardian",
};

export function getRedirectUrlByRole(role?: string): string {
  if (!role) return "/loginsekr";
  const r = role.toLowerCase().trim();
  return ROLE_REDIRECT_MAP[r] || "/sekretariat";
}

interface StatsData {
  totalSiswiAktif: number;
  totalAlumni: number;
  totalKelasAktif: number;
  totalPengajar: number;
  tahunBerdiri: number;
  tahunBeroperasi: number;
}

export default function Page() {
  const router = useRouter();
  const { data: user } = useAuth();

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      const redirectUrl = getRedirectUrlByRole(String(user.role));
      router.replace(redirectUrl);
    }
  }, [user, router]);

  // Dynamic Database Stats State
  const [stats, setStats] = useState<StatsData>({
    totalSiswiAktif: 0,
    totalAlumni: 0,
    totalKelasAktif: 0,
    totalPengajar: 0,
    tahunBerdiri: 1997,
    tahunBeroperasi: 29,
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // AI Assistant Drawer State
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isChatStreaming, setIsChatStreaming] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Assalamu'alaikum Wr. Wb. Saya Asisten Resmi Madrasah Putri Hidayatul Mubtadi'aat (MPHM) Lirboyo Kediri. Ada yang bisa saya bantu terkait informasi profil madrasah, kurikulum diniyyah, pendaftaran siswi baru, maupun akses sistem?",
    },
  ]);

  // Fetch Public Database Stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/public/stats");
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setStats(json.data);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data statistik publik:", err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

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
        throw new Error("Gagal terhubung ke AI Bantuan MPHM.");
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
        {
          role: "assistant",
          content:
            "Mohon maaf, layanan AI Bantuan MPHM sedang mengalami kendala jaringan. Silakan hubungi Sekretariat Madrasah secara langsung.",
        },
      ]);
    } finally {
      setIsChatStreaming(false);
    }
  };

  const loginOptions = [
    {
      title: "Sekretariat Madrasah",
      roleLabel: "Sekretaris & Admin Sistem",
      href: "/loginsekr",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      btnColor: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50",
      desc: "Portal pengelolaan data siswi, rombel kelas, pengajar, kurikulum, dan pencetakan raport/ijazah.",
      icon: ShieldCheck,
    },
    {
      title: "Mustahiq (Wali Kelas)",
      roleLabel: "Wali Kelas Diniyyah",
      href: "/loginStaff",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      btnColor: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50",
      desc: "Input nilai kwartal harian, presensi kehadiran siswi kelas, dan audit kenaikan kelas.",
      icon: UserCheck,
    },
    {
      title: "Pengurus Madrasah",
      roleLabel: "Pengurus & Tenaga Pengajar",
      href: "/loginStaff",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      btnColor: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/50",
      desc: "Akses portal pengurus, pengawasan tingkat diniyyah, dan laporan manajemen madrasah.",
      icon: Building2,
    },
    {
      title: "Wali Santri",
      roleLabel: "Orang Tua / Wali Siswi",
      href: "/loginguardiant",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      btnColor: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50",
      desc: "Pemantauan hasil belajar kwartal, perkembangan akademik, dan dokumen raport digital anak.",
      icon: Users,
    },
  ];

  const levels = [
    {
      name: "Tingkat I'dadiyyah",
      duration: "1 Tahun Pembelajaran",
      desc: "Jenjang persediaan dan penguatan dasar-dasar baca tulis Al-Qur'an, Tajwid, Pegon, Kitab Safinatun Najah, & Aqidatul Awam.",
      badge: "Jenjang Persiapan",
      topics: ["Mabadi' Fiqhiyyah", "Tajwid Al-Qur'an", "Khat & Pegon", "Akhlaqul Banat"],
    },
    {
      name: "Tingkat Ibtida'iyyah",
      duration: "3 Tahun Pembelajaran",
      desc: "Pendalaman dasar ilmu Syari'at, Nahwu-Shorof (Jurumiyyah & Imrithi), Fiqih (Fathul Qorib), Hadits, dan Sejarah Islam (Tarikh).",
      badge: "Jenjang Dasar Diniyyah",
      topics: ["Al-Imrithi & Jurumiyyah", "Fathul Qorib Al-Mujib", "Taisirul Kholaq", "Khulashoh Nurul Yaqin"],
    },
    {
      name: "Tingkat Tsanawiyyah",
      duration: "3 Tahun Pembelajaran",
      desc: "Tingkat menengah penguasaan literatur Turats (Alfiyyah Ibnu Malik, Fathul Mu'in, Jawahirul Bukhari, Balaghoh).",
      badge: "Jenjang Menengah Diniyyah",
      topics: ["Alfiyyah Ibnu Malik", "Fathul Mu'in", "Jawahirul Bukhari", "Jawahirul Balaghoh"],
    },
    {
      name: "Tingkat Aliyah",
      duration: "3 Tahun Pembelajaran",
      desc: "Mencetak siswi mutafaqqih Fiddin dengan spesialisasi Ushul Fiqh (Jam'ul Jawami'), Hadits (Shahih Bukhari), & Tafsir Jalalain.",
      badge: "Jenjang Tinggi Diniyyah",
      topics: ["Jam'ul Jawami'", "Shahih Al-Bukhari", "Tafsir Al-Jalalain", "Ushul Fiqh"],
    },
  ];

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Dynamic Animated Mesh Gradient Orbs (Madrasah Blue / Indigo Theme) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-[-120px] left-1/4 w-[550px] h-[550px] bg-blue-600/30 rounded-full blur-[150px] animate-pulse" />
        <div
          className="absolute top-[-60px] right-1/4 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[200px] left-1/3 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-900 border border-blue-500/30 p-1 shadow-lg shadow-blue-950/50">
            <Image src="/logo.png" alt="Logo MPHM Lirboyo" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
              MPHM Lirboyo
            </h1>
            <p className="text-[11px] text-blue-400 font-mono">Madrasah Putri Hidayatul Mubtadi&apos;aat</p>
          </div>
        </div>

        {/* Quick Header Logins */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="/loginsekr"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all"
          >
            Sekretariat
          </a>
          <a
            href="/loginStaff"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
          >
            Mustahiq
          </a>
          <a
            href="/loginStaff"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all"
          >
            Pengurus
          </a>
          <a
            href="/loginguardiant"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
          >
            Wali Santri
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24 space-y-24">
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Pusat Pendidikan Diniyyah Formal Putri Lirboyo Kediri</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight"
          >
            Madrasah Putri{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Hidayatul Mubtadi&apos;aat
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            Mencetak generasi muslimah shalihat, mutafaqqih fiddin, berakhlaqul karimah, serta menguasai Turats Kitab Kuning Kurikulum Salaf Pondok Pesantren Lirboyo Kediri.
          </motion.p>

          {/* Badge Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <span className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-blue-500/30 text-xs font-medium text-blue-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Kurikulum Salaf Diniyyah Terpadu
            </span>
            <span className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-indigo-500/30 text-xs font-medium text-indigo-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Lirboyo Kediri - Jawa Timur
            </span>
          </motion.div>
        </section>

        {/* SECTION 1: 4 KARTU AKSES LOGIN UTAMA */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Portal Akses Sistem Terpadu
            </h3>
            <p className="text-sm text-slate-400">
              Silakan pilih pintu masuk sesuai peran dan wewenang Anda di Sekretariat / Pengurus Madrasah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loginOptions.map((opt, idx) => {
              const IconComp = opt.icon;
              return (
                <motion.div
                  key={opt.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl p-6 bg-slate-900/70 border border-white/10 hover:border-blue-500/40 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${opt.badgeColor}`}>
                        {opt.roleLabel}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white">{opt.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{opt.desc}</p>
                    </div>
                  </div>

                  <a
                    href={opt.href}
                    className={`mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${opt.btnColor}`}
                  >
                    <span>Masuk Ke Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: LIVE REAL-TIME DATABASE STATS */}
        <section className="rounded-3xl p-8 bg-gradient-to-b from-slate-900/90 to-blue-950/30 border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x-0 lg:divide-x divide-slate-800">
            <div className="space-y-2 p-2">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                {isLoadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
                ) : (
                  stats.totalSiswiAktif.toLocaleString("id-ID")
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Siswi Diniyyah Aktif</p>
            </div>

            <div className="space-y-2 p-2">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                {isLoadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                ) : (
                  stats.totalAlumni.toLocaleString("id-ID")
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Alumni Terdaftar</p>
            </div>

            <div className="space-y-2 p-2">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                {isLoadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                ) : (
                  stats.totalKelasAktif.toLocaleString("id-ID")
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rombel Kelas Aktif</p>
            </div>

            <div className="space-y-2 p-2">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                {isLoadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                ) : (
                  `${stats.tahunBeroperasi} Tahun`
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pengabdian Mendidik</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: PROFIL SINGKAT MADRASAH */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Profil Institusi</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Pusat Kaderisasi Muslimah Shalihat &amp; Mutafaqqih Fiddin
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Madrasah Putri Hidayatul Mubtadi&apos;aat (MPHM) Lirboyo Kediri merupakan lembaga pendidikan Diniyyah formal khusus putri yang berdiri di naungan Komplek Pondok Pesantren Lirboyo Kediri. MPHM memfokuskan pendidikannya pada penguasaan disiplin ilmu-ilmu syar&apos;i klasik melalui kajian kitab-kitab kuning pilihan.
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Dengan sistem penjagaan kualitas akademis melalui Ujian 4 Kwartal, pembimbingan Wali Kelas (Mustahiq), serta pengawasan ketat Mufattish, MPHM berkomitmen melestarikan sanad keilmuan Salafussalihin secara utuh.
            </p>
          </div>

          <div className="lg:col-span-5 rounded-3xl p-6 bg-slate-900/80 border border-blue-500/30 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Keunggulan Pendidikan MPHM
            </h4>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Sanad keilmuan muttasil tersambung langsung kepada para Masayikh Lirboyo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Sistem penilaian transparan 4 Kwartal dengan audit Nilai Minimal (KKTP).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Kombinasi pendalaman Nahwu, Shorof, Fiqih, Hadits, Tafsir, &amp; Balaghoh.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Digitalisasi Raport &amp; Ijazah Resmi terintegrasi Database Abadi.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: VISI & MISI */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Visi &amp; Misi Madrasah</h3>
            <p className="text-sm text-slate-400">Landasan utama arah pendidikan dan pembinaan keilmuan di MPHM</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visi Card */}
            <div className="lg:col-span-5 rounded-3xl p-8 bg-gradient-to-br from-blue-900/60 via-indigo-950/80 to-slate-900 border border-blue-500/40 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                  Visi Utama
                </span>
                <h4 className="text-2xl font-black text-white leading-snug">
                  Terwujudnya Generasi Muslimah yang Alim, Shalihat, dan Berakhlaqul Karimah
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Menjadi benteng kelestarian ajaran Islam Ahlussunnah wal Jama&apos;ah An-Nahdliyyah melalui penguasaan kitab-kitab kuning bermutu tinggi.
                </p>
              </div>
            </div>

            {/* Misi Card */}
            <div className="lg:col-span-7 rounded-3xl p-8 bg-slate-900/70 border border-white/10 space-y-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                Misi Pendidikan
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <div className="text-blue-400 font-bold text-sm">1. Pendalaman Turats</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Menyelenggarakan sistem pengajaran kitab kuning secara bertahap dan berjenjang dari I&apos;dadiyyah hingga Aliyah.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <div className="text-indigo-400 font-bold text-sm">2. Pembentukan Akhlaq</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Membimbing akhlaqul karimah siswi sesuai tuntunan ulama Salafussalihin dalam kehidupan sehari-hari.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <div className="text-purple-400 font-bold text-sm">3. Standarisasi Akademis</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Menerapkan evaluasi berkala 4 Kwartal untuk menjamin standar kualitas keilmuan seluruh siswi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <div className="text-emerald-400 font-bold text-sm">4. Pengabdian Ummat</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Mencetak alumni yang siap mengabdi di tengah masyarakat sebagai daiyyah dan pendidik muslimah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: JENJANG PENDIDIKAN DINIYYAH */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Jenjang Pendidikan Diniyyah
            </h3>
            <p className="text-sm text-slate-400">
              Struktur tingkatan kelas dan fokus kajian kitab di Madrasah MPHM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {levels.map((lvl, idx) => (
              <motion.div
                key={lvl.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 hover:border-blue-500/40 backdrop-blur-xl space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
                    {lvl.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {lvl.duration}
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white">{lvl.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{lvl.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Kajian Utama Kitab:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lvl.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-blue-200 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 6: INFORMASI PENDAFTARAN SANTRIWATI BARU */}
        <section className="rounded-3xl p-8 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Penerimaan Siswi Baru
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Informasi Pendaftaran Siswi MPHM
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Pendaftaran siswi baru madrasah dibuka pada setiap awal Tahun Ajaran Diniyyah baru
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Syarat Berkas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fotokopi KK, NIK, Pasfoto resmi 3x4, serta rekomendasi dari pengurus pondok domisili.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Tes Penempatan Kelas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ujian kemampuan membaca Al-Qur&apos;an, Pegon, Tajwid, dan dasar-dasar bahasa Arab untuk penentuan rombel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Registrasi Ulang</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penerbitan Nomor Induk Siswi (NIS), pembagian Rombel, dan penyerahan Kitab Pegangan Diniyyah.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-blue-500/30 p-1">
              <Image src="/logo.png" alt="Logo MPHM" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Madrasah Putri Hidayatul Mubtadi&apos;aat (MPHM)</p>
              <p className="text-[11px] text-slate-400">Pondok Pesantren Lirboyo Kediri - Jawa Timur 64117</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <a href="/loginsekr" className="hover:text-blue-400 transition-colors">
              Sekretariat
            </a>
            <span>•</span>
            <a href="/loginStaff" className="hover:text-indigo-400 transition-colors">
              Mustahiq
            </a>
            <span>•</span>
            <a href="/loginStaff" className="hover:text-purple-400 transition-colors">
              Pengurus
            </a>
            <span>•</span>
            <a href="/loginguardiant" className="hover:text-emerald-400 transition-colors">
              Wali Santri
            </a>
          </div>

          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} MPHM Lirboyo Kediri. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

      {/* FLOATING AI CHATBOT DRAWER (ASISTEN MUBTADI'AAT) */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isAiOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[90vw] max-w-sm sm:max-w-md h-[500px] rounded-3xl bg-slate-900/95 border border-blue-500/40 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden ring-1 ring-blue-500/30"
            >
              {/* Drawer Header */}
              <div className="px-4 py-3.5 bg-gradient-to-r from-blue-950 to-slate-900 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Asisten Resmi MPHM</h4>
                    <p className="text-[10px] text-blue-300 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAiOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-sans">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-slate-800 text-slate-200 border border-white/10 rounded-bl-xs"
                      }`}
                    >
                      {msg.content || (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menulis tanggapan...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 border-t border-white/5 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() => handleSendAiMessage("Apa saja jenjang pendidikan di MPHM?")}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-white/5"
                >
                  Jenjang Diniyyah?
                </button>
                <button
                  onClick={() => handleSendAiMessage("Bagaimana cara login Wali Santri?")}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-white/5"
                >
                  Login Wali Santri?
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="p-3 border-t border-white/10 bg-slate-950 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ketik pertanyaan seputar MPHM..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  disabled={isChatStreaming}
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isChatStreaming}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAiOpen(true)}
              className="px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-2xl shadow-blue-950/80 flex items-center gap-2.5 border border-blue-400/30 backdrop-blur-xl"
            >
              <div className="relative">
                <Bot className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
              </div>
              <span>Tanya Asisten MPHM</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
