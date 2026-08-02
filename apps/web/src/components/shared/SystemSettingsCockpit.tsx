"use client";

import { useState, useEffect } from "react";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ToastContext";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, RefreshCw, XCircle, Pin, BookOpen, Lock, Unlock, Clock, Download, Sparkles,
  Settings, Users, Database, Sliders, MapPin, Calculator, Briefcase, Plus, X, AlertCircle, Trash2, Loader2,
  FileText, Send, Save, Key, ShieldAlert, Upload
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
  description?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Format file harus berupa gambar (JPG/PNG/WEBP)");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const processedBlob = await processSignatureImage(file);
      const formData = new FormData();
      formData.append("file", processedBlob, "signature-clean-hd.png");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Gagal mengunggah gambar ke server.");
      }

      const json = await res.json();
      if (json.url) {
        onChange(json.url);
      } else {
        throw new Error("URL gambar tidak dikembalikan oleh server.");
      }
    } catch (err: any) {
      console.error("Signature Upload Error:", err);
      setError(err.message || "Terjadi kesalahan saat pemrosesan gambar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1 max-w-md">
        <span className="text-sm font-black text-zinc-900 dark:text-white block">{label}</span>
        {description && <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>}
        {error && <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {value ? (
          <div className="relative group p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center min-w-28 min-h-16 max-h-20 overflow-hidden">
            <img src={value} alt={label} className="max-h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 font-bold text-xs transition-opacity cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Hapus
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-4 py-2.5 bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Upload className="w-4 h-4" />}
            <span>{loading ? "Memproses RemoveBG..." : "Upload & RemoveBG HD"}</span>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={loading} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}

function FriendlyGuideCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-start gap-3.5 text-blue-900 dark:text-blue-200 shadow-xs">
      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="text-xs sm:text-sm font-black tracking-wide uppercase">{title}</h4>
        <p className="text-xs text-blue-800 dark:text-blue-300/90 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

function FriendlySwitch({
  label,
  description,
  value,
  onChange,
  activeBadge = "AKTIF",
  inactiveBadge = "NON-AKTIF",
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (val: boolean) => void;
  activeBadge?: string;
  inactiveBadge?: string;
}) {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-4">
      <div className="space-y-1 max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{label}</span>
          <span className={`text-[10px] px-2 py-0.5 font-black rounded-full ${
            value ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
  const { activeWorkspace } = useWorkspace();
  const isPondok = activeWorkspace === "pondok";
  
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

  // Cockpit Settings States
  const [settingsTab, setSettingsTab] = useState("workspace");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // 1. Workspace & Authority States
  const [allowMadrasahCutiMandiri, setAllowMadrasahCutiMandiri] = useState(true);
  const [allowPondokBoyongApproval, setAllowPondokBoyongApproval] = useState(true);
  const [lockPondokIdentityFields, setLockPondokIdentityFields] = useState(true);

  // 2. Academic Calendar & Freeze States
  const [activeTahunAjaran, setActiveTahunAjaran] = useState("2026/2027");
  const [activeKwartal, setActiveKwartal] = useState(1);
  const [kwartal1Locked, setKwartal1Locked] = useState(true);
  const [kwartal2Locked, setKwartal2Locked] = useState(true);
  const [kwartal3Locked, setKwartal3Locked] = useState(false);
  const [kwartal4Locked, setKwartal4Locked] = useState(false);

  // 3. Formulasi & Kenaikan
  const [weightHarian, setWeightHarian] = useState(30);
  const [weightKwartal, setWeightKwartal] = useState(50);
  const [weightSyafai, setWeightSyafai] = useState(20);
  const [minPassingScore, setMinPassingScore] = useState(65);
  const [maxRedSubjects, setMaxRedSubjects] = useState(2);

  // 5. Stempel & TTD Digital
  const [pengasuhSignatureUrl, setPengasuhSignatureUrl] = useState("");
  const [kepalaMadrasahSignatureUrl, setKepalaMadrasahSignatureUrl] = useState("");
  const [mufattishSignatureUrl, setMufattishSignatureUrl] = useState("");
  const [officialStampUrl, setOfficialStampUrl] = useState("");

  // 8. WhatsApp Gateway
  const [fonnteApiKey, setFonnteApiKey] = useState("");
  const [whatsappTemplateRapor, setWhatsappTemplateRapor] = useState(
    "Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali Santri, rapor Kwartal {KWARTAL} atas nama {NAMA_SANTRI} telah diterbitkan."
  );
  const [whatsappTemplateBoyong, setWhatsappTemplateBoyong] = useState(
    "Assalamu'alaikum Wr. Wb. Pemberitahuan status kepulangan/boyong santri atas nama {NAMA_SANTRI} telah diperbarui menjadi {STATUS}."
  );
  const [whatsappTemplateAbsensi, setWhatsappTemplateAbsensi] = useState(
    "Assalamu'alaikum Wr. Wb. Rekap presensi dan kedisiplinan harian santriwati {NAMA_SANTRI} telah dicatat oleh pengurus."
  );

  // 9. API Data Wilayah RI
  const [regionApiSource, setRegionApiSource] = useState("cahyadsn");
  const [binderbyteApiKey, setBinderbyteApiKey] = useState("");

  // 10. Keamanan & Backup
  const [systemMaintenance, setSystemMaintenance] = useState(false);
  const [enforceHttps, setEnforceHttps] = useState(true);
  const [cookieLifetime, setCookieLifetime] = useState(30);
  const [autoBackupInterval, setAutoBackupInterval] = useState("daily");

  const [roleConfigs, setRoleConfigs] = useState<Record<RoleTypes, RoleUIConfig>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("system_role_ui_configs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load system_role_ui_configs", e);
        }
      }
    }
    return DEFAULT_ROLE_CONFIGS;
  });

  const [selectedInstitution, setSelectedInstitution] = useState<"MADRASAH" | "PONDOK">(isPondok ? "PONDOK" : "MADRASAH");
  
  // Keep selectedInstitution linked strictly to workspace & ensure valid tab is selected
  useEffect(() => {
    setSelectedInstitution(isPondok ? "PONDOK" : "MADRASAH");
    if (isPondok && (settingsTab === "academic" || settingsTab === "formula")) {
      setSettingsTab("workspace");
    } else if (!isPondok && settingsTab === "pelanggaran") {
      setSettingsTab("workspace");
    }
  }, [isPondok, settingsTab]);

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
    }
  };

  // Strictly segregated control modules by active workspace institution
  const controlModules = isPondok
    ? [
        { id: "workspace", label: "1. Regulasi & Otorisasi Pondok", icon: BookOpen },
        { id: "matrix", label: "2. Pembuatan Role Users Pondok", icon: Lock },
        { id: "signature", label: "3. Stempel & TTD Digital Pondok", icon: Pin },
        { id: "pelanggaran", label: "4. Master Kedisiplinan & Takzir", icon: ShieldAlert },
        { id: "jabatan", label: "5. Struktur Jabatan Pondok (14)", icon: Users },
        { id: "whatsapp", label: "6. WhatsApp Gateway Pondok", icon: RefreshCw },
        { id: "region", label: "7. API Data Wilayah RI", icon: MapPin },
        { id: "system", label: "8. Keamanan & Backup Sistem", icon: Lock },
      ]
    : [
        { id: "workspace", label: "1. Regulasi & Otorisasi Madrasah", icon: BookOpen },
        { id: "academic", label: "2. Kalender & Kwartal Lock", icon: Clock },
        { id: "formula", label: "3. Formulasi & Kenaikan Kelas", icon: Calculator },
        { id: "matrix", label: "4. Pembuatan Role Users Madrasah", icon: Lock },
        { id: "signature", label: "5. Stempel & TTD Digital Madrasah", icon: Pin },
        { id: "jabatan", label: "6. Struktur Jabatan Madrasah (11)", icon: Users },
        { id: "whatsapp", label: "7. WhatsApp Gateway Madrasah", icon: RefreshCw },
        { id: "region", label: "8. API Data Wilayah RI", icon: MapPin },
        { id: "system", label: "9. Keamanan & Backup Sistem", icon: Lock },
      ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header Banner by Institution */}
      <div className={`p-6 sm:p-8 bg-linear-to-r ${isPondok ? "from-emerald-900 via-zinc-900 to-emerald-950 border-emerald-500/30" : "from-blue-900 via-zinc-900 to-indigo-950 border-blue-500/30"} text-white rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden`}>
        <div className="flex flex-col gap-1.5 z-10">
          <div className={`flex items-center gap-2 ${isPondok ? "text-emerald-300" : "text-blue-200"} text-xs font-bold uppercase tracking-wider`}>
            <BookOpen className="w-4 h-4" />
            <span>Pusat Kendali Konfigurasi Terpusat ({controlModules.length} Master Modules)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Konfigurasi Sistem {isPondok ? "Pondok Pesantren P3HM" : "Madrasah Diniyyah MPHM"}
          </h1>
          <p className={`${isPondok ? "text-emerald-100/90" : "text-blue-100/90"} text-xs sm:text-sm max-w-2xl leading-relaxed`}>
            {isPondok 
              ? "Pusat pengaturan parameter keasramaan, regulasi santriwati, master pelanggaran & takzir, serta struktur jabatan khusus Pondok Pesantren P3HM."
              : "Pusat pengaturan parameter akademik Diniyyah MPHM, formulasi nilai Kwartal, kalender akademik, serta struktur jabatan pengajar & staf Madrasah."}
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className={`flex items-center gap-2 px-6 py-3.5 bg-white ${isPondok ? "text-emerald-800 hover:bg-emerald-50" : "text-blue-700 hover:bg-blue-50"} rounded-xl text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 disabled:opacity-50`}
        >
          {updateSettingsMutation.isPending ? (
            <Loader2 className={`w-4 h-4 animate-spin ${isPondok ? "text-emerald-600" : "text-blue-600"}`} />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>Simpan Konfigurasi {isPondok ? "Pondok" : "Madrasah"}</span>
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
          <span>Konfigurasi sistem {isPondok ? "Pondok P3HM" : "Madrasah MPHM"} berhasil disimpan ke database terpusat & didistribusikan secara realtime.</span>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Internal Categorized Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="px-3 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pt-1">
            {isPondok ? "DAFTAR 8 MASTER KENDALI PONDOK" : "DAFTAR 9 MASTER KENDALI MADRASAH"}
          </span>

          <nav className="space-y-1">
            {controlModules.map((mod) => {
              const IconComp = mod.icon;
              const isActive = settingsTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSettingsTab(mod.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? isPondok 
                        ? "bg-emerald-600 text-white shadow-md font-extrabold" 
                        : "bg-blue-600 text-white shadow-md font-extrabold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="truncate">{mod.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full space-y-6">

          {/* 1. Workspace & Instansi */}
          {settingsTab === "workspace" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title={`Regulasi & Hak Akses Instansi (${isPondok ? "Pondok P3HM" : "Madrasah MPHM"})`}
                description={isPondok 
                  ? "Modul ini mengatur kewenangan baku Pondok P3HM atas data identitas santriwati dan persetujuan status boyong. Seluruh data asal Pondok bersumber mutlak dari sini."
                  : "Modul ini mengatur kewenangan Madrasah MPHM dalam mengelola Cuti Pembelajaran dan Kenaikan Kelas secara mandiri tanpa mengubah data induk Pondok."}
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
                <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <BookOpen className={`w-4 h-4 ${isPondok ? "text-emerald-600" : "text-blue-600"}`} />
                  <span>Kewenangan Status & Penguncian Data Identitas {isPondok ? "Pondok" : "Madrasah"}</span>
                </h3>
                <div className="space-y-3">
                  {!isPondok && (
                    <FriendlySwitch
                      label="Status Cuti Siswi Mandiri Madrasah"
                      description="Madrasah berwenang langsung menetapkan status Cuti pembelajaran tanpa memerlukan approval Pondok P3HM."
                      value={allowMadrasahCutiMandiri}
                      onChange={setAllowMadrasahCutiMandiri}
                    />
                  )}
                  {isPondok && (
                    <FriendlySwitch
                      label="Status Boyong Memerlukan Approval Pondok P3HM"
                      description="Pengajuan Boyong wajib disetujui (approve) oleh pihak Pondok P3HM sebelum berubah menjadi Boyong Resmi."
                      value={allowPondokBoyongApproval}
                      onChange={setAllowPondokBoyongApproval}
                    />
                  )}
                  <FriendlySwitch
                    label="Penguncian Form Identitas Tarikan Pondok"
                    description={isPondok 
                      ? "Data Identitas & Alamat asal Pondok P3HM akan terkunci otomatis di form Madrasah untuk menjaga integritas data induk."
                      : "Data Identitas & Alamat Siswi asal P3HM terkunci otomatis di Madrasah untuk mencegah ketidakselarasan data dari sumber Pondok."}
                    value={lockPondokIdentityFields}
                    onChange={setLockPondokIdentityFields}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Kalender & Kwartal Lock Engine (Madrasah Only) */}
          {settingsTab === "academic" && !isPondok && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Kalender Akademik & Penguncian Kwartal Madrasah"
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

          {/* 3. Formulasi & Kenaikan (Madrasah Only) */}
          {settingsTab === "formula" && !isPondok && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Formulasi Nilai & Kriteria Kenaikan Kelas"
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

                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider pt-2">AMBANG BATAS KELULUSAN & KENAIKAN KELAS</h4>
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

          {/* 4. Pembuatan Role Users (Matrix) */}
          {settingsTab === "matrix" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title={`Pembuatan Role Users & Matriks Hak Akses (${isPondok ? "Pondok P3HM" : "Madrasah MPHM"})`}
                description={`Kelola role kustom untuk instansi ${isPondok ? "Pondok" : "Madrasah"} dan atur matriks hak akses menu secara terhubung persisten ke Database.`}
              />
              <CustomRoleMatrixManager />
            </div>
          )}

          {/* 5. Stempel & TTD Digital */}
          {settingsTab === "signature" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title={`Stempel & Tanda Tangan Digital Resmi ${isPondok ? "Pondok (P3HM)" : "Madrasah (MPHM)"}`}
                description={`Unggah file gambar TTD Digital & Stempel resmi ${isPondok ? "Pondok" : "Madrasah"}. Sistem secara otomatis memproses transparansi latar belakang (RemoveBG HD) dan menyimpannya ke Database.`}
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
                {isPondok ? (
                  <>
                    <SignatureImageUploader
                      label="Tanda Tangan Digital Pengasuh Pondok P3HM"
                      description="Digunakan pada pencetakan Sertifikat & Surat Keterangan Resmi Pondok P3HM Lirboyo."
                      value={pengasuhSignatureUrl}
                      onChange={setPengasuhSignatureUrl}
                    />
                    <SignatureImageUploader
                      label="Stempel Resmi Pondok P3HM"
                      description="Stempel resmi yang otomatis disematkan pada dokumen keasramaan & perizinan Pondok P3HM."
                      value={officialStampUrl}
                      onChange={setOfficialStampUrl}
                    />
                  </>
                ) : (
                  <>
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
                      label="Stempel Resmi Madrasah MPHM"
                      description="Stempel resmi yang otomatis disematkan pada Dokumen Siswi, Rapor Kwartal, & Ijazah."
                      value={officialStampUrl}
                      onChange={setOfficialStampUrl}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* 6. Master Kedisiplinan (Pondok Only) */}
          {settingsTab === "pelanggaran" && isPondok && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="Master Kedisiplinan & Poin Pelanggaran Pondok P3HM"
                description="Kelola kategori poin sanksi kedisiplinan dan takzir santriwati keasramaan di Pondok Pesantren P3HM."
              />
              <MasterPelanggaranTab />
            </div>
          )}

          {/* 7. Struktur Jabatan Baku (Separated strictly by Institution) */}
          {settingsTab === "jabatan" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title={`Struktur Jabatan Baku (${isPondok ? "14 Jabatan Pondok P3HM" : "11 Jabatan Madrasah MPHM"})`}
                description={`Kelola struktur jabatan baku untuk ${isPondok ? "Pengurus & Staf Pondok P3HM" : "Pengurus & Pengajar Madrasah MPHM"} secara terikat pada instansi Anda.`}
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <Users className={`w-5 h-5 ${isPondok ? "text-emerald-500" : "text-blue-500"}`} />
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                    {isPondok ? "Daftar 14 Jabatan Baku Pondok P3HM" : "Daftar 11 Jabatan Baku Madrasah MPHM"}
                  </h4>
                </div>
                <div className="space-y-2.5">
                  {structuralJabatanList.filter(j => j.institution === (isPondok ? "PONDOK" : "MADRASAH")).map(j => (
                    <div key={j.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50 rounded-xl flex items-center justify-between shadow-xs">
                      <span className="text-xs font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${isPondok ? "bg-emerald-500" : "bg-blue-500"}`} />
                        {j.jabatan}
                      </span>
                      <button onClick={() => handleRemoveJabatan(j.id)} className="text-xs text-rose-600 font-bold hover:underline cursor-pointer">
                        Hapus
                      </button>
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
                title={`WhatsApp Gateway & Notifikasi Wali Santri (${isPondok ? "Pondok P3HM" : "Madrasah MPHM"})`}
                description={`Konfigurasi token gateway Fonnte / Wablas untuk pengiriman pesan pengumuman otomatis ke orang tua / wali santri khusus instansi ${isPondok ? "Pondok" : "Madrasah"}.`}
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Fonnte / Gateway API Token *</label>
                  <input type="password" value={fonnteApiKey} onChange={(e) => setFonnteApiKey(e.target.value)} placeholder="Masukkan API Token..." className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono dark:text-white" />
                </div>
                {!isPondok ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Template Pesan Rapor Terbit</label>
                      <textarea rows={3} value={whatsappTemplateRapor} onChange={(e) => setWhatsappTemplateRapor(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Template Pesan Rekap Absensi Kelas</label>
                      <textarea rows={3} value={whatsappTemplateAbsensi} onChange={(e) => setWhatsappTemplateAbsensi(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium dark:text-white" />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Template Pesan Status Boyong & Perizinan Pondok</label>
                    <textarea rows={3} value={whatsappTemplateBoyong} onChange={(e) => setWhatsappTemplateBoyong(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium dark:text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 9. API Data Wilayah RI */}
          {settingsTab === "region" && (
            <div className="space-y-6">
              <FriendlyGuideCard
                title="API Data Wilayah Indonesia & Eksternal"
                description="Pilih penyedia API data wilayah administratif (Provinsi, Kabupaten, Kecamatan, Kelurahan) untuk pengisian alamat santriwati."
              />
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Penyedia API Wilayah *</label>
                  <select value={regionApiSource} onChange={(e) => setRegionApiSource(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white cursor-pointer">
                    <option value="cahyadsn">Cahyadsn API (Rekomendasi - Gratis & Cepat)</option>
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
                title="Keamanan Sistem, Backup & Emergency Lock"
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
