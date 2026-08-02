"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileSpreadsheet, Download, Save, Link as LinkIcon, CheckCircle2, RefreshCw, Plus, Trash2 } from "lucide-react";

interface ExcelTemplateDef {
  id: string;
  name: string;
  category: string;
  defaultMenuPath: string;
  fileName: string;
  columns: string[];
  sampleData: string[][];
  description: string;
}

const OFFICIAL_TEMPLATES: ExcelTemplateDef[] = [
  {
    id: "tpl_santri",
    name: "Template Impor Santriwati / Siswi",
    category: "Master Data Santri",
    defaultMenuPath: "/sekretariat/santri",
    fileName: "Template_Impor_Santriwati_MPHM_P3HM.csv",
    columns: ["NIS", "NISN", "NIK", "Nama_Lengkap", "Tempat_Lahir", "Tanggal_Lahir_YYYY-MM-DD", "Gender_L_P", "No_HP_Wali", "Alamat_Lengkap", "Status_Mukim", "Nama_Blok", "Nama_Kamar"],
    sampleData: [
      ["2026001", "0051234567", "3506123456780001", "Siti Maryam Al-Zahra", "Kediri", "2008-05-12", "P", "081234567890", "Jl. KH. Abdul Karim No. 1 Lirboyo", "ASRAMA_PONDOK", "Blok Fatimah", "Fatimah 02"],
      ["2026002", "0051234568", "3506123456780002", "Khadijah Az-Zahra", "Nganjuk", "2008-08-20", "P", "081987654321", "Jl. Sunan Ampel Lirboyo", "ASRAMA_PONDOK", "Blok Aisyah", "Aisyah 01"],
    ],
    description: "Template standar untuk mengunggah biodata santriwati baru atau pemutakhiran data massal.",
  },
  {
    id: "tpl_pengurus",
    name: "Template Impor Data Pengurus",
    category: "Organisasi & Pengurus",
    defaultMenuPath: "/sekretariat/pengurus",
    fileName: "Template_Impor_Pengurus_P3HM_Lirboyo.csv",
    columns: ["Username", "Nama_Lengkap", "Gender_L_P", "Role_Jabatan", "Instansi", "No_HP", "Email"],
    sampleData: [
      ["pengurus_pondok1", "Ning Hj. Hamidah", "P", "Ketua Pengurus Pondok", "P3HM Lirboyo", "081234567890", "hamidah@p3hm.org"],
      ["pengurus_madrasah1", "Ustadz Ahmad Mudrik", "L", "Mustahiq Utama", "MPHM Lirboyo", "081987654321", "mudrik@mphm.org"],
    ],
    description: "Template impor pengurus pondok P3HM dan madrasah MPHM.",
  },
  {
    id: "tpl_mustahiq",
    name: "Template Impor Mustahiq / Guru Diniyyah",
    category: "Akademik & Pengajar",
    defaultMenuPath: "/sekretariat/mustahiq",
    fileName: "Template_Impor_Mustahiq_Guru_MPHM.csv",
    columns: ["Nama_Guru", "NIK", "No_HP", "Jenjang_Diniyyah", "Kelas_Ampuan", "Status"],
    sampleData: [
      ["Ustadz Abdullah Faqih", "3506123456780003", "081333444555", "Ibtida'iyyah", "3 Ula Diniyyah", "ACTIVE"],
      ["Ustadzah Fatimah Khadijah", "3506123456780004", "081666777888", "Tsanawiyyah", "1 Ulya Diniyyah", "ACTIVE"],
    ],
    description: "Template pendaftaran wali kelas & pengajar diniyyah.",
  },
  {
    id: "tpl_nilai",
    name: "Template Impor Nilai Kwartal Diniyyah",
    category: "Penilaian & Raport",
    defaultMenuPath: "/sekretariat/penilaian",
    fileName: "Template_Impor_Nilai_Kwartal_Diniyyah.csv",
    columns: ["NIS", "Nama_Siswi", "Kode_Mapel", "Nama_Mapel", "Kwartal_1", "Kwartal_2", "Kwartal_3", "Kwartal_4"],
    sampleData: [
      ["2026001", "Siti Maryam Al-Zahra", "MPL-001", "Fathul Qorib", "85", "88", "90", "92"],
      ["2026002", "Khadijah Az-Zahra", "MPL-002", "Alfiyyah Ibnu Malik", "78", "82", "85", "88"],
    ],
    description: "Template upload masal nilai kwartal santriwati per mata pelajaran.",
  },
  {
    id: "tpl_kamar",
    name: "Template Impor Data Asrama (Blok & Kamar)",
    category: "Keasramaan",
    defaultMenuPath: "/sekretariat/rooms",
    fileName: "Template_Impor_Kamar_Asrama_P3HM.csv",
    columns: ["Nama_Komplek_Blok", "Nama_Kamar", "Kapasitas_Total", "Nama_Pembina_Musyrifah"],
    sampleData: [
      ["Blok Fatimah", "Fatimah 01", "20", "Ustadzah Aisyah"],
      ["Blok Fatimah", "Fatimah 02", "20", "Ustadzah Aisyah"],
      ["Blok Aisyah", "Aisyah 01", "25", "Ustadzah Maryam"],
    ],
    description: "Template pendaftaran gedung komplek, kamar, dan kapasitas asrama.",
  },
  {
    id: "tpl_pelanggaran",
    name: "Template Impor Pelanggaran & Takzir",
    category: "Kedisiplinan",
    defaultMenuPath: "/sekretariat/pelanggaran",
    fileName: "Template_Impor_Pelanggaran_Takzir.csv",
    columns: ["NIS", "Nama_Santri", "Nama_Pelanggaran", "Kategori_RINGAN_SEDANG_BERAT", "Poin_Takzir", "Tanggal_YYYY-MM-DD", "Catatan"],
    sampleData: [
      ["2026001", "Siti Maryam Al-Zahra", "Terlambat Berjamaah", "RINGAN", "5", "2026-08-01", "Terlambat 10 menit"],
    ],
    description: "Template pencatatan masal riwayat pelanggaran santri.",
  },
];

