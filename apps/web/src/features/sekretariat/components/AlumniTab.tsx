"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, UploadCloud, Camera, User, Heart, Award } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { IdentityCell } from "@/components/shared/IdentityCell";
import { RegionSelector } from "@/components/shared/RegionSelector";
import { TableActions } from "@/components/shared/TableActions";
import { useSantri, Santri } from "../queries/useSantri";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/shared/ToastContext";

interface SiswaTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function AlumniTab({ onViewDetail, isReadOnly = false, selectedYearId }: SiswaTabProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: remoteData, isLoading, createSantri, updateSantri, deleteSantri } = useSantri(selectedYearId, pageIndex, pageSize, searchQuery, "alumni");
  const [santriData, setSantriData] = useState<Santri[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  // Sync with TanStack Query data
  useEffect(() => {
    if (remoteData) {
      setSantriData(remoteData.data);
      setTotalCount(remoteData.total);
    }
  }, [remoteData?.data, remoteData?.total]);

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Santri | null>(null);

  // Form States - Pribadi
  const [newName, setNewName] = useState("");
  const [newNik, setNewNik] = useState("");
  const [newGender, setNewGender] = useState<"L" | "P">("P");
  const [newBirthPlace, setNewBirthPlace] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Form States - Akademik
  const [newStambuk, setNewStambuk] = useState("");
  const [newNis, setNewNis] = useState("");
  const [newNisn, setNewNisn] = useState("");
  const [newClass, setNewClass] = useState("Tsanawiyyah I-A");
  const [newEnrollmentYear, setNewEnrollmentYear] = useState(2026);
  const [newGraduationYear, setNewGraduationYear] = useState<number | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");
  const [newAddress, setNewAddress] = useState("");

  // Form States - Wali (Smart KK Mapping)
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianNik, setNewGuardianNik] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [newGuardianRelation, setNewGuardianRelation] = useState<"AYAH" | "IBU" | "WALI">("AYAH");
  const [newFamilyCardNumber, setNewFamilyCardNumber] = useState("");

  // Media Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);



  // Open Edit Modal
  const handleOpenEdit = (student: Santri) => {
    setEditingSantri(student);
    // Pre-fill Form States
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

  // Delete Action
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

  // Cloudinary Direct Signed Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadFeedback(null);

    try {
      // 1. Dapatkan signature upload Cloudinary dari API backend
      const res = await apiRequest<{
        status: string;
        data: {
          signature: string;
          timestamp: number;
          apiKey: string;
          cloudName: string;
          folder: string;
        };
      }>("/api/media/signature");

      if (res && res.data) {
        const { signature, timestamp, apiKey, cloudName, folder } = res.data;

        // 2. Upload file langsung ke Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Cloudinary upload failed");
        }

        const uploadData = await uploadRes.json();
        setAvatarUrl(uploadData.secure_url);
        setUploadFeedback("Foto berhasil diunggah ke Cloudinary!");
      } else {
        throw new Error("Invalid signature response");
      }
    } catch (err: unknown) {
      console.error("Cloudinary upload error:", err);
      toast("Gagal mengunggah foto ke server. Silahkan hubungi developer.", "error", "Unggah Gagal");
      setUploadFeedback("Upload gagal. Silakan coba lagi.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save / Add Form Handle
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNik || !newStambuk || !newNis || !newGuardianName || !newFamilyCardNumber) {
      toast("Harap lengkapi semua field bertanda bintang (*)", "warning", "Validasi Gagal");
      return;
    }

    try {
      const payload: Partial<Omit<Santri, "id">> = {
        name: newName,
        nik: newNik,
        gender: newGender,
        birthPlace: newBirthPlace || undefined,
        birthDate: newBirthDate || undefined,
        phoneNumber: newPhoneNumber || undefined,
        avatarUrl: avatarUrl,
        stambuk: newStambuk,
        nis: newNis,
        nisn: newNisn || undefined,
        class: newClass,
        enrollmentYear: newEnrollmentYear,
        graduationYear: newStatus === "GRADUATED" ? (newGraduationYear || 2026) : undefined,
        status: newStatus,
        address: newAddress || "Alamat belum ditentukan",
        guardianName: newGuardianName,
        guardianNik: newGuardianNik || undefined,
        guardianPhone: newGuardianPhone,
        guardianRelation: newGuardianRelation,
        familyCardNumber: newFamilyCardNumber
      };

      if (editingSantri) {
        // Mode Edit
        await updateSantri({ id: editingSantri.id, data: payload });
        toast("Data santri berhasil diperbarui!", "success", "Perubahan Disimpan");
      } else {
        // Mode Tambah
        await createSantri(payload as Omit<Santri, "id">);
        toast("Santri baru berhasil didaftarkan!", "success", "Data Ditambahkan");
      }
      setShowFormModal(false);
    } catch (_err) {
      toast("Terjadi kesalahan saat menyimpan data", "error");
    }
  };

  // 1. Data Grid Filter per Tab  // Filter Angkatan
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>("all");

  const filteredData = useMemo(() => {
    let filtered = santriData.filter((s) => s.status === "GRADUATED");

    if (selectedAngkatan !== "all") {
      filtered = filtered.filter((s) => s.graduationYear?.toString() === selectedAngkatan);
    }

    return filtered;
  }, [santriData, selectedAngkatan]);

  // Columns definition: Alumni
  const alumniColumns: ColumnDef<Santri, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Alumni",
      cell: (info) => (
        <IdentityCell 
          name={info.getValue() as string} 
          subInfo={`Lulus: Th. ${info.row.original.graduationYear || "-"}`} 
          stambuk={info.row.original.stambuk}
          avatarUrl={info.row.original.avatarUrl}
        />
      ),
    },
    {
      accessorKey: "stambuk",
      header: "Stambuk",
      cell: (info) => <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "graduationYear",
      header: "Tahun Kelulusan",
      cell: (info) => <span className="font-bold text-zinc-900 dark:text-zinc-100">{info.getValue() as number || "-"}</span>,
    },
    {
      accessorKey: "enrollmentYear",
      header: "Tahun Masuk",
      cell: (info) => <span className="text-zinc-500 dark:text-zinc-400 text-xs">{info.getValue() as number}</span>,
    },
    {
      accessorKey: "address",
      header: "Alamat Asal",
      cell: (info) => <span className="text-xs text-zinc-500 max-w-[150px] truncate block">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => <PillBadge label="ALUMNI" variant="gold" />,
    },
    {
      id: "actions",
      header: "Aksi",
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-amber-650 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Al-Rabithoh & Alumni</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Induk Alumni
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Kelola data alumni berdasarkan tahun kelulusan dan angkatan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10">
          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Angkatan</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year.toString()}>Angkatan {year}</option>
            ))}
          </select>

        </div>
      </div>

      <UniversalDataGrid
        columns={alumniColumns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={filteredData as unknown as Record<string, unknown>[]}
        pageCount={Math.ceil(totalCount / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        onRowClick={(row) => setViewingDetail(row as unknown as Santri)}
        tableName="santri_alumni"
        importExportProps={{
          title: `Data Induk - Alumni`,
          headers: ["Nama Lengkap", "NIK", "Nomor Stambuk", "Kelas", "Alamat", "Status"],
          onImportSuccess: async (importedRows) => {
            let successCount = 0;
            for (const r of importedRows) {
              try {
                await createSantri({
                  name: r["Nama Lengkap"] || "",
                  nik: r["NIK"] || "",
                  stambuk: r["Nomor Stambuk"] || "",
                  class: r["Kelas"] || "",
                  address: r["Alamat"] || "",
                  status: "GRADUATED",
                  gender: "P",
                  nis: r["Nomor Stambuk"] || "",
                  enrollmentYear: 2026,
                  graduationYear: 2026,
                  guardianName: "Wali Import",
                  guardianPhone: "081200000000",
                  guardianRelation: "AYAH",
                  familyCardNumber: "3171010000000000"
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

      {/* Tambah / Edit Santri Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative z-10 max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {editingSantri ? `Edit Data: ${editingSantri.name}` : "Tambah Santri Baru"}
                  </h3>
                  <p className="text-xs text-zinc-500">Lengkapi data diri, berkas pas foto, serta informasi wali / nomor KK.</p>
                </div>
                <button 
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Form */}
              <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* 1. SEKSI FOTO PROFIL */}
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
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Pas Foto Santriwati</h4>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                      Ambil foto formal ukuran 3x4. Max file 2MB (format JPG/PNG). Pas foto diunggah langsung ke Cloudinary Cloud Storage.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <label className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs cursor-pointer border border-blue-150 dark:border-blue-900/40 transition-colors">
                        <UploadCloud className="w-4 h-4" />
                        <span>Unggah Pas Foto</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden" 
                        />
                      </label>
                      
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl(null)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-xs border border-rose-150 dark:border-rose-900/40 cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    {uploadFeedback && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{uploadFeedback}</p>
                    )}
                  </div>
                </div>

                {/* 2. SEKSI DATA DIRI PRIBADI */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">I. Informasi Pribadi Santri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nama Lengkap *</label>
                      <input 
                        type="text" 
                        required
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Masukkan nama santri..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">NIK (16 Digit) *</label>
                      <input 
                        type="text" 
                        required
                        maxLength={16}
                        value={newNik} 
                        onChange={(e) => setNewNik(e.target.value)}
                        placeholder="Masukkan NIK santri..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Jenis Kelamin *</label>
                      <select 
                        value={newGender} 
                        onChange={(e) => setNewGender(e.target.value as "P")}
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                        disabled
                      >
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tempat Lahir</label>
                      <input 
                        type="text" 
                        value={newBirthPlace} 
                        onChange={(e) => setNewBirthPlace(e.target.value)}
                        placeholder="Masukkan kota lahir..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        value={newBirthDate} 
                        onChange={(e) => setNewBirthDate(e.target.value)}
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No. HP / WA Santri</label>
                      <input 
                        type="text" 
                        value={newPhoneNumber} 
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        placeholder="Cth: 0812xxxxxxxx"
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. SEKSI DATA AKADEMIK */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">II. Informasi Akademis</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nomor Stambuk *</label>
                      <input 
                        type="text" 
                        required
                        value={newStambuk} 
                        onChange={(e) => setNewStambuk(e.target.value)}
                        placeholder="Masukkan no stambuk..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nomor Induk Santri (NIS) *</label>
                      <input 
                        type="text" 
                        required
                        value={newNis} 
                        onChange={(e) => setNewNis(e.target.value)}
                        placeholder="Masukkan NIS..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">NISN (Nasional)</label>
                      <input 
                        type="text" 
                        value={newNisn} 
                        onChange={(e) => setNewNisn(e.target.value)}
                        placeholder="Masukkan NISN..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Kelas Aktif *</label>
                      <select 
                        value={newClass} 
                        onChange={(e) => setNewClass(e.target.value)}
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                      >
                        <option value="Tsanawiyyah I-A">Tsanawiyyah I-A</option>
                        <option value="Ibtida'iyyah V-B">Ibtida&apos;iyyah V-B</option>
                        <option value="Aliyyah II-A">Aliyyah II-A</option>
                        <option value="Aliyyah III-A">Aliyyah III-A</option>
                        <option value="Al-Rabithoh">Al-Rabithoh</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tahun Masuk Rombel</label>
                      <input 
                        type="number" 
                        value={newEnrollmentYear} 
                        onChange={(e) => setNewEnrollmentYear(Number(e.target.value))}
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Status Keaktifan *</label>
                      <select 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                      >
                        <option value="GRADUATED">GRADUATED (Alumni / Lulus)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tahun Kelulusan *</label>
                      <input 
                        type="number" 
                        required
                        value={newGraduationYear || 2026} 
                        onChange={(e) => setNewGraduationYear(Number(e.target.value))}
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>
                  </div>

                  <RegionSelector onChange={(addr) => setNewAddress(addr)} />

                  {newAddress && (
                    <div className="flex items-start gap-2 p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-700 dark:text-blue-400">Preview Alamat Format Induk:</span>
                        <span className="text-zinc-650 dark:text-zinc-350 mt-0.5">{newAddress}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. SEKSI WALI SANTRI (Smart KK Mapping) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">III. Informasi Orang Tua / Wali (Smart KK Mapping)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nama Lengkap Wali *</label>
                      <input 
                        type="text" 
                        required
                        value={newGuardianName} 
                        onChange={(e) => setNewGuardianName(e.target.value)}
                        placeholder="Nama Ayah/Ibu/Wali..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Hubungan Keluarga *</label>
                      <select 
                        value={newGuardianRelation} 
                        onChange={(e) => setNewGuardianRelation(e.target.value as "AYAH" | "IBU" | "WALI")}
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                      >
                        <option value="AYAH">Ayah Kandung</option>
                        <option value="IBU">Ibu Kandung</option>
                        <option value="WALI">Wali Lainnya</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">No. HP / WA Wali *</label>
                      <input 
                        type="text" 
                        required
                        value={newGuardianPhone} 
                        onChange={(e) => setNewGuardianPhone(e.target.value)}
                        placeholder="Cth: 081299998888"
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nomor Kartu Keluarga (KK) *</label>
                      <input 
                        type="text" 
                        required
                        maxLength={16}
                        value={newFamilyCardNumber} 
                        onChange={(e) => setNewFamilyCardNumber(e.target.value)}
                        placeholder="Masukkan 16 digit No KK..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">NIK Wali (16 Digit)</label>
                      <input 
                        type="text" 
                        maxLength={16}
                        value={newGuardianNik} 
                        onChange={(e) => setNewGuardianNik(e.target.value)}
                        placeholder="Masukkan NIK Wali..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-semibold italic mt-2">
                    * Smart KK Mapping: Masukkan Nomor KK yang sama untuk bersaudara agar Wali cukup menggunakan satu akun login di Portal Wali.
                  </p>
                </div>

                {/* Footer Tombol Form */}
                <div className="flex justify-end gap-3 pt-5 border-t border-zinc-150 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
                  >
                    {editingSantri ? "Simpan Perubahan" : "Daftarkan Santri"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setViewingDetail(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Detail Alumni
                </h3>
                <button onClick={() => setViewingDetail(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full border-2 border-amber-200 overflow-hidden bg-zinc-100 flex items-center justify-center">
                    {viewingDetail.avatarUrl ? (
                      <img src={viewingDetail.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-zinc-400" />
                    )}
                  </div>
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Nama Lengkap</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{viewingDetail.name || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Nomor Stambuk</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{viewingDetail.stambuk || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Tahun Lulus</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{viewingDetail.graduationYear || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Alamat Asal</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">{viewingDetail.address || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
