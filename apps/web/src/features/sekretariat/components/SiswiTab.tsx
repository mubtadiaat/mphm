"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, MapPin, User, Heart,
  BookOpen, Search, Home, Camera
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
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface SiswiTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function SiswiTab({ isReadOnly = false, selectedYearId }: SiswiTabProps) {
  const { data: authSession } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<"aktif" | "cuti" | "tanpa_kelas" | "alumni" | "mutasi">("aktif");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState("ALL");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (authSession?.supervisedLevel && selectedJenjangFilter === "ALL") {
      setSelectedJenjangFilter(authSession.supervisedLevel);
    }
  }, [authSession?.supervisedLevel, selectedJenjangFilter]);

  const { data: queryResult, isLoading, createSantri, updateSantri, deleteSantri } = useSantri(
    selectedYearId,
    pageIndex,
    pageSize,
    searchQuery,
    activeSubTab,
    selectedClassFilter !== "ALL" ? selectedClassFilter : undefined,
    selectedJenjangFilter !== "ALL" ? selectedJenjangFilter : undefined,
    "madrasah"
  );
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
  const { toast, confirm } = useToast();

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
  const [newClass, setNewClass] = useState("Tsanawiyyah I-A");
  const [newRoom, setNewRoom] = useState("Asrama Aisyah 1");
  const [newEnrollmentYear, setNewEnrollmentYear] = useState(2026);
  const [newGraduationYear, setNewGraduationYear] = useState<number | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");
  const [newAddress, setNewAddress] = useState("");

  // Form States - IV. Wali
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianNik, setNewGuardianNik] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [newGuardianRelation, setNewGuardianRelation] = useState<"AYAH" | "IBU" | "WALI">("AYAH");
  const [newFamilyCardNumber, setNewFamilyCardNumber] = useState("");

  // Media Upload States
  const [uploadingImage, setUploadingImage] = useState(false);

  // Feature: Tarik Data Santriwati Pondok (P3HM) -> Siswi Madrasah (MPHM)
  const [pondokSantriList, setPondokSantriList] = useState<Santri[]>([]);
  const [selectedPondokSantriId, setSelectedPondokSantriId] = useState("");
  const [newResidenceType, setNewResidenceType] = useState<"PONDOK_MUBTADIAAT" | "UNIT_LAIN">("PONDOK_MUBTADIAAT");
  const [newExternalResidenceName, setNewExternalResidenceName] = useState("");
  const [newExternalResidenceCustom, setNewExternalResidenceCustom] = useState("");

  // Pondok Search States for Madrasah Pulling
  const [showPondokPullModal, setShowPondokPullModal] = useState(false);
  const [pondokSearchQuery, setPondokSearchQuery] = useState("");
  const [pondokCandidates, setPondokCandidates] = useState<Santri[]>([]);
  const [isSearchingPondok, setIsSearchingPondok] = useState(false);
  const [hasSearchedPondok, setHasSearchedPondok] = useState(false);

  useEffect(() => {
    if (showFormModal && !editingSantri) {
      apiRequest<{ data: Santri[] }>("/api/admin/people?role=student&scope=pondok&limit=1000")
        .then((res) => {
          if (res.data) setPondokSantriList(res.data);
        })
        .catch((err) => console.error("Failed to load Pondok Santriwati list", err));
    }
  }, [showFormModal, editingSantri]);

  const handleSelectPondokSantri = (idOrCandidate: string | Santri) => {
    const target = typeof idOrCandidate === "string"
      ? pondokSantriList.find((s) => s.id === idOrCandidate) || pondokCandidates.find((s) => s.id === idOrCandidate)
      : idOrCandidate;

    if (target) {
      setSelectedPondokSantriId(target.id);
      setNewName(target.name);
      setNewNik(target.nik);
      setNewGender(target.gender || "P");
      setNewBirthPlace(target.birthPlace || "");
      setNewBirthDate(target.birthDate || "");
      setNewPhoneNumber(target.phoneNumber || "");
      setAvatarUrl(target.avatarUrl || null);
      setNewStambuk(target.stambuk);
      setNewNis(target.nis || target.stambuk);
      setNewNisn(target.nisn || "");
      setNewAddress(target.address || "");
      setNewGuardianName(target.guardianName || "");
      setNewGuardianNik(target.guardianNik || "");
      setNewGuardianPhone(target.guardianPhone || "");
      setNewGuardianRelation(target.guardianRelation || "AYAH");
      setNewFamilyCardNumber(target.familyCardNumber || "");
      if (target.room) setNewRoom(target.room);
      if (target.enrollmentYear) setNewEnrollmentYear(target.enrollmentYear);
      toast(`✅ Data Siswi ${target.name} (${target.stambuk}) otomatis terisi 100% dari Pondok P3HM!`, "success");
    }
  };

  const resetFormFields = () => {
    setSelectedPondokSantriId("");
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
    setNewClass(dbClasses[0]?.name || "");
    setNewRoom(dbRooms[0]?.name || "");
    setNewEnrollmentYear(new Date().getFullYear());
    setNewGraduationYear(undefined);
    setNewStatus("ACTIVE");
    setNewAddress("");
    setNewGuardianName("");
    setNewGuardianNik("");
    setNewGuardianPhone("");
    setNewGuardianRelation("AYAH");
    setNewFamilyCardNumber("");
  };

  const handleOpenAdd = () => {
    setPondokSearchQuery("");
    setPondokCandidates([]);
    setHasSearchedPondok(false);
    setShowPondokPullModal(true);
  };

  const handleSearchPondokSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondokSearchQuery.trim()) return;
    setIsSearchingPondok(true);
    setHasSearchedPondok(true);
    try {
      const res = await apiRequest<{ data: Santri[] }>(`/api/admin/people?role=student&scope=pondok&q=${encodeURIComponent(pondokSearchQuery)}&limit=20`);
      if (res.data) setPondokCandidates(res.data);
    } catch {
      setPondokCandidates([]);
    } finally {
      setIsSearchingPondok(false);
    }
  };

  const handlePullPondokSantriToMadrasah = (candidate: Santri) => {
    setShowPondokPullModal(false);
    resetFormFields();
    setNewResidenceType("PONDOK_MUBTADIAAT");
    handleSelectPondokSantri(candidate);
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
    setNewNis(student.nis || student.stambuk);
    setNewNisn(student.nisn || "");
    setNewClass(student.class);
    setNewRoom(student.room || dbRooms[0]?.name || "");
    setNewEnrollmentYear(student.enrollmentYear);
    setNewGraduationYear(student.graduationYear);
    setNewStatus(student.status);
    setNewAddress(student.address || "");
    setNewGuardianName(student.guardianName);
    setNewGuardianNik(student.guardianNik || "");
    setNewGuardianPhone(student.guardianPhone);
    setNewGuardianRelation(student.guardianRelation);
    setNewFamilyCardNumber(student.familyCardNumber);
    setNewResidenceType(student.residenceType || "PONDOK_MUBTADIAAT");
    setNewExternalResidenceName(student.externalResidenceName || "");
    setShowFormModal(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNik) {
      toast("Nama Lengkap dan NIK Wajib Diisi!", "warning");
      return;
    }

    const payload = {
      name: newName,
      nik: newNik,
      gender: newGender,
      birthPlace: newBirthPlace,
      birthDate: newBirthDate,
      phoneNumber: newPhoneNumber,
      avatarUrl: avatarUrl || undefined,
      stambuk: newStambuk || newNik.substring(0, 8),
      nis: newNis || newStambuk,
      nisn: newNisn,
      class: newClass,
      room: newRoom,
      enrollmentYear: Number(newEnrollmentYear),
      graduationYear: newGraduationYear ? Number(newGraduationYear) : undefined,
      status: newStatus,
      address: newAddress,
      guardianName: newGuardianName,
      guardianNik: newGuardianNik,
      guardianPhone: newGuardianPhone,
      guardianRelation: newGuardianRelation,
      familyCardNumber: newFamilyCardNumber,
      residenceType: newResidenceType,
      externalResidenceName: newResidenceType === "UNIT_LAIN" ? (newExternalResidenceName === "Lainnya" ? newExternalResidenceCustom : newExternalResidenceName) : null,
      mustahiq: "Ustadz Mustahiq",
    };

    try {
      if (editingSantri) {
        await updateSantri({ id: editingSantri.id, data: payload });
        toast("✅ Data Siswi Madrasah Berhasil Diperbarui!", "success");
      } else {
        await createSantri(payload as Omit<Santri, "id">);
        toast("✅ Siswi Madrasah Baru Berhasil Didaftarkan!", "success");
      }
      setShowFormModal(false);
      resetFormFields();
    } catch (_err) {
      toast("Gagal menyimpan data siswi", "error");
    }
  };

  const handleDeleteSantri = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Data Siswi Madrasah?",
      message: "Data siswi akan dihapus dari sistem. Lanjutkan?",
      confirmText: "Hapus Data",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        await deleteSantri(id);
        toast("Data Siswi Berhasil Dihapus", "success");
      } catch {
        toast("Gagal menghapus data siswi", "error");
      }
    }
  };

  // Mutasi Modal State
  const [showMutasiModal, setShowMutasiModal] = useState(false);
  const [mutasiSantriTarget, setMutasiSantriTarget] = useState<Santri | null>(null);
  const [mutasiType, setMutasiType] = useState<"GRADUATED" | "MUTATED" | "DROPPED" | "CUTI">("MUTATED");
  const [mutasiNotes, setMutasiNotes] = useState("");

  const handleOpenMutasi = (student: Santri) => {
    setMutasiSantriTarget(student);
    if (student.residenceType !== "UNIT_LAIN") {
      setMutasiType("GRADUATED");
    } else {
      setMutasiType((student.status as any) || "MUTATED");
    }
    setMutasiNotes("");
    setShowMutasiModal(true);
  };

  const handleSaveMutasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutasiSantriTarget) return;

    try {
      await updateSantri({
        id: mutasiSantriTarget.id,
        data: {
          status: mutasiType,
          graduationYear: mutasiType === "GRADUATED" ? new Date().getFullYear() : undefined,
        },
      });
      setShowMutasiModal(false);
      setMutasiSantriTarget(null);
      toast(`✅ Status Siswi ${mutasiSantriTarget.name} Diperbarui Menjadi ${mutasiType}!`, "success");
    } catch {
      toast("Gagal mengubah status siswi", "error");
    }
  };

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
          {info.getValue() as string || "-"}
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
      cell: (info) => {
        const val = info.getValue() as string;
        let label = val;
        let variant: "success" | "warning" | "info" | "danger" = "info";
        if (val === "ACTIVE") { label = "AKTIF"; variant = "success"; }
        else if (val === "CUTI" || val === "ON_LEAVE") { label = "CUTI DINIYYAH"; variant = "warning"; }
        else if (val === "GRADUATED") { label = "ALUMNI / LULUS"; variant = "info"; }
        else if (val === "MUTATED" || val === "DROPPED") { label = "MUTASI / OFF"; variant = "danger"; }
        return <PillBadge label={label} variant={variant} />;
      },
    },
    {
      id: "actions",
      header: "Aksi Management",
      cell: (info) => (
        <TableActions
          onEdit={() => handleOpenEdit(info.row.original)}
          onDelete={() => handleDeleteSantri(info.row.original.id)}
          onMutasi={() => handleOpenMutasi(info.row.original)}
          isReadOnly={isReadOnly}
        />
      ),
    },
  ];

  const excelHeaders = [
    "Nama Lengkap Siswi",
    "NIK Siswi (16 Digit)",
    "Jenis Kelamin",
    "Nomor Stambuk",
    "NIS",
    "NISN",
    "Jenjang Aktif",
    "Kelas Aktif",
    "Kamar / Asrama",
    "Nama Lengkap Wali",
    "Nomor Kartu Keluarga (KK)"
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header Halaman Resmi MADRASAH (MPHM) */}
      <div className="relative overflow-hidden p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-md text-white bg-linear-to-r from-indigo-700 via-blue-700 to-indigo-900 border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 sm:gap-2 z-10">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 bg-black/20 rounded-full border border-white/20 w-fit backdrop-blur-xs">
            <BookOpen className="w-3.5 h-3.5 text-blue-300" />
            <span>Workspace Madrasah Diniyyah Putri [MPHM Lirboyo]</span>
          </div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Data Induk Siswi Diniyyah (MPHM)
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Administrasi data siswi madrasah diniyyah terintegrasi dengan Nomor Stambuk, NIS/NISN, Kelas Rombel, Mustahiq, Raport Kwartal, dan Smart KK.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            type="button"
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 border border-white/20 bg-blue-500 hover:bg-blue-400 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tarik Data Siswi dari Pondok (P3HM)</span>
          </button>
        )}
      </div>

      {/* Sub-tabs Menu Resmi Madrasah */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("aktif")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "aktif"
            ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          Siswi Diniyyah Aktif
        </button>

        <button
          onClick={() => setActiveSubTab("cuti")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "cuti"
            ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          Siswi Cuti Diniyyah 🌴
        </button>

        <button
          onClick={() => setActiveSubTab("tanpa_kelas")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "tanpa_kelas"
            ? "border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          Tanpa Kelas / Belum Belajar
        </button>

        <button
          onClick={() => setActiveSubTab("alumni")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "alumni"
            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          Siswi Alumni / Lulus
        </button>
        <button
          onClick={() => setActiveSubTab("mutasi")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "mutasi"
            ? "border-rose-600 text-rose-600 dark:text-rose-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          Mutasi &amp; Keluar
        </button>
      </div>

      {/* Filter Pengawasan Jenjang & Kelas */}
      {(() => {
        const userSupervisedLevel = authSession?.supervisedLevel;
        const availableClasses = userSupervisedLevel
          ? dbClasses.filter((cls) => (cls.institutionLevel || cls.name || "").toLowerCase().includes(userSupervisedLevel.toLowerCase()))
          : selectedJenjangFilter !== "ALL"
          ? dbClasses.filter((cls) => (cls.institutionLevel || cls.name || "").toLowerCase().includes(selectedJenjangFilter.toLowerCase()))
          : dbClasses;

        return (
          <div className="flex flex-col gap-3 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 shrink-0">FILTER JENJANG:</span>
              {["ALL", "Ibtida'iyyah", "Tsanawiyyah", "Aliyyah", "I'dadiyyah"].map((lvl) => {
                if (userSupervisedLevel && lvl !== "ALL" && !lvl.toLowerCase().includes(userSupervisedLevel.toLowerCase())) {
                  return null;
                }
                const active = selectedJenjangFilter === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setSelectedJenjangFilter(lvl);
                      setSelectedClassFilter("ALL");
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${active
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      }`}
                  >
                    {lvl === "ALL" ? "Semua" : lvl}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 shrink-0">FILTER KELAS:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kelas ({availableClasses.length})</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })()}

      {/* Data Grid Utama */}
      <UniversalDataGrid
        columns={madrasahColumns}
        data={santriData}
        pageCount={Math.ceil(totalCount / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        tableName="siswi_madrasah_mphm"
        importExportProps={{
          disableImport: isReadOnly,
          title: "Data Induk Siswi Diniyyah (MPHM Lirboyo)",
          headers: excelHeaders,
          onExportFetchAll: async () => {
            const statusParam = activeSubTab === "tanpa_kelas" ? "without_class" : activeSubTab;
            let url = `/api/admin/people?role=student&limit=10000&offset=0&status=${statusParam}&scope=madrasah`;
            if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
            const res = await apiRequest<{ data: Santri[] }>(url);
            return res?.data || [];
          },
          onImportSuccess: async (importedRows: Record<string, string>[]) => {
            let successCount = 0;
            for (const r of importedRows) {
              try {
                await createSantri({
                  name: r["Nama Lengkap Siswi"] || r["Nama Lengkap Santriwati"] || r["Nama Lengkap"] || r["Nama"] || "",
                  nik: r["NIK Siswi (16 Digit)"] || r["NIK Siswi"] || r["NIK Santri (16 Digit)"] || r["NIK"] || "",
                  gender: (r["Jenis Kelamin"] || "P") as "L" | "P",
                  stambuk: r["Nomor Stambuk"] || r["Stambuk"] || "",
                  nis: r["NIS"] || "",
                  nisn: r["NISN"] || "",
                  class: r["Kelas Aktif"] || r["Kelas"] || dbClasses[0]?.name || "Ibtida'iyyah I-A",
                  room: r["Kamar / Asrama"] || r["Kamar"] || dbRooms[0]?.name || "Asrama Aisyah 1",
                  status: "ACTIVE",
                  address: "",
                  enrollmentYear: new Date().getFullYear(),
                  guardianName: r["Nama Lengkap Wali"] || r["Nama Wali"] || "",
                  guardianPhone: r["No. HP / WA Wali"] || "",
                  guardianRelation: "AYAH",
                  familyCardNumber: r["Nomor Kartu Keluarga (KK)"] || r["No. KK"] || "",
                  mustahiq: "Ustadz Mustahiq",
                });
                successCount++;
              } catch (e) {
                console.error("Gagal import baris:", r, e);
              }
            }
            if (successCount > 0) {
              toast(`${successCount} dari ${importedRows.length} data Siswi berhasil diimpor!`, "success", "Import Berhasil");
            }
          }
        }}
      />

      {/* Modal Tarik Data Santriwati Pondok P3HM (Untuk Madrasah) */}
      <AnimatePresence>
        {showPondokPullModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowPondokPullModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/30">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                  <Search className="w-4 h-4" />
                  <span>Penarikan Data Siswi dari Database Pondok P3HM</span>
                </div>
                <button onClick={() => setShowPondokPullModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Sesuai alur resmi sistem: <strong>Pondok Input — Madrasah Tarik</strong>. Silakan cari NIK, Nomor Stambuk, atau Nama Santriwati di database Pondok P3HM untuk didaftarkan sebagai Siswi Madrasah (MPHM).
                </p>

                <form onSubmit={handleSearchPondokSantri} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik NIK / Stambuk / Nama Santriwati..."
                    value={pondokSearchQuery}
                    onChange={(e) => setPondokSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-hidden dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingPondok}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer shrink-0"
                  >
                    {isSearchingPondok ? "Mencari..." : "Cari di Pondok"}
                  </button>
                </form>

                {/* Candidate Results */}
                <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {pondokCandidates.map((c) => (
                    <div key={c.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-white block">{c.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Stambuk: {c.stambuk} • NIK: {c.nik || "-"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePullPondokSantriToMadrasah(c)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer shrink-0 shadow-xs"
                      >
                        📥 Tarik Data
                      </button>
                    </div>
                  ))}

                  {hasSearchedPondok && pondokCandidates.length === 0 && !isSearchingPondok && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-center space-y-3">
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        ⚠️ Data Siswi tidak ditemukan di Database Pondok Pesantren P3HM.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPondokPullModal(false);
                          resetFormFields();
                          setNewResidenceType("UNIT_LAIN");
                          setShowFormModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
                      >
                        🔓 Buka Form Input Manual Baru
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <div className="p-5 border-b flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {editingSantri
                      ? `Edit Data Siswi: ${editingSantri.name}`
                      : "Tarik & Daftarkan Siswi Diniyyah (MPHM) dari Pondok"
                    }
                  </h3>
                  <p className="text-xs text-zinc-500">Lengkapi data identitas pribadi, akademis, alamat, dan wali (Smart KK).</p>
                </div>
                <button onClick={() => setShowFormModal(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Penarikan / Asrama Banner */}
                {!editingSantri && (
                  selectedPondokSantriId ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
                      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold">
                        <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Data Siswi Ditarik dari Santriwati Pondok P3HM Lirboyo (Stambuk: {newStambuk})</span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">Terhubung P3HM</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3 text-xs shadow-xs">
                      <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-extrabold">
                        <Home className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>🔓 Input Manual Siswi Madrasah (Bukan Santri P3HM / Unit Asrama Luar)</span>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-purple-200 dark:border-purple-800">
                        <label className="text-[11px] font-bold text-purple-900 dark:text-purple-300">Pilih / Masukkan Nama Unit Asrama Asal</label>
                        <select
                          value={newExternalResidenceName}
                          onChange={(e) => setNewExternalResidenceName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-purple-500 outline-hidden"
                        >
                          <option value="">-- Pilih Nama Unit Asrama --</option>
                          <option value="Darussa'adah">Pondok Pesantren Darussa&apos;adah</option>
                          <option value="Ar-Risalah">Pondok Pesantren Ar-Risalah</option>
                          <option value="Dalem Gus Ya'lu">Dalem Gus Ya&apos;lu</option>
                          <option value="Dalem Yai Atho">Dalem Yai Atho&apos;</option>
                          <option value="Lainnya">Asrama Unit Lainnya (Lain-Lain)</option>
                        </select>
                        {newExternalResidenceName === "Lainnya" && (
                          <input
                            type="text"
                            placeholder="Tuliskan nama unit/asrama asal..."
                            value={newExternalResidenceCustom}
                            onChange={(e) => setNewExternalResidenceCustom(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white mt-2"
                          />
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* 1. Pas Foto */}
                <div className="bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 flex items-center justify-center shadow-inner group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FallbackAvatar name={newName || "S"} size="lg" />
                    )}
                    <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>{avatarUrl ? "Ganti Foto" : "Unggah Foto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.url) {
                              setAvatarUrl(data.url);
                              toast("Pas Foto Berhasil Diunggah!", "success");
                            } else {
                              toast("Gagal Mengunggah Pas Foto", "error");
                            }
                          } catch {
                            toast("Terjadi Kesalahan Upload", "error");
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 block">Pas Foto Resmi</span>
                    <p className="text-xs text-zinc-500">Format formal 3×4. Max file 2MB (JPG/PNG). Diunggah langsung ke Cloud Storage.</p>
                    {uploadingImage && <span className="text-xs font-bold text-blue-600 animate-pulse">Mengunggah gambar...</span>}
                  </div>
                </div>

                {/* I. INFORMASI PRIBADI */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    I. INFORMASI PRIBADI
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nama Lengkap Siswi *</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Masukkan nama lengkap sesuai ijazah/KTP..."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">NIK Siswi (16 Digit) *</label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={newNik}
                        onChange={(e) => setNewNik(e.target.value)}
                        placeholder="350301..."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tempat Lahir</label>
                      <input
                        type="text"
                        value={newBirthPlace}
                        onChange={(e) => setNewBirthPlace(e.target.value)}
                        placeholder="Kota / Kabupaten tempat lahir..."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={newBirthDate}
                        onChange={(e) => setNewBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No. HP / WA Siswi</label>
                      <input
                        type="text"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* II. DATA AKADEMIS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    II. DATA AKADEMIS &amp; KELAS DINIYYAH
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nomor Stambuk Induk *</label>
                      <input
                        type="text"
                        required
                        value={newStambuk}
                        onChange={(e) => setNewStambuk(e.target.value)}
                        placeholder="2026001"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">NIS (Nomor Induk Siswi)</label>
                      <input
                        type="text"
                        value={newNis}
                        onChange={(e) => setNewNis(e.target.value)}
                        placeholder="NIS Madrasah..."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">NISN (Nomor Induk Siswi Nasional)</label>
                      <input
                        type="text"
                        value={newNisn}
                        onChange={(e) => setNewNisn(e.target.value)}
                        placeholder="0041234567"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Penempatan Kelas &amp; Rombel Diniyyah *</label>
                      <select
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                      >
                        {dbClasses.map((cls) => (
                          <option key={cls.id} value={cls.name}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Status Keaktifan Akademik *</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer dark:text-white"
                      >
                        <option value="ACTIVE">✅ Aktif Diniyyah</option>
                        <option value="CUTI">🌴 Cuti Pembelajaran Madrasah</option>
                        <option value="GRADUATED">🎓 Lulus / Alumni</option>
                        <option value="MUTATED">🔄 Mutasi Pindah</option>
                        <option value="DROPPED">❌ Keluar / Off</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* III. DOMISILI WILAYAH */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    III. ALAMAT DOMISILI (INTEGRASI DROP DOWN KEMENTERIAN)
                  </h4>
                  <RegionSelector
                    onChange={(fullAddr) => setNewAddress(fullAddr)}
                  />
                </div>

                {/* IV. INFORMASI WALI */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    IV. INFORMASI WALI &amp; SMART KK MAPPING
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nama Lengkap Wali *</label>
                      <input
                        type="text"
                        required
                        value={newGuardianName}
                        onChange={(e) => setNewGuardianName(e.target.value)}
                        placeholder="Nama Ayah/Ibu/Wali..."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nomor Kartu Keluarga (KK) *</label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={newFamilyCardNumber}
                        onChange={(e) => setNewFamilyCardNumber(e.target.value)}
                        placeholder="350301..."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No. HP / WA Wali</label>
                      <input
                        type="text"
                        value={newGuardianPhone}
                        onChange={(e) => setNewGuardianPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500 outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Hubungan Wali</label>
                      <select
                        value={newGuardianRelation}
                        onChange={(e) => setNewGuardianRelation(e.target.value as "AYAH" | "IBU" | "WALI")}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer dark:text-white"
                      >
                        <option value="AYAH">Ayah Kandung</option>
                        <option value="IBU">Ibu Kandung</option>
                        <option value="WALI">Wali / Pengasuh</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {editingSantri ? "Simpan Perubahan Siswi" : "Daftarkan Siswi Baru"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Mutasi & Cuti */}
      <AnimatePresence>
        {showMutasiModal && mutasiSantriTarget && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMutasiModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/40">
                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Kewenangan Status Pembelajaran Siswi
                </span>
                <button onClick={() => setShowMutasiModal(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSaveMutasi} className="p-5 space-y-4">
                {/* Banner Kewenangan Status */}
                {mutasiSantriTarget.residenceType !== "UNIT_LAIN" ? (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                    🔒 <strong>Sinkronisasi Otomatis P3HM:</strong> Status Keaktifan (Aktif, Cuti, Keluar) disinkronkan otomatis dari Pondok P3HM. Pihak Madrasah berwenang menetapkan status <strong>Lulus / Alumni Diniyyah</strong>.
                  </div>
                ) : (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-[11px] text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
                    🔓 <strong>Siswi Asrama Luar / Non-P3HM:</strong> Kelola status keaktifan pembelajaran secara mandiri di Madrasah.
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nama Siswi</label>
                  <input type="text" readOnly value={mutasiSantriTarget.name} className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold dark:text-white" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Pilih Status Akademik Baru *</label>
                  <select
                    value={mutasiType}
                    onChange={(e) => setMutasiType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white cursor-pointer"
                  >
                    <option value="GRADUATED">🎓 Lulus / Alumni Diniyyah (Kewenangan Madrasah)</option>
                    {mutasiSantriTarget.residenceType === "UNIT_LAIN" && (
                      <>
                        <option value="ACTIVE">✅ Aktif Pembelajaran</option>
                        <option value="CUTI">🌴 Cuti Pembelajaran Diniyyah</option>
                        <option value="MUTATED">🔄 Mutasi Pindah</option>
                        <option value="DROPPED">❌ Keluar / Off</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Catatan / Alasan</label>
                  <textarea
                    rows={3}
                    value={mutasiNotes}
                    onChange={(e) => setMutasiNotes(e.target.value)}
                    placeholder="Masukkan alasan Cuti / Mutasi..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium dark:text-white outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowMutasiModal(false)} className="px-4 py-2 text-xs font-bold text-zinc-500">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md">Simpan Perubahan Status</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
