"use client";

import { useState, useEffect } from "react";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, RefreshCw, XCircle, Pin, BookOpen, Lock, Unlock, Clock, Download, Sparkles,
  Settings, Users, Database, Sliders, MapPin, Calculator, Briefcase, Plus, X, AlertCircle, Trash2, Loader2,
  FileText, Send, Save, Key, ShieldAlert
} from "lucide-react";
import { MasterPelanggaranTab } from "@/features/sekretariat/components/MasterPelanggaranTab";
import { 
  DEFAULT_ROLE_CONFIGS, 
  RoleTypes, 
  RoleUIConfig, 
} from "@/lib/useRoleUIConfig";
import { StructuralJabatan, DEFAULT_STRUCTURAL_JABATAN } from "@/config/jobPositions.config";
import { CustomRoleMatrixManager } from "./CustomRoleMatrixManager";

// Helper: Process white/light background out of signature scan into clean transparent PNG HD
async function processSignatureImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Convert white/light gray background to transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 190 && g > 190 && b > 190) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else resolve(file);
      }, "image/png");
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

function SignatureImageUploader({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Process client-side RemoveBG canvas transparency
      const processedBlob = await processSignatureImage(file);

      // 2. Fetch signature from API
      const sigRes = await fetch("/api/media/signature");
      if (!sigRes.ok) throw new Error("Gagal mengambil token upload Database.");
      const sigData = await sigRes.json();
      if (sigData.status !== "Success") throw new Error(sigData.message || "Gagal mendapatkan token.");

      const { signature, timestamp, apiKey, cloudName, folder } = sigData.data;

      // 3. Upload file
      const formData = new FormData();
      formData.append("file", processedBlob, "signature.png");
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!cloudinaryRes.ok) throw new Error("Gagal mengunggah berkas ke Database.");
      const cloudinaryData = await cloudinaryRes.json();
      
      const finalUrl = cloudinaryData.secure_url;
      onChange(finalUrl);
      toast(`${label} berhasil diunggah & diproses (RemoveBG HD)!`, "success", "Berhasil Upload");
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Gagal mengunggah berkas TTD.", "error", "Gagal Upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-3">
      <div>
        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">{label}</h4>
        <p className="text-[11px] text-zinc-500 font-medium">{description}</p>
      </div>

      {value ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="w-36 h-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="max-w-full max-h-full object-contain filter drop-shadow-md" />
          </div>
          <div className="flex flex-col gap-2 flex-1 w-full">
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-xs">{value}</span>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-extrabold cursor-pointer inline-flex items-center gap-1 shadow-xs">
                <Download className="w-3.5 h-3.5" />
                <span>Ganti File TTD / Stempel</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-extrabold cursor-pointer inline-flex items-center gap-1 shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl cursor-pointer bg-white dark:bg-zinc-900 transition-colors group">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-bold">Memproses RemoveBG &amp; Simpan HD ke Database...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <Download className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">Unggah File TTD / Stempel (PNG / JPG)</span>
              <span className="text-[11px] text-zinc-500">Otomatis diproses HD &amp; Latar Belakang Putih Dihapus (RemoveBG Transparent)</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
        </label>
      )}
    </div>
  );
}

