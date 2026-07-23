"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, MapPin, UploadCloud, Camera, User, Heart, Award, 
  Calendar, Hash, Phone, FileText, Home, BookOpen, ExternalLink, ShieldCheck, Download
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { IdentityCell } from "@/components/shared/IdentityCell";
import { FallbackAvatar } from "@/components/shared/FallbackAvatar";
import { RegionSelector } from "@/components/shared/RegionSelector";
import { TableActions } from "@/components/shared/TableActions";
import { useSantri, Santri } from "../queries/useSantri";
import { useToast } from "@/components/shared/ToastContext";
import { apiRequest } from "@/lib/api";

interface SiswaTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
  workspace?: "pondok" | "madrasah";
}

export function SantriTab({ onViewDetail, isReadOnly = false, selectedYearId, workspace = "madrasah" }: SiswaTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"aktif" | "alumni" | "mutasi">("aktif");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: queryResult, isLoading, createSantri, updateSantri, deleteSantri } = useSantri(selectedYearId, pageIndex, pageSize, searchQuery, activeSubTab);
  
  const [santriData, setSantriData] = useState<Santri[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    queueMicrotask(() => {
      setPageIndex(0);
    });
  }, [activeSubTab]);

  useEffect(() => {
    if (queryResult) {
      setSantriData(queryResult.data);
      setTotalCount(queryResult.total);
    }
  }, [queryResult?.data, queryResult?.total]);

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [selectedSantriForDetail, setSelectedSantriForDetail] = useState<Santri | null>(null);
  const [detailActiveSection, setDetailActiveSection] = useState<"pribadi" | "akademis" | "alamat" | "wali" | "khidmah" | "berkas">("pribadi");

  // Form States - I. Pribadi
  const [newName, setNewName] = useState("");
  const [newNik, setNewNik] = useState("");
  const [newGender, setNewGender] = useState<"L" | "P">("P");
  const [newBirthPlace, setNewBirthPlace] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Form States - II. Akademis
  const [newStambuk, setNewStambuk] = useState("");
  const [newNis, setNewNis] = useState("");
  const [newNisn, setNewNisn] = useState("");
  const [newJenjang, setNewJenjang] = useState("Tsanawiyyah");
  const [newClass, setNewClass] = useState("Tsanawiyyah I-A");
  const [newEnrollmentYear, setNewEnrollmentYear] = useState(2026);
  const [newExitYear, setNewExitYear] = useState<number | undefined>(undefined);
  const [newGraduationYear, setNewGraduationYear] = useState<number | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");
  const [newAddress, setNewAddress] = useState("");

  // Form States - IV. Wali (Smart KK Mapping)
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianNik, setNewGuardianNik] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [newGuardianRelation, setNewGuardianRelation] = useState<"AYAH" | "IBU" | "WALI">("AYAH");
  const [newFamilyCardNumber, setNewFamilyCardNumber] = useState("");

  // Form States - V. Khidmah
  const [newKhidmahLocation, setNewKhidmahLocation] = useState("Pondok Hidayatul Mubtadi'in");
  const [newKhidmahRole, setNewKhidmahRole] = useState("Pengabdi Asrama");
  const [newKhidmahRoom, setNewKhidmahRoom] = useState("Asrama Aisyah 1");
  const [newKhidmahStart, setNewKhidmahStart] = useState("2026");
  const [newKhidmahEnd, setNewKhidmahEnd] = useState("2027");

  // Media Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingSantri(null);
    setNewName("");
    setNewNik("");
    setNewGender("P");
    setNewBirthPlace("");
    setNewBirthDate("");
    setNewPhoneNumber("");
    setAvatarUrl(null);
    setNewStambuk("");
    setNewNis("");
    setNewNisn("");
    setNewJenjang("Tsanawiyyah");
    setNewClass("Tsanawiyyah I-A");
    setNewEnrollmentYear(new Date().getFullYear());
    setNewExitYear(undefined);
    setNewGraduationYear(undefined);
    setNewStatus("ACTIVE");
    setNewAddress("");
    setNewGuardianName("");
    setNewGuardianNik("");
    setNewGuardianPhone("");
    setNewGuardianRelation("AYAH");
    setNewFamilyCardNumber("");
    setNewKhidmahLocation("Pondok Hidayatul Mubtadi'in");
    setNewKhidmahRole("Pengabdi Asrama");
    setNewKhidmahRoom("Asrama Aisyah 1");
    setNewKhidmahStart("2026");
    setNewKhidmahEnd("2027");
    setUploadFeedback(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (student: Santri) => {
    setEditingSantri(student);
    setNewName(student.name);
    setNewNik(student.nik);
    setNewGender(student.gender);
    setNewBirthPlace(student.birthPlace || "");
    setNewBirthDate(student.birthDate || "");
    setNewPhoneNumber(student.phoneNumber || "");
    setAvatarUrl(student.avatarUrl || null);
    setNewStambuk(student.stambuk);
    setNewNis(student.nis);
    setNewNisn(student.nisn || "");
    setNewClass(student.class);
    setNewEnrollmentYear(student.enrollmentYear);
    setNewGraduationYear(student.graduationYear);
    setNewStatus(student.status);
    setNewAddress(student.address);
    setNewGuardianName(student.guardianName);
    setNewGuardianNik(student.guardianNik || "");
    setNewGuardianPhone(student.guardianPhone);
    setNewGuardianRelation(student.guardianRelation);
    setNewFamilyCardNumber(student.familyCardNumber);
    setUploadFeedback(null);
    setShowFormModal(true);
  };

  const handleDeleteSantri = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data santri ini secara permanen dari sistem?")) {
      try {
        await deleteSantri(id);
        toast("Data santri berhasil dihapus!", "success");
      } catch (_err) {
        toast("Gagal menghapus data santri", "error");
      }
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadFeedback(null);

    try {
      const resSig = await apiRequest<{
        status: string;
        data?: { signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string };
      }>("/api/media/signature", {
        method: "POST",
        body: JSON.stringify({ folder: "mphm/santri" }),
      });

      if (!resSig.data) {
        throw new Error("Gagal mendapatkan signature pengunggahan berkas.");
      }

      const { signature, timestamp, cloudName, apiKey, folder } = resSig.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || "Gagal mengunggah gambar ke Cloudinary.");
      }

      setAvatarUrl(cloudinaryData.secure_url);
      setUploadFeedback("Foto profil berhasil diunggah!");
      toast("Pas foto santri berhasil diunggah ke Cloudinary!", "success");
    } catch (err: unknown) {
      console.error("UPLOAD_ERROR:", err);
      const errMsg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      setUploadFeedback(`Error: ${errMsg}`);
      toast(errMsg, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newNik.trim() || !newStambuk.trim() || !newFamilyCardNumber.trim()) {
      toast("Harap lengkapi semua bidang wajib (*)", "warning");
      return;
    }

    try {
      const payload: Partial<Santri> = {
        name: newName,
        nik: newNik,
        gender: newGender,
        birthPlace: newBirthPlace,
        birthDate: newBirthDate,
        phoneNumber: newPhoneNumber,
        avatarUrl: avatarUrl || undefined,
        stambuk: newStambuk,
        nis: newNis || newStambuk,
        nisn: newNisn,
        class: newClass,
        enrollmentYear: Number(newEnrollmentYear),
        graduationYear: newGraduationYear ? Number(newGraduationYear) : undefined,
        status: newStatus,
        address: newAddress,
        guardianName: newGuardianName,
        guardianNik: newGuardianNik,
        guardianPhone: newGuardianPhone,
        guardianRelation: newGuardianRelation,
        familyCardNumber: newFamilyCardNumber,
      };

      if (editingSantri) {
        await updateSantri({ id: editingSantri.id, data: payload });
        toast(`Data ${newName} berhasil diperbarui!`, "success");
      } else {
        await createSantri(payload as Omit<Santri, "id">);
        toast(`Santri baru ${newName} berhasil didaftarkan!`, "success");
      }

      setShowFormModal(false);
    } catch (_err) {
      toast("Gagal menyimpan data santri.", "error");
    }
  };

  const activeColumns: ColumnDef<Santri, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Santri & Stambuk",
      cell: (info) => (
        <IdentityCell
          name={info.getValue() as string}
          subInfo={`Stambuk: ${info.row.original.stambuk} • Wali: ${info.row.original.guardianName}`}
          stambuk={info.row.original.stambuk}
          avatarUrl={info.row.original.avatarUrl}
        />
      ),
    },
    {
      accessorKey: "class",
      header: workspace === "pondok" ? "Kamar Asrama" : "Kelas & Rombel",
      cell: (info) => (
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {workspace === "pondok" ? `Asrama Aisyah 1 (${info.getValue()})` : (info.getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "familyCardNumber",
      header: "Wali & No. KK (Smart KK)",
      cell: (info) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{info.row.original.guardianName}</span>
          <span className="text-[11px] font-mono text-zinc-500">KK: {info.getValue() as string}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status Keaktifan",
      cell: (info) => <PillBadge label={info.getValue() as string} variant={info.getValue() === "ACTIVE" ? "success" : "warning"} />,
    },
    {
      id: "actions",
      header: "Aksi Management",
      cell: (info) => (
        <TableActions
          onEdit={() => handleOpenEdit(info.row.original)}
          onDelete={() => handleDeleteSantri(info.row.original.id)}
          onMutasi={onViewDetail ? () => onViewDetail(info.row.original as unknown as Record<string, unknown>) : undefined}
          isReadOnly={isReadOnly}
        />
      ),
    },
  ];

  const gridProps = { columns: activeColumns, data: santriData, tableName: "santri_aktif" };

  // Full Export/Import Headers (All 6 Form Sections)
  const excelHeaders = [
    "Nama Lengkap Santriwati",
    "NIK Santri (16 Digit)",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "No. HP / WA Santri",
    "Nomor Stambuk",
    "NIS",
    "NISN",
    "Jenjang Aktif",
    "Kelas Aktif",
    "Tahun Masuk",
    "Tahun Keluar",
    "Tahun Lulus",
    "Status Keaktifan",
    "Alamat Lengkap",
    "Nama Lengkap Wali",
    "Hubungan Keluarga",
    "No. HP / WA Wali",
    "Nomor Kartu Keluarga (KK)",
    "NIK Wali (16 Digit)",
    "Penempatan Khidmah",
    "Jabatan Khidmah",
    "Kamar Khidmah",
    "Tahun Mulai Khidmah",
    "Tahun Keluar Khidmah"
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Manajemen Kesiswaan Enterprise ({workspace.toUpperCase()})</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Induk Santri
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Sistem data induk santriwati 6-Bagian terintegrasi dengan Nomor Stambuk, NIK, Wali (Smart KK), Khidmah, dan Berkas Digital.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 border border-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri Baru</span>
          </button>
        )}
      </div>

      <UniversalDataGrid
        columns={gridProps.columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={gridProps.data as unknown as Record<string, unknown>[]}
        pageCount={Math.ceil(totalCount / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        onRowClick={(row) => setSelectedSantriForDetail(row as unknown as Santri)}
        tableName={gridProps.tableName}
        importExportProps={{
          title: `Data Induk Santri (${workspace.toUpperCase()})`,
          headers: excelHeaders,
          onImportSuccess: async (importedRows) => {
            let successCount = 0;
            for (const r of importedRows) {
              try {
                await createSantri({
                  name: r["Nama Lengkap Santriwati"] || "",
                  nik: r["NIK Santri (16 Digit)"] || "",
                  gender: "P",
                  birthPlace: r["Tempat Lahir"] || "",
                  birthDate: r["Tanggal Lahir"] || "",
                  phoneNumber: r["No. HP / WA Santri"] || "",
                  stambuk: r["Nomor Stambuk"] || "",
                  nis: r["NIS"] || r["Nomor Stambuk"] || "",
                  nisn: r["NISN"] || "",
                  class: r["Kelas Aktif"] || "Tsanawiyyah I-A",
                  enrollmentYear: Number(r["Tahun Masuk"]) || 2026,
                  graduationYear: r["Tahun Lulus"] ? Number(r["Tahun Lulus"]) : undefined,
                  status: r["Status Keaktifan"] || "ACTIVE",
                  address: r["Alamat Lengkap"] || "",
                  mustahiq: "Ustadz Mustahiq",
                  mufattisy: "Ustadz Mufattisy",
                  guardianName: r["Nama Lengkap Wali"] || "Wali Import",
                  guardianRelation: (r["Hubungan Keluarga"] as any) || "AYAH",
                  guardianPhone: r["No. HP / WA Wali"] || "081200000000",
                  familyCardNumber: r["Nomor Kartu Keluarga (KK)"] || "3171010000000000",
                  guardianNik: r["NIK Wali (16 Digit)"] || ""
                });
                successCount++;
              } catch (e) {
                console.error("Gagal import baris:", r, e);
              }
            }
            toast(`${successCount} dari ${importedRows.length} data berhasil diimpor!`, "success");
          }
        }}
      />

      {/* Detail Modal Profil 6-Bagian */}
      <AnimatePresence>
        {selectedSantriForDetail && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSantriForDetail(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 max-h-[92vh] flex flex-col"
            >
              {/* Dynamic Header Profil Santri (Pondok vs Madrasah) */}
              <div className="p-6 bg-linear-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-white/10 flex items-center justify-center">
                    {selectedSantriForDetail.avatarUrl ? (
                      <img src={selectedSantriForDetail.avatarUrl} alt={selectedSantriForDetail.name} className="w-full h-full object-cover" />
                    ) : (
                      <FallbackAvatar name={selectedSantriForDetail.name} size="lg" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-indigo-100">
                        {selectedSantriForDetail.stambuk}
                      </span>
                      <PillBadge label={selectedSantriForDetail.status} variant={selectedSantriForDetail.status === "ACTIVE" ? "success" : "warning"} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">
                      {selectedSantriForDetail.name} <span className="text-sm font-normal text-indigo-200">({selectedSantriForDetail.guardianName})</span>
                    </h2>
                    <p className="text-xs text-indigo-100 font-semibold flex items-center gap-2 justify-center sm:justify-start">
                      {workspace === "pondok" ? (
                        <>
                          <Home className="w-3.5 h-3.5" />
                          <span>Kamar: Asrama Aisyah 1</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Kelas: {selectedSantriForDetail.class}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedSantriForDetail(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigasi Tab 6-Bagian Detail */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-x-auto px-4">
                {[
                  { id: "pribadi", label: "I. Informasi Pribadi" },
                  { id: "akademis", label: "II. Akademis" },
                  { id: "alamat", label: "III. Alamat" },
                  { id: "wali", label: "IV. Wali (Smart KK)" },
                  { id: "khidmah", label: "V. Masa Khidmah" },
                  { id: "berkas", label: "VI. Berkas Penting" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailActiveSection(tab.id as any)}
                    className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      detailActiveSection === tab.id
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                        : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Body Content 6-Bagian */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {detailActiveSection === "pribadi" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Nama Lengkap Santriwati</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.name}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">NIK Santri (16 Digit)</span>
                      <p className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.nik || "-"}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Jenis Kelamin</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">Perempuan</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Tempat, Tanggal Lahir</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                        {selectedSantriForDetail.birthPlace || "-"}, {selectedSantriForDetail.birthDate || "-"}
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 sm:col-span-2">
                      <span className="text-xs text-zinc-400 font-bold uppercase">No. HP / WhatsApp Santri</span>
                      <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedSantriForDetail.phoneNumber || "-"}</p>
                    </div>
                  </div>
                )}

                {detailActiveSection === "akademis" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Nomor Stambuk</span>
                      <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedSantriForDetail.stambuk}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">NIS (Nomor Induk Santri)</span>
                      <p className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.nis}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">NISN (Nasional)</span>
                      <p className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.nisn || "-"}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Jenjang Aktif</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">Tsanawiyyah</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Kelas Aktif</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.class}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Status Keaktifan</span>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{selectedSantriForDetail.status}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Tahun Masuk</span>
                      <p className="text-base font-semibold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.enrollmentYear}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Tahun Keluar</span>
                      <p className="text-base font-semibold text-zinc-900 dark:text-white mt-1">-</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Tahun Lulus</span>
                      <p className="text-base font-semibold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.graduationYear || "-"}</p>
                    </div>
                  </div>
                )}

                {detailActiveSection === "alamat" && (
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="text-xs text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      Alamat Wilayah Kependudukan Lengkap
                    </span>
                    <p className="text-base font-semibold text-zinc-900 dark:text-white leading-relaxed">
                      {selectedSantriForDetail.address || "Alamat lengkap belum dicatat dalam sistem data induk."}
                    </p>
                  </div>
                )}

                {detailActiveSection === "wali" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Nama Lengkap Wali</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.guardianName}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Hubungan Keluarga</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.guardianRelation}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Nomor Kartu Keluarga (KK) *</span>
                      <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedSantriForDetail.familyCardNumber}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">NIK Wali (16 Digit)</span>
                      <p className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-1">{selectedSantriForDetail.guardianNik || "-"}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 sm:col-span-2">
                      <span className="text-xs text-zinc-400 font-bold uppercase">No. WhatsApp Wali</span>
                      <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{selectedSantriForDetail.guardianPhone}</p>
                    </div>
                  </div>
                )}

                {detailActiveSection === "khidmah" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Penempatan Khidmah</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{newKhidmahLocation}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Jabatan Khidmah</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{newKhidmahRole}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Kamar Saat Khidmah</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{newKhidmahRoom}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Masa Pengabdian</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{newKhidmahStart} - {newKhidmahEnd}</p>
                    </div>
                  </div>
                )}

                {detailActiveSection === "berkas" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Camera className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Pas Foto Resmi Santri</p>
                          <span className="text-xs text-zinc-400">Ukuran 3x4 Formal</span>
                        </div>
                      </div>
                      {selectedSantriForDetail.avatarUrl ? (
                        <a href={selectedSantriForDetail.avatarUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" /> View Foto
                        </a>
                      ) : <span className="text-xs text-zinc-400">Belum ada</span>}
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Ijazah Kelulusan</p>
                          <span className="text-xs text-zinc-400">Berkas Resmi Terverifikasi</span>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 font-semibold">Tersimpan di Arsip</span>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Raport Per Kelas / Jenjang</p>
                          <span className="text-xs text-zinc-400">Akses Raport Sakral</span>
                        </div>
                      </div>
                      <button onClick={() => toast("Membuka Raport Sakral...", "info")} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> View Raport
                      </button>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Sertifikat Kelulusan & Prestasi</p>
                          <span className="text-xs text-zinc-400">Dokumen Penghargaan</span>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 font-semibold">Tersimpan di Sertifikat</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-zinc-150 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/50">
                <button
                  onClick={() => setSelectedSantriForDetail(null)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