export function ExcelTemplateManagerTab() {
  const [templateBindings, setTemplateBindings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch current menu bindings from DB
  const fetchBindings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        const settings = json.data || {};
        const storedConfig = settings["menu_excel_templates_config"];
        if (storedConfig) {
          try {
            setTemplateBindings(JSON.parse(storedConfig));
          } catch {
            // fallback
          }
        } else {
          // Initialize defaults
          const init: Record<string, string> = {};
          OFFICIAL_TEMPLATES.forEach((t) => {
            init[t.id] = t.defaultMenuPath;
          });
          setTemplateBindings(init);
        }
      }
    } catch {
      // keep
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBindings();
  }, [fetchBindings]);

  // Generate & Download CSV/XLS File
  const downloadTemplateFile = (tpl: ExcelTemplateDef) => {
    const csvContent = [
      tpl.columns.join(","),
      ...tpl.sampleData.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tpl.fileName;
    a.click();
    URL.revokeObjectURL(url);

    setToastMessage(`Template '${tpl.name}' berhasil digenerate & didownload!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Bindings to DB
  const saveBindingsToDb = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_excel_templates_config: JSON.stringify(templateBindings),
        }),
      });

      if (res.ok) {
        setToastMessage("Pemetaan Template Excel ke Menu Website 100% tersimpan di Database Server!");
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch {
      setToastMessage("Gagal menyimpan pemetaan template ke database.");
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" /> Pembuat & Pemeta Template Excel ke Menu Website
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Buat, unduh, dan petakan template Excel resmi ke setiap menu website. Pengguna di menu terkait dapat langsung mendownload template aktif yang ditetapkan developer.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchBindings}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} /> Reload
            </button>
            <button
              type="button"
              onClick={saveBindingsToDb}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Simpan Ke DB..." : "Simpan Pemetaan Ke DB"}
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Template List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_TEMPLATES.map((tpl) => {
            const mappedPath = templateBindings[tpl.id] || tpl.defaultMenuPath;

            return (
              <div key={tpl.id} className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-white">{tpl.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold rounded-md">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{tpl.description}</p>

                  {/* Columns Preview */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider block">
                      Struktur Kolom ({tpl.columns.length} Kolom):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tpl.columns.map((col, cIdx) => (
                        <span key={cIdx} className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                  {/* Menu Binding Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" /> Dipetakan ke Menu Path Website:
                    </label>
                    <input
                      type="text"
                      value={mappedPath}
                      onChange={(e) => setTemplateBindings({ ...templateBindings, [tpl.id]: e.target.value })}
                      placeholder="/sekretariat/santri"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Download Template Button */}
                  <button
                    type="button"
                    onClick={() => downloadTemplateFile(tpl)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-xs rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Template ({tpl.fileName})
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