function FriendlyGuideCard({ title, description, steps }: { title: string; description: string; steps?: string[] }) {
  return (
    <div className="p-5 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2 shadow-xs mb-6">
      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 font-extrabold text-sm">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Ketentuan &amp; Petunjuk Sistem: {title}</span>
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
        {description}
      </p>
      {steps && steps.length > 0 && (
        <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 pt-1 list-disc list-inside">
          {steps.map((s, i) => (
            <li key={i} className="leading-snug">{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FriendlySwitch({ 
  label, 
  description, 
  value, 
  onChange, 
  activeBadge = "AKTIF", 
  inactiveBadge = "NON-AKTIF" 
}: { 
  label: string; 
  description?: string; 
  value: boolean; 
  onChange: (val: boolean) => void;
  activeBadge?: string;
  inactiveBadge?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="space-y-0.5 max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">{label}</span>
          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
            value 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
              : "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20"
          }`}>
            {value ? activeBadge : inactiveBadge}
          </span>
        </div>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          value ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          value ? "translate-x-5" : "translate-x-0"
        }`} />
      </button>
    </div>
  );
}

export function SystemSettingsCockpit() {
  const { settings, refetchSettings } = useSystemSettings();
  const { toast } = useToast();
  
  const updateSettingsMutation = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    mutationFn: async (payload: Record<string, any>) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      refetchSettings();
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      toast("Pengaturan sistem berhasil disimpan ke database terpusat.", "success", "Berhasil");
    },
    onError: () => {
      toast("Gagal menyimpan pengaturan ke server. Silakan coba lagi.", "error", "Gagal");
    }
  });

  // Cockpit Settings States (10 Master Control Modules)
  const [settingsTab, setSettingsTab] = useState("workspace");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // 1. Workspace & Authority States
  const [allowMadrasahCutiMandiri, setAllowMadrasahCutiMandiri] = useState(true);
  const [allowPondokBoyongApproval, setAllowPondokBoyongApproval] = useState(true);
  const [lockPondokIdentityFields, setLockPondokIdentityFields] = useState(true);

  // 2. Academic Calendar & Freeze States
  const [activeTahunAjaran, setActiveTahunAjaran] = useState("2026/2027");
  const [activeKwartal, setActiveKwartal] = useState(1);
  const [kwartal1Locked, setKwartal1Locked] = useState(false);
  const [kwartal2Locked, setKwartal2Locked] = useState(false);
  const [kwartal3Locked, setKwartal3Locked] = useState(false);
  const [kwartal4Locked, setKwartal4Locked] = useState(false);

  // 3. Grading Formula & Promotion Criteria States
  const [weightHarian, setWeightHarian] = useState(30);
  const [weightKwartal, setWeightKwartal] = useState(40);
  const [weightSyafai, setWeightSyafai] = useState(30);
  const [minPassingScore, setMinPassingScore] = useState(70);
  const [maxRedSubjects, setMaxRedSubjects] = useState(2);

  // 5. Official E-Signature & Stamp States
  const [pengasuhSignatureUrl, setPengasuhSignatureUrl] = useState("");
  const [kepalaMadrasahSignatureUrl, setKepalaMadrasahSignatureUrl] = useState("");
  const [mufattishSignatureUrl, setMufattishSignatureUrl] = useState("");
  const [officialStampUrl, setOfficialStampUrl] = useState("");

  // 8. WhatsApp Gateway States
  const [fonnteApiKey, setFonnteApiKey] = useState("");
  const [whatsappTemplateRapor, setWhatsappTemplateRapor] = useState("Yth. Wali Santri {nama_santri}, Rapor Diniyyah Kwartal {kwartal} Tahun Ajaran {tahun_ajaran} telah terbit...");
  const [whatsappTemplateBoyong, setWhatsappTemplateBoyong] = useState("Pemberitahuan Status Boyong Santri {nama_santri}: {status}...");
  const [whatsappTemplateAbsensi, setWhatsappTemplateAbsensi] = useState("Rekap Kehadiran Santri {nama_santri}: Hadir {hadir}, Izin {izin}, Alpha {alpha}...");

  // 9. API Data Wilayah States
  const [regionApiSource, setRegionApiSource] = useState("cahyadsn");
  const [binderbyteApiKey, setBinderbyteApiKey] = useState("8e49f28e0f2f2cf56393c352613eec358e85fb7077ce6f7f453ebb826a7b1f6d");

  // 10. System Security & Maintenance States
  const [systemMaintenance, setSystemMaintenance] = useState(false);
  const [enforceHttps, setEnforceHttps] = useState(true);
  const [cookieLifetime, setCookieLifetime] = useState(30);
  const [autoBackupInterval, setAutoBackupInterval] = useState("daily");

  // Roles & Positions States
  const [roleConfigs, setRoleConfigs] = useState<Record<RoleTypes, RoleUIConfig>>(() => {
    const base = JSON.parse(JSON.stringify(DEFAULT_ROLE_CONFIGS)) as Record<RoleTypes, RoleUIConfig>;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("system_role_ui_configs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          (Object.keys(base) as RoleTypes[]).forEach((r) => {
            if (parsed[r]) {
              base[r] = {
                ...base[r],
                ...parsed[r],
                welcomeBanner: parsed[r].welcomeBanner || base[r].welcomeBanner || "",
                navigationStyle: parsed[r].navigationStyle || base[r].navigationStyle || "sidebar",
                capabilities: { ...(base[r].capabilities || {}), ...(parsed[r].capabilities || {}) }
              };
            }
          });
        } catch (e) {
          console.error("Failed to load saved role configs", e);
        }
      }
    }
    return base;
  });

  const [selectedInstitution, setSelectedInstitution] = useState<"MADRASAH" | "PONDOK">("MADRASAH");
  const [structuralJabatanList, setStructuralJabatanList] = useState<StructuralJabatan[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("structural_job_positions");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load structural_job_positions", e);
        }
      }
    }
    return DEFAULT_STRUCTURAL_JABATAN;
  });

  const handleRemoveJabatan = (id: string) => {
    setStructuralJabatanList((prev) => prev.filter((j) => j.id !== id));
  };

  const parseBool = (v: unknown) => v === "true" || v === true;

  // Sync DB settings on load
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      queueMicrotask(() => {
        if (settings.allowMadrasahCutiMandiri !== undefined) setAllowMadrasahCutiMandiri(parseBool(settings.allowMadrasahCutiMandiri));
        if (settings.allowPondokBoyongApproval !== undefined) setAllowPondokBoyongApproval(parseBool(settings.allowPondokBoyongApproval));
        if (settings.lockPondokIdentityFields !== undefined) setLockPondokIdentityFields(parseBool(settings.lockPondokIdentityFields));

        if (settings.activeTahunAjaran !== undefined) setActiveTahunAjaran(String(settings.activeTahunAjaran));
        if (settings.activeKwartal !== undefined) setActiveKwartal(Number(settings.activeKwartal));
        if (settings.kwartal1Locked !== undefined) setKwartal1Locked(parseBool(settings.kwartal1Locked));
        if (settings.kwartal2Locked !== undefined) setKwartal2Locked(parseBool(settings.kwartal2Locked));
        if (settings.kwartal3Locked !== undefined) setKwartal3Locked(parseBool(settings.kwartal3Locked));
        if (settings.kwartal4Locked !== undefined) setKwartal4Locked(parseBool(settings.kwartal4Locked));

        if (settings.weightHarian !== undefined) setWeightHarian(Number(settings.weightHarian));
        if (settings.weightKwartal !== undefined) setWeightKwartal(Number(settings.weightKwartal));
        if (settings.weightSyafai !== undefined) setWeightSyafai(Number(settings.weightSyafai));
        if (settings.minPassingScore !== undefined) setMinPassingScore(Number(settings.minPassingScore));
        if (settings.maxRedSubjects !== undefined) setMaxRedSubjects(Number(settings.maxRedSubjects));

        if (settings.pengasuhSignatureUrl !== undefined) setPengasuhSignatureUrl(String(settings.pengasuhSignatureUrl));
        if (settings.kepalaMadrasahSignatureUrl !== undefined) setKepalaMadrasahSignatureUrl(String(settings.kepalaMadrasahSignatureUrl));
        if (settings.mufattishSignatureUrl !== undefined) setMufattishSignatureUrl(String(settings.mufattishSignatureUrl));
        if (settings.officialStampUrl !== undefined) setOfficialStampUrl(String(settings.officialStampUrl));

        if (settings.fonnteApiKey !== undefined) setFonnteApiKey(String(settings.fonnteApiKey));
        if (settings.whatsappTemplateRapor !== undefined) setWhatsappTemplateRapor(String(settings.whatsappTemplateRapor));
        if (settings.whatsappTemplateBoyong !== undefined) setWhatsappTemplateBoyong(String(settings.whatsappTemplateBoyong));
        if (settings.whatsappTemplateAbsensi !== undefined) setWhatsappTemplateAbsensi(String(settings.whatsappTemplateAbsensi));

        if (settings.regionApiSource !== undefined) setRegionApiSource(String(settings.regionApiSource));
        if (settings.binderbyteApiKey !== undefined) setBinderbyteApiKey(String(settings.binderbyteApiKey));

        if (settings.systemMaintenance !== undefined) setSystemMaintenance(parseBool(settings.systemMaintenance));
        if (settings.enforceHttps !== undefined) setEnforceHttps(parseBool(settings.enforceHttps));
        if (settings.cookieLifetime !== undefined) setCookieLifetime(Number(settings.cookieLifetime));
        if (settings.autoBackupInterval !== undefined) setAutoBackupInterval(String(settings.autoBackupInterval));

        if (settings.system_role_ui_configs && typeof settings.system_role_ui_configs === "object") {
          setRoleConfigs(settings.system_role_ui_configs);
        }
        if (Array.isArray(settings.structural_job_positions)) {
          setStructuralJabatanList(settings.structural_job_positions);
        }
      });
    }
  }, [settings]);

  const handleSaveSettings = () => {
    const payload = {
      allowMadrasahCutiMandiri,
      allowPondokBoyongApproval,
      lockPondokIdentityFields,
      activeTahunAjaran,
      activeKwartal,
      kwartal1Locked,
      kwartal2Locked,
      kwartal3Locked,
      kwartal4Locked,
      weightHarian,
      weightKwartal,
      weightSyafai,
      minPassingScore,
      maxRedSubjects,
      pengasuhSignatureUrl,
      kepalaMadrasahSignatureUrl,
      mufattishSignatureUrl,
      officialStampUrl,
      fonnteApiKey,
      whatsappTemplateRapor,
      whatsappTemplateBoyong,
      whatsappTemplateAbsensi,
      regionApiSource,
      binderbyteApiKey,
      systemMaintenance,
      enforceHttps,
      cookieLifetime,
      autoBackupInterval,
      system_role_ui_configs: roleConfigs,
      structural_job_positions: structuralJabatanList,
    };
    
    updateSettingsMutation.mutate(payload);

    if (typeof window !== "undefined") {
      localStorage.setItem("allowMadrasahCutiMandiri", String(allowMadrasahCutiMandiri));
      localStorage.setItem("allowPondokBoyongApproval", String(allowPondokBoyongApproval));
      localStorage.setItem("lockPondokIdentityFields", String(lockPondokIdentityFields));
      localStorage.setItem("activeTahunAjaran", activeTahunAjaran);
      localStorage.setItem("activeKwartal", String(activeKwartal));
      localStorage.setItem("kwartal1Locked", String(kwartal1Locked));
      localStorage.setItem("kwartal2Locked", String(kwartal2Locked));
      localStorage.setItem("kwartal3Locked", String(kwartal3Locked));
      localStorage.setItem("kwartal4Locked", String(kwartal4Locked));
      localStorage.setItem("systemMaintenance", String(systemMaintenance));
      localStorage.setItem("structural_job_positions", JSON.stringify(structuralJabatanList));
      localStorage.setItem("system_role_ui_configs", JSON.stringify(roleConfigs));
      window.dispatchEvent(new Event("structural_job_positions_changed"));
      window.dispatchEvent(new Event("role_configs_changed"));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Pusat Kendali Konfigurasi Terpadu (10 Master Modules)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Konfigurasi Sistem P3HM &amp; MPHM
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Pusat pengaturan parameter keasramaan Pondok P3HM, akademik Diniyyah MPHM, formulasi nilai, penutupan Kwartal, WhatsApp Gateway, &amp; otorisasi sistem terintegrasi.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="flex items-center gap-2 px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 disabled:opacity-50"
        >
          {updateSettingsMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>Simpan Konfigurasi Terpusat</span>
        </button>
      </div>

      {settingsSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xs"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>Konfigurasi sistem berhasil disimpan ke database terpusat &amp; didistribusikan secara realtime.</span>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Internal Categorized Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="px-3 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pt-1">
            DAFTAR 10 MASTER KENDALI
          </span>

          <nav className="space-y-1">
            <button
              onClick={() => setSettingsTab("workspace")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "workspace" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>1. Dikotomi Workspace</span>
            </button>

            <button
              onClick={() => setSettingsTab("academic")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "academic" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>2. Kalender &amp; Kwartal Lock</span>
            </button>

            <button
              onClick={() => setSettingsTab("formula")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "formula" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>3. Formulasi &amp; Kenaikan</span>
            </button>

            <button
              onClick={() => setSettingsTab("matrix")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "matrix" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>4. Pembuatan Role Users</span>
            </button>

            <button
              onClick={() => setSettingsTab("signature")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "signature" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Pin className="w-4 h-4 shrink-0" />
              <span>5. Stempel &amp; TTD Digital</span>
            </button>

            <button
              onClick={() => setSettingsTab("pelanggaran")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "pelanggaran" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Pin className="w-4 h-4 shrink-0" />
              <span>6. Master Kedisiplinan</span>
            </button>

            <button
              onClick={() => setSettingsTab("jabatan")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "jabatan" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>7. Struktur Jabatan Baku</span>
            </button>

            <button
              onClick={() => setSettingsTab("whatsapp")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "whatsapp" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>8. WhatsApp Gateway</span>
            </button>

            <button
              onClick={() => setSettingsTab("region")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "region" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>9. API Data Wilayah RI</span>
            </button>

            <button
              onClick={() => setSettingsTab("system")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "system" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>10. Keamanan &amp; Backup</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full space-y-6">

          {/* 1. Workspace & Instansi */}
          {settingsTab === "workspace" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 1: Dikotomi Workspace & Hak Akses Instansi"
                description="Modul ini mengatur kewenangan baku antara Pondok Pesantren P3HM dan Madrasah MPHM. Data identitas santriwati terikat otomatis dari Pondok, sedangkan Cuti Pembelajaran dan Kenaikan Kelas dikelola mandiri oleh Madrasah."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
                <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Kewenangan Status &amp; Penguncian Data Identitas</span>
                </h3>
                <div className="space-y-3">
                  <FriendlySwitch
                    label="Status Cuti Siswi Mandiri Madrasah"
                    description="Madrasah berwenang langsung menetapkan status Cuti pembelajaran tanpa memerlukan approval Pondok P3HM."
                    value={allowMadrasahCutiMandiri}
                    onChange={setAllowMadrasahCutiMandiri}
                  />
                  <FriendlySwitch
                    label="Status Boyong Memerlukan Approval Pondok P3HM"
                    description="Pengajuan Boyong oleh Madrasah wajib disetujui (approve) oleh pihak Pondok P3HM sebelum berubah menjadi Boyong Resmi."
                    value={allowPondokBoyongApproval}
                    onChange={setAllowPondokBoyongApproval}
                  />
                  <FriendlySwitch
                    label="Penguncian Form Identitas Tarikan Pondok"
                    description="Data Identitas &amp; Alamat Siswi asal P3HM terkunci otomatis di Madrasah untuk mencegah ketidakselarasan data."
                    value={lockPondokIdentityFields}
                    onChange={setLockPondokIdentityFields}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Kalender & Kwartal Lock Engine */}
          {settingsTab === "academic" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 2: Kalender Akademik & Penguncian Kwartal"
                description="Kunci input nilai per Kwartal untuk mencegah modifikasi nilai oleh Mustahiq setelah batas waktu pengesahan Mufattish berakhir."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tahun Ajaran Aktif *</label>
                    <input
                      type="text"
                      value={activeTahunAjaran}
                      onChange={(e) => setActiveTahunAjaran(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Kwartal Berjalan *</label>
                    <select
                      value={activeKwartal}
                      onChange={(e) => setActiveKwartal(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white cursor-pointer"
                    >
                      <option value={1}>Kwartal 1 (Ganjil Awal)</option>
                      <option value={2}>Kwartal 2 (Ganjil Akhir)</option>
                      <option value={3}>Kwartal 3 (Genap Awal)</option>
                      <option value={4}>Kwartal 4 (Genap Akhir / Final)</option>
                    </select>
                  </div>
                </div>

                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider pt-2">STATUS KUNCI INPUT NILAI KWARTAL</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FriendlySwitch label="Kunci Nilai Kwartal 1" value={kwartal1Locked} onChange={setKwartal1Locked} activeBadge="TERKUNCI" inactiveBadge="TERBUKA" />
                  <FriendlySwitch label="Kunci Nilai Kwartal 2" value={kwartal2Locked} onChange={setKwartal2Locked} activeBadge="TERKUNCI" inactiveBadge="TERBUKA" />
                  <FriendlySwitch label="Kunci Nilai Kwartal 3" value={kwartal3Locked} onChange={setKwartal3Locked} activeBadge="TERKUNCI" inactiveBadge="TERBUKA" />
                  <FriendlySwitch label="Kunci Nilai Kwartal 4" value={kwartal4Locked} onChange={setKwartal4Locked} activeBadge="TERKUNCI" inactiveBadge="TERBUKA" />
                </div>
              </div>
            </div>
          )}

          {/* 3. Formulasi & Kenaikan */}
          {settingsTab === "formula" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 3: Formulasi Nilai & Kriteria Kenaikan Kelas"
                description="Tentukan persentase bobot penilaian Diniyyah serta ambang batas Kriteria Ketuntasan Tujuan Pembelajaran (KKTP) dan syarat Naik Kelas."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">BOBOT PERSENTASE PENILAIAN (%)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nilai Harian (%)</label>
                    <input type="number" value={weightHarian} onChange={(e) => setWeightHarian(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Ujian Kwartal (%)</label>
                    <input type="number" value={weightKwartal} onChange={(e) => setWeightKwartal(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Ujian Syafa'i (%)</label>
                    <input type="number" value={weightSyafai} onChange={(e) => setWeightSyafai(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black dark:text-white" />
                  </div>
                </div>

                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider pt-2">AMBANG BATAS KELULUSAN &amp; KENAIKAN KELAS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nilai Kelulusan Minimal (KKTP)</label>
                    <input type="number" value={minPassingScore} onChange={(e) => setMinPassingScore(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Maksimal Mapel Merah (Naik Kelas)</label>
                    <input type="number" value={maxRedSubjects} onChange={(e) => setMaxRedSubjects(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black dark:text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Pembuatan Role Users */}
          {settingsTab === "matrix" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 4: Pembuatan Role Users & Matriks Hak Akses"
                description="Kelola dan buat role kustom baru yang diambil langsung dari jabatan pengurus/staf di database, serta atur matriks otorisasi dan hak akses per menu secara terhubung persisten ke Database."
              />
              <CustomRoleMatrixManager />
            </div>
          )}

          {/* 5. Stempel & TTD Digital (Server File Uploader + RemoveBG HD) */}
          {settingsTab === "signature" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 5: Stempel & Tanda Tangan Digital Resmi (HD Auto RemoveBG)"
                description="Unggah file gambar TTD Digital & Stempel resmi instansi. Sistem secara otomatis memproses transparansi latar belakang (RemoveBG HD) dan menyimpannya ke Database."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
                <SignatureImageUploader
                  label="Tanda Tangan Digital Pengasuh Pondok P3HM"
                  description="Digunakan pada pencetakan Sertifikat & Surat Keterangan Resmi Pondok P3HM Lirboyo."
                  value={pengasuhSignatureUrl}
                  onChange={setPengasuhSignatureUrl}
                />

                <SignatureImageUploader
                  label="Tanda Tangan Digital Kepala Madrasah MPHM"
                  description="Digunakan pada pencetakan Rapor Diniyyah, Ijazah Kelulusan, & Transkrip Nilai MPHM."
                  value={kepalaMadrasahSignatureUrl}
                  onChange={setKepalaMadrasahSignatureUrl}
                />

                <SignatureImageUploader
                  label="Tanda Tangan Digital Mufattish Nilai"
                  description="Digunakan sebagai pengesahan sah hasil penilaian kwartal Diniyyah."
                  value={mufattishSignatureUrl}
                  onChange={setMufattishSignatureUrl}
                />

                <SignatureImageUploader
                  label="Stempel Resmi Instansi"
                  description="Stempel resmi yang otomatis disematkan pada Dokumen Siswi, Rapor, & Ijazah."
                  value={officialStampUrl}
                  onChange={setOfficialStampUrl}
                />
              </div>
            </div>
          )}

          {/* 6. Master Kedisiplinan */}
          {settingsTab === "pelanggaran" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 6: Master Kedisiplinan & Poin Pelanggaran"
                description="Kelola kategori poin sanksi kedisiplinan santriwati keasramaan di Pondok Pesantren P3HM."
              />
              <MasterPelanggaranTab />
            </div>
          )}

          {/* 7. Struktur Jabatan Baku */}
          {settingsTab === "jabatan" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 7: Struktur Jabatan Pengurus & Pengajar"
                description="Kelola 14 Jabatan Baku Pengurus Pondok P3HM & 11 Jabatan Baku Pengurus Madrasah MPHM secara mandiri."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedInstitution("MADRASAH")} className={`px-4 py-2 text-xs font-bold rounded-xl ${selectedInstitution === "MADRASAH" ? "bg-blue-600 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"}`}>Jabatan Madrasah MPHM (11)</button>
                  <button onClick={() => setSelectedInstitution("PONDOK")} className={`px-4 py-2 text-xs font-bold rounded-xl ${selectedInstitution === "PONDOK" ? "bg-emerald-600 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"}`}>Jabatan Pondok P3HM (14)</button>
                </div>
                <div className="space-y-2">
                  {structuralJabatanList.filter(j => j.institution === selectedInstitution).map(j => (
                    <div key={j.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">{j.jabatan}</span>
                      <button onClick={() => handleRemoveJabatan(j.id)} className="text-xs text-rose-600 font-bold hover:underline">Hapus</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. WhatsApp Gateway */}
          {settingsTab === "whatsapp" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 8: WhatsApp Gateway & Notifikasi Wali Santri"
                description="Konfigurasi token gateway Fonnte / Wablas untuk pengiriman pesan pengumuman otomatis ke orang tua / wali santri."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Fonnte / Gateway API Token *</label>
                  <input type="password" value={fonnteApiKey} onChange={(e) => setFonnteApiKey(e.target.value)} placeholder="Masukkan API Token..." className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Template Pesan Rapor Terbit</label>
                  <textarea rows={2} value={whatsappTemplateRapor} onChange={(e) => setWhatsappTemplateRapor(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Template Pesan Status Boyong</label>
                  <textarea rows={2} value={whatsappTemplateBoyong} onChange={(e) => setWhatsappTemplateBoyong(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {/* 9. API Data Wilayah RI */}
          {settingsTab === "region" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 9: API Data Wilayah Indonesia & Eksternal"
                description="Pilih penyedia API data wilayah administratif (Provinsi, Kabupaten, Kecamatan, Kelurahan) untuk pengisian alamat santri."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Penyedia API Wilayah *</label>
                  <select value={regionApiSource} onChange={(e) => setRegionApiSource(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white cursor-pointer">
                    <option value="cahyadsn">Cahyadsn API (Rekomendasi - Gratis &amp; Cepat)</option>
                    <option value="binderbyte">Binderbyte API (Berbayar)</option>
                    <option value="kemendagri">Kemendagri Data Referensi Resmi</option>
                  </select>
                </div>
                {regionApiSource === "binderbyte" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Binderbyte API Key</label>
                    <input type="text" value={binderbyteApiKey} onChange={(e) => setBinderbyteApiKey(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono dark:text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 10. Keamanan & Maintenance */}
          {settingsTab === "system" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Modul 10: Keamanan Sistem, Backup & Emergency Lock"
                description="Atur parameter keamanan cookie, HTTPS enforcement, jadwal backup database, serta Emergency Maintenance Lock."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
                <FriendlySwitch
                  label="Emergency System Maintenance Lock"
                  description="Kunci akses seluruh pengguna non-administrator saat pemeliharaan server database berlangsung."
                  value={systemMaintenance}
                  onChange={setSystemMaintenance}
                  activeBadge="TERKUNCI DARURAT"
                  inactiveBadge="NORMAL"
                />
                <FriendlySwitch
                  label="Enforce HTTPS Security Protocol"
                  description="Wajibkan seluruh permintaan melalui protokol aman SSL/HTTPS."
                  value={enforceHttps}
                  onChange={setEnforceHttps}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Masa Aktif Cookie / Sesi (Hari)</label>
                    <input type="number" value={cookieLifetime} onChange={(e) => setCookieLifetime(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Jadwal Auto-Backup Database</label>
                    <select value={autoBackupInterval} onChange={(e) => setAutoBackupInterval(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white cursor-pointer">
                      <option value="daily">Harian (Setiap 24 Jam)</option>
                      <option value="weekly">Mingguan</option>
                      <option value="manual">Manual Saja</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
