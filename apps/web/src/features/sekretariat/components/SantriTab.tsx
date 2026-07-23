"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, MapPin, UploadCloud, Camera, User, Heart, Award, 
  Calendar, Hash, Phone, FileText, Home, BookOpen, ExternalLink, ShieldCheck, Download, Layers
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { IdentityCell } from "@/components/shared/IdentityCell";
import { FallbackAvatar } from "@/components/shared/FallbackAvatar";
import { RegionSelector } from "@/components/shared/RegionSelector";
import { TableActions } from "@/components/shared/TableActions";
import { useSantri, Santri } from "../queries/useSantri";
import { useClasses } from "../queries/useClasses";
import { useToast } from "@/components/shared/ToastContext";
import { useWorkspace, WorkspaceType } from "@/components/shared/WorkspaceContext";
import { apiRequest } from "@/lib/api";

interface SiswaTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
  workspace?: WorkspaceType;
}

export function SantriTab({ onViewDetail, isReadOnly = false, selectedYearId, workspace: propWorkspace }: SiswaTabProps) {
  let contextWorkspace: WorkspaceType = "madrasah";
  try {
    const ws = useWorkspace();
    contextWorkspace = ws.activeWorkspace;
  } catch (_) {}

  const activeWorkspace = propWorkspace || contextWorkspace;
  const isPondok = activeWorkspace === "pondok";

  const [activeSubTab, setActiveSubTab] = useState<"aktif" | "alumni" | "mutasi">("aktif");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: queryResult, isLoading, createSantri, updateSantri, deleteSantri } = useSantri(selectedYearId, pageIndex, pageSize, searchQuery, activeSubTab);
  const { data: dbClasses = [] } = useClasses(selectedYearId);
  
  const [dbRooms, setDbRooms] = useState<Array<{ id: string; name: string; buildingName: string }>>([]);

  useEffect(() => {
    apiRequest<{ data: Array<{ id: string; name: string; buildingName: string }> }>("/api/admin/rooms")
      .then((res) => {
        if (res.data) setDbRooms(res.data);
      })
      .catch((err) => console.error("Failed to load rooms", err));
  }, []);

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

  // Form States - II. Akademis / Keasramaan (Dynamic Dropdowns)
  const [newStambuk, setNewStambuk] = useState("");
  const [newNis, setNewNis] = useState("");
  const [newNisn, setNewNisn] = useState("");
  const [newJenjang, setNewJenjang] = useState("Tsanawiyyah");
  const [newClass, setNewClass] = useState("Tsanawiyyah I-A");
  const [newRoom, setNewRoom] = useState("Asrama Aisyah 1");
  const [newEnrollmentYear, setNewEnrollmentYear] = useState(2026);
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
  const [newKhidmahLocation, setNewKhidmahLocation] = useState(
    isPondok 
      ? "Pondok Pesantren Putri Hidayatul Mubtadi'aat [P3HM] Lirboyo" 
      : "Madrasah Putri Hidayatul Mubtadi'aat [MPHM] Lirboyo"
  );
  const [newKhidmahRole, setNewKhidmahRole] = useState(isPondok ? "Musyrifah Asrama" : "Pengajar Diniyyah");

  // Media Upload States
  const [uploadingImage, setUploadingImage] = useState(false);

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
    setNewClass(dbClasses[0]?.name || "Tsanawiyyah I-A");
    setNewRoom(dbRooms[0]?.name || "Asrama Aisyah 1");
    setNewEnrollmentYear(new Date().getFullYear());
    setNewGraduationYear(undefined);
    setNewStatus("ACTIVE");
    setNewAddress("");
    setNewGuardianName("");
    setNewGuardianNik("");
    setNewGuardianPhone("");
    setNewGuardianRelation("AYAH");
    setNewFamilyCardNumber("");
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
    setShowFormModal(true);
  };

  const handleDeleteSantri = async (id: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${isPondok ? "santriwati" : "siswi"} ini secara permanen dari sistem?`)) {
      try {
        await deleteSantri(id);
        toast(`Data ${isPondok ? "santriwati" : "siswi"} berhasil dihapus!`, "success");
      } catch (_err) {
        toast(`Gagal menghapus data ${isPondok ? "santriwati" : "siswi"}.`, "error");
      }
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
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
      toast("Pas foto berhasil diunggah ke Cloudinary!", "success");
    } catch (err: unknown) {
      console.error("UPLOAD_ERROR:", err);
      const errMsg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
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
        await createSantri({
          ...(payload as Omit<Santri, "id">),
          mustahiq: isPondok ? "Ustadzah Musyrifah" : "Ustadz Mustahiq",
          mufattisy: "Ustadz Mufattisy",
        });
        toast(`${isPondok ? "Santriwati" : "Siswi"} baru ${newName} berhasil didaftarkan!`, "success");
      }

      setShowFormModal(false);
    } catch (_err) {
      toast("Gagal menyimpan data.", "error");
    }
  };

  // Grid Columns for PONDOK (P3HM)
  const pondokColumns: ColumnDef<Santri, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Santriwati & Stambuk",
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
      header: "Kamar & Gedung Asrama",
      cell: (info) => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-bold text-emerald-700 dark:text-emerald-400">Asrama Aisyah 1</span>
          <span className="text-xs text-zinc-500 font-semibold">Gedung Aisyah</span>
        </div>
      ),
    },
    {
      accessorKey: "mustahiq",
      header: "Musyrifah / Wali Kamar",
      cell: (info) => (
        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-left">
          Ustadzah Halimah
        </span>
      ),
    },
    {
      accessorKey: "familyCardNumber",
      header: "Wali Santri & KK (Smart KK)",
      cell: (info) => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{info.row.original.guardianName}</span>
          <span className="text-[11px] font-mono text-zinc-500">KK: {info.getValue() as string}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status Keasramaan",
      cell: (info) => <PillBadge label={info.getValue() as string === "ACTIVE" ? "AKTIF ASRAMA" : (info.getValue() as string)} variant={info.getValue() === "ACTIVE" ? "success" : "warning"} />,
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

  // Grid Columns for MADRASAH (MPHM)
  const madrasahColumns: ColumnDef<Santri, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Siswi & Stambuk",
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
      header: "Kelas & Rombel Diniyyah",
      cell: (info) => (
        <span className="font-bold text-blue-700 dark:text-blue-400 text-left">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "mustahiq",
      header: "Mustahiq (Wali Kelas)",
      cell: (info) => (
        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-left">
          {info.getValue() as string || "Ustadz Ahmad"}
        </span>
      ),
    },
    {
      accessorKey: "familyCardNumber",
      header: "Wali Siswi & KK (Smart KK)",
      cell: (info) => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{info.row.original.guardianName}</span>
          <span className="text-[11px] font-mono text-zinc-500">KK: {info.getValue() as string}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status Akademik",
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

  const gridProps = {
    columns: isPondok ? pondokColumns : madrasahColumns,
    data: santriData,
    tableName: isPondok ? "santriwati_pondok_p3hm" : "siswi_madrasah_mphm",
  };

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
      {/* Header Halaman Dinamis (PONDOK vs MADRASAH) */}
      <div className={`relative overflow-hidden p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white ${
        isPondok 
          ? "bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-900 border border-emerald-500/30" 
          : "bg-linear-to-r from-indigo-700 via-blue-700 to-indigo-900 border border-indigo-500/30"
      }`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider px-3 py-1 bg-black/20 rounded-full border border-white/20 w-fit backdrop-blur-xs">
            {isPondok ? <Home className="w-4 h-4 text-emerald-300" /> : <BookOpen className="w-4 h-4 text-blue-300" />}
            <span>{isPondok ? "Workspace Pondok Pesantren Putri [P3HM Lirboyo]" : "Workspace Madrasah Diniyyah Putri [MPHM Lirboyo]"}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isPondok ? "Data Induk Santriwati Asrama (P3HM)" : "Data Induk Siswi Diniyyah (MPHM)"}
          </h1>
          <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
            {isPondok 
              ? "Administrasi data santriwati pengasuhan asrama terintegrasi dengan Nomor Stambuk, Kamar Asrama, Musyrifah Wali Kamar, dan Smart KK Mapping."
              : "Administrasi data siswi madrasah diniyyah terintegrasi dengan Nomor Stambuk, NIS/NISN, Kelas Rombel, Mustahiq, Raport Sakral Kwartal, dan Smart KK."
            }
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 border border-white/20 ${
            isPondok ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950" : "bg-blue-500 hover:bg-blue-400 text-white"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isPondok ? "+ Registrasi Santriwati Baru" : "+ Registrasi Siswi Baru"}</span>
        </button>
      </div>

      {/* Sub-tabs Menu */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("aktif")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeSubTab === "aktif"
              ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isPondok ? "Santriwati Asrama Aktif" : "Siswi Diniyyah Aktif"}
        </button>
        <button
          onClick={() => setActiveSubTab("alumni")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeSubTab === "alumni"
              ? isPondok ? "border-teal-600 text-teal-600 dark:text-teal-400 font-extrabold" : "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isPondok ? "Santriwati Khidmah P3HM" : "Siswi Alumni / Lulus"}
        </button>
        <button
          onClick={() => setActiveSubTab("mutasi")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeSubTab === "mutasi"
              ? "border-rose-600 text-rose-600 dark:text-rose-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isPondok ? "Santriwati Boyong" : "Mutasi & Keluar"}
        </button>
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
          title: isPondok 
            ? "Data Induk Santriwati Asrama (P3HM Lirboyo)" 
            : "Data Induk Siswi Diniyyah (MPHM Lirboyo)",
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
                  mustahiq: isPondok ? "Ustadzah Musyrifah" : "Ustadz Mustahiq",
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

      {/* Form Modal (Tambah / Edit) */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 max-h-[92vh] flex flex-col"
            >
              <div className={`p-5 border-b flex justify-between items-center ${
                isPondok 
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50" 
                  : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50"
              }`}>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {editingSantri 
                      ? `Edit Data: ${editingSantri.name}` 
                      : (isPondok ? "Registrasi Santriwati Asrama Baru (P3HM)" : "Registrasi Siswi Diniyyah Baru (MPHM)")
                    }
                  </h3>
                  <p className="text-xs text-zinc-500">Lengkapi data 6-bagian: identitas pribadi, akademis/kamar, alamat (dropdown wilayah), wali (Smart KK), dan khidmah.</p>
                </div>
                <button onClick={() => setShowFormModal(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* 1. Pas Foto */}
                <div className="bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 flex items-center justify-center shadow-inner group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-zinc-400">
                        <Camera className="w-8 h-8" />
                        <span className="text-[10px] mt-1 font-semibold">No Photo</span>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                        Mengunggah...
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Pas Foto Resmi</h4>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                      Format formal 3x4. Max file 2MB (JPG/PNG). Diunggah langsung ke Cloudinary Cloud Storage.
                    </p>
                    
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs cursor-pointer border border-blue-150 dark:border-blue-900/40 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      <span>Unggah Pas Foto</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} disabled={uploadingImage} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Form Fields - I. Pribadi */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">I. Informasi Pribadi</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Nama Lengkap Santriwati *</label>
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">NIK (16 Digit) *</label>
                      <input type="text" required maxLength={16} value={newNik} onChange={(e) => setNewNik(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Tempat Lahir</label>
                      <input type="text" value={newBirthPlace} onChange={(e) => setNewBirthPlace(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Tanggal Lahir</label>
                      <input type="date" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-500">No. HP / WA Santri</label>
                      <input type="text" value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono" />
                    </div>
                  </div>
                </div>

                {/* Form Fields - II. Akademis / Keasramaan (Dropdown Pemanggilan Database) */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">II. Informasi Akademik & Asrama (Dropdown Pemanggilan Database)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Nomor Stambuk *</label>
                      <input type="text" required value={newStambuk} onChange={(e) => setNewStambuk(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono" />
                    </div>

                    {/* DROPDOWN KELAS DINIYYAH DARI MENU/DATABASE */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Kelas Diniyyah (Database) *</label>
                      <select 
                        value={newClass} 
                        onChange={(e) => setNewClass(e.target.value)}
                        className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400"
                      >
                        {dbClasses.length > 0 ? (
                          dbClasses.map((c) => (
                            <option key={c.id} value={c.name}>{c.name} ({c.mustahiq || "Wali Kelas"})</option>
                          ))
                        ) : (
                          <>
                            <option value="I'dadiyyah I-A">I&apos;dadiyyah I-A</option>
                            <option value="I'dadiyyah I-B">I&apos;dadiyyah I-B</option>
                            <option value="Tsanawiyyah I-A">Tsanawiyyah I-A</option>
                            <option value="Tsanawiyyah I-B">Tsanawiyyah I-B</option>
                            <option value="Aliyyah I-A">Aliyyah I-A</option>
                            <option value="Aliyyah III-A">Aliyyah III-A</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* DROPDOWN KAMAR ASRAMA DARI MENU/DATABASE */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Kamar Asrama (Database) *</label>
                      <select 
                        value={newRoom} 
                        onChange={(e) => setNewRoom(e.target.value)}
                        className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400"
                      >
                        {dbRooms.length > 0 ? (
                          dbRooms.map((r) => (
                            <option key={r.id} value={r.name}>{r.name} ({r.buildingName})</option>
                          ))
                        ) : (
                          <>
                            <option value="Asrama Aisyah 1">Asrama Aisyah 1 (Gedung Aisyah)</option>
                            <option value="Asrama Aisyah 2">Asrama Aisyah 2 (Gedung Aisyah)</option>
                            <option value="Asrama Fatimah 1">Asrama Fatimah 1 (Gedung Fatimah)</option>
                            <option value="Asrama Khadijah 1">Asrama Khadijah 1 (Gedung Khadijah)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Fields - III. Alamat Lengkap Dropdown Wilayah */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">III. Alamat Lengkap (Dropdown Wilayah Indonesia)</span>
                  <RegionSelector onChange={(addr) => setNewAddress(addr)} />
                  {newAddress && (
                    <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-700 dark:text-blue-400">Hasil Format Alamat Induk:</span>
                        <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 font-medium">{newAddress}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields - IV. Data Wali Santri (Smart KK) */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">IV. Data Wali Santri (Smart KK Mapping)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Nama Lengkap Wali *</label>
                      <input type="text" required value={newGuardianName} onChange={(e) => setNewGuardianName(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Nomor Kartu Keluarga (KK) *</label>
                      <input type="text" required maxLength={16} value={newFamilyCardNumber} onChange={(e) => setNewFamilyCardNumber(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono" />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-500">No. WhatsApp Wali *</label>
                      <input type="text" required value={newGuardianPhone} onChange={(e) => setNewGuardianPhone(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 text-sm font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-xl">Batal</button>
                  <button type="submit" className={`px-6 py-2 text-sm font-bold text-white rounded-xl shadow-md ${isPondok ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {editingSantri ? "Simpan Perubahan" : "Daftarkan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Detail Profil Santri */}
      <AnimatePresence>
        {selectedSantriForDetail && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSantriForDetail(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 max-h-[92vh] flex flex-col">
              
              {/* HEADER PROFIL SANTRI RESMI */}
              <div className={`p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md ${
                isPondok 
                  ? "bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-900" 
                  : "bg-linear-to-r from-indigo-700 via-blue-700 to-indigo-900"
              }`}>
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
                      <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                        {selectedSantriForDetail.stambuk}
                      </span>
                      <PillBadge label={selectedSantriForDetail.status} variant={selectedSantriForDetail.status === "ACTIVE" ? "success" : "warning"} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">
                      {selectedSantriForDetail.name} <span className="text-sm font-normal text-white/80">({selectedSantriForDetail.guardianName})</span>
                    </h2>
                    <p className="text-xs text-white/90 font-semibold flex items-center gap-2 justify-center sm:justify-start">
                      {isPondok ? (
                        <>
                          <Home className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Kamar: Asrama Aisyah 1 (Gedung Aisyah)</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5 text-blue-300" />
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

              {/* Navigasi Tab 6-Bagian */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-x-auto px-4">
                {[
                  { id: "pribadi", label: "I. Informasi Pribadi" },
                  { id: "akademis", label: isPondok ? "II. Keasramaan" : "II. Akademis" },
                  { id: "alamat", label: "III. Alamat Lengkap" },
                  { id: "wali", label: "IV. Wali (Smart KK)" },
                  { id: "khidmah", label: "V. Masa Khidmah" },
                  { id: "berkas", label: "VI. Berkas Penting" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailActiveSection(tab.id as any)}
                    className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      detailActiveSection === tab.id
                        ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
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
                      <span className="text-xs text-zinc-400 font-bold uppercase">{isPondok ? "Kamar Asrama" : "Kelas Diniyyah"}</span>
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">{isPondok ? "Asrama Aisyah 1" : selectedSantriForDetail.class}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 font-bold uppercase">Status Keaktifan</span>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{selectedSantriForDetail.status}</p>
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
                      <span className="text-xs text-zinc-400 font-bold uppercase">Nomor Kartu Keluarga (KK) *</span>
                      <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedSantriForDetail.familyCardNumber}</p>
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
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-zinc-150 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/50">
                <button onClick={() => setSelectedSantriForDetail(null)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer">
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
