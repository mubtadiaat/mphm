"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, MapPin, UploadCloud, Camera, User, Heart, Award,
  Calendar, Hash, Phone, FileText, Home, BookOpen, ExternalLink, ShieldCheck, Download, Layers, Lock, Search
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
import { useAuth } from "@/lib/auth";

interface SiswaTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
  workspace?: WorkspaceType;
}

export function SantriTab({ onViewDetail, isReadOnly = false, selectedYearId, workspace: propWorkspace }: SiswaTabProps) {
  const { data: authSession } = useAuth();
  let contextWorkspace: WorkspaceType = "madrasah";
  try {
    const ws = useWorkspace();
    contextWorkspace = ws.activeWorkspace;
  } catch (_) { }

  const activeWorkspace = propWorkspace || contextWorkspace;
  const isPondok = activeWorkspace === "pondok";

  const [activeSubTab, setActiveSubTab] = useState<"aktif" | "cuti" | "tanpa_kelas" | "alumni" | "mutasi">("aktif");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<string>("ALL");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  useEffect(() => {
    if (authSession?.supervisedLevel && selectedJenjangFilter === "ALL") {
      setSelectedJenjangFilter(authSession.supervisedLevel);
    }
  }, [authSession?.supervisedLevel]);

  const { data: queryResult, isLoading, createSantri, updateSantri, deleteSantri } = useSantri(
    selectedYearId,
    pageIndex,
    pageSize,
    searchQuery,
    activeSubTab,
    selectedClassFilter !== "ALL" ? selectedClassFilter : undefined,
    selectedJenjangFilter !== "ALL" ? selectedJenjangFilter : undefined,
    isPondok ? "pondok" : "madrasah"
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

  // Feature: Tarik Data Santriwati Pondok (P3HM) -> Siswi Madrasah (MPHM)
  const [pondokSantriList, setPondokSantriList] = useState<Santri[]>([]);
  const [selectedPondokSantriId, setSelectedPondokSantriId] = useState("");
  const [newResidenceType, setNewResidenceType] = useState<"PONDOK_MUBTADIAAT" | "UNIT_LAIN">("PONDOK_MUBTADIAAT");
  const [newExternalResidenceName, setNewExternalResidenceName] = useState("");
  const [newExternalResidenceCustom, setNewExternalResidenceCustom] = useState("");

  useEffect(() => {
    if (showFormModal && !isPondok && !editingSantri) {
      apiRequest<{ data: Santri[] }>("/api/admin/people?role=student&scope=pondok&limit=1000")
        .then((res) => {
          if (res.data) setPondokSantriList(res.data);
        })
        .catch((err) => console.error("Failed to load Pondok Santriwati list", err));
    }
  }, [showFormModal, isPondok, editingSantri]);

  const handleSelectPondokSantri = (id: string) => {
    setSelectedPondokSantriId(id);
    const target = pondokSantriList.find((s) => s.id === id);
    if (target) {
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
      toast(`✅ Data ${target.name} (${target.stambuk}) ditarik dari Santriwati Pondok!`, "success");
    }
  };

  // Pondok Search States for Madrasah Pulling
  const [showPondokPullModal, setShowPondokPullModal] = useState(false);
  const [pondokSearchQuery, setPondokSearchQuery] = useState("");
  const [pondokCandidates, setPondokCandidates] = useState<Santri[]>([]);
  const [isSearchingPondok, setIsSearchingPondok] = useState(false);
  const [hasSearchedPondok, setHasSearchedPondok] = useState(false);

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
    setNewJenjang("");
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
    if (!isPondok) {
      setPondokSearchQuery("");
      setPondokCandidates([]);
      setHasSearchedPondok(false);
      setShowPondokPullModal(true);
    } else {
      resetFormFields();
      setShowFormModal(true);
    }
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
    handleSelectPondokSantri(candidate.id);
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
    const label = isPondok ? "santriwati" : "siswi";
    const isConfirmed = await confirm({
      title: `Hapus Data ${label.toUpperCase()}?`,
      message: `Apakah Anda yakin ingin menghapus data ${label} ini secara permanen dari sistem?`,
      confirmText: "Ya, Hapus Data",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        await deleteSantri(id);
        toast(`Data ${label} berhasil dihapus!`, "success");
      } catch (_err) {
        toast(`Gagal menghapus data ${label}.`, "error");
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
        throw new Error(cloudinaryData.error?.message || "Gagal mengunggah gambar ke Cloud Storage.");
      }

      setAvatarUrl(cloudinaryData.secure_url);
      toast("Pas foto berhasil diunggah!", "success");
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

    if (!isPondok && !editingSantri && newResidenceType === "PONDOK_MUBTADIAAT" && !selectedPondokSantriId) {
      toast("Harap pilih Santriwati Pondok (P3HM) terlebih dahulu atau ubah Status Asrama ke 'Unit Asrama Lain'!", "warning");
      return;
    }

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
        room: isPondok || newResidenceType === "PONDOK_MUBTADIAAT" ? newRoom : undefined,
        residenceType: isPondok ? "PONDOK_MUBTADIAAT" : newResidenceType,
        externalResidenceName: newResidenceType === "UNIT_LAIN"
          ? (newExternalResidenceName === "Lainnya" ? newExternalResidenceCustom : newExternalResidenceName)
          : null,
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
        });
        toast(`${isPondok ? "Santriwati" : "Siswi"} baru ${newName} berhasil didaftarkan!`, "success");
      }

      setShowFormModal(false);
    } catch (_err) {
      toast("Gagal menyimpan data.", "error");
    }
  };

  const handleOpenMutasi = (student: Santri) => {
    if (onViewDetail) {
      onViewDetail(student as unknown as Record<string, unknown>);
    }
    setSelectedSantriForDetail(student);
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
      header: "Kamar & Blok Komplek",
      cell: (info) => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            {info.row.original.roomName && info.row.original.roomName !== "-"
              ? info.row.original.roomName
              : "-"}
          </span>
          <span className="text-xs text-zinc-500 font-semibold">
            {info.row.original.buildingName && info.row.original.buildingName !== "-"
              ? info.row.original.buildingName
              : "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "mustahiq",
      header: "Musyrifah / Wali Kamar",
      cell: (info) => (
        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-left">
          {info.row.original.roomSupervisor && info.row.original.roomSupervisor !== "-"
            ? info.row.original.roomSupervisor
            : info.row.original.mustahiq && info.row.original.mustahiq !== "-"
              ? info.row.original.mustahiq
              : "-"}
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
      cell: (info) => {
        const val = info.getValue() as string;
        if (val === "BOYONG_PENDING") {
          return (
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] rounded-md border border-amber-500/20 inline-flex items-center gap-1">
              ⏳ Pengajuan Boyong (Membutuhkan Approval Pondok)
            </span>
          );
        }
        return <PillBadge label={val === "ACTIVE" ? "AKTIF ASRAMA" : val} variant={val === "ACTIVE" ? "success" : "warning"} />;
      },
    },
    {
      id: "actions",
      header: "Aksi Management & Approval",
      cell: (info) => {
        const row = info.row.original;
        if (row.status === "BOYONG_PENDING") {
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Setujui Permohonan Boyong?",
                    message: `Apakah Anda yakin ingin menyetujui (Approve) status Boyong untuk santriwati ${row.name}? Status di Pondok & Madrasah akan diubah menjadi BOYONG RESMI.`,
                    confirmText: "Ya, Setujui Boyong",
                    cancelText: "Batal",
                    type: "danger",
                  });
                  if (ok) {
                    await updateSantri({ id: row.id, data: { status: "DROPPED" } });
                    toast(`✅ Permohonan Boyong ${row.name} Berhasil Disetujui oleh Pondok P3HM!`, "success", "Boyong Disetujui");
                  }
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                ✅ Setujui Boyong
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Tolak Permohonan Boyong?",
                    message: `Apakah Anda yakin ingin menolak pengajuan Boyong untuk santriwati ${row.name}? Status santriwati akan dikembalikan menjadi AKTIF.`,
                    confirmText: "Tolak Pengajuan",
                    cancelText: "Batal",
                    type: "warning",
                  });
                  if (ok) {
                    await updateSantri({ id: row.id, data: { status: "ACTIVE" } });
                    toast(`Pengajuan Boyong ${row.name} ditolak. Status dikembalikan ke AKTIF.`, "info");
                  }
                }}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-lg cursor-pointer"
              >
                ❌ Tolak
              </button>
            </div>
          );
        }
        return (
          <TableActions
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDeleteSantri(row.id)}
            onMutasi={() => handleOpenMutasi(row)}
            isReadOnly={isReadOnly}
          />
        );
      },
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
      cell: (info) => <PillBadge label={info.getValue() as string} variant={info.getValue() === "ACTIVE" ? "success" : "warning"} />,
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
    "Kamar Aktif",
    "Kamar / Asrama",
    "Tahun Masuk",
    "Tahun Keluar",
    "Tahun Lulus",
    "Status Keaktifan",
    "Provinsi",
    "Kabupaten / Kota",
    "Kecamatan",
    "Desa / Kelurahan",
    "Alamat Lengkap (Jalan / RT / RW / No. Rumah)",
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
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header Halaman Dinamis (PONDOK vs MADRASAH) */}
      <div className={`relative overflow-hidden p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-md text-white ${isPondok
        ? "bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-900 border border-emerald-500/30"
        : "bg-linear-to-r from-indigo-700 via-blue-700 to-indigo-900 border border-indigo-500/30"
        }`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 sm:gap-2 z-10">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 bg-black/20 rounded-full border border-white/20 w-fit backdrop-blur-xs">
            {isPondok ? <Home className="w-3.5 h-3.5 text-emerald-300" /> : <BookOpen className="w-3.5 h-3.5 text-blue-300" />}
            <span>{isPondok ? "Workspace Pondok Pesantren Putri [P3HM Lirboyo]" : "Workspace Madrasah Diniyyah Putri [MPHM Lirboyo]"}</span>
          </div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            {isPondok ? "Data Induk Santriwati Asrama (P3HM)" : "Data Induk Siswi Diniyyah (MPHM)"}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {isPondok
              ? "Administrasi data santriwati pengasuhan asrama terintegrasi dengan Nomor Stambuk, Kamar Asrama, Musyrifah Wali Kamar, dan Smart KK Mapping."
              : "Administrasi data siswi madrasah diniyyah terintegrasi dengan Nomor Stambuk, NIS/NISN, Kelas Rombel, Mustahiq, Raport Kwartal, dan Smart KK."
            }
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            type="button"
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 border border-white/20 ${isPondok ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950" : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isPondok ? "+ Registrasi Santriwati Baru" : "+ Tarik Data Siswi dari Pondok (P3HM)"}</span>
          </button>
        )}
      </div>

      {/* Rules Notice Banner for Santri/Siswi */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3 text-xs font-semibold text-blue-900 dark:text-blue-200 shadow-xs">
        <span className="text-base">✨</span>
        <span>
          <strong>Ketentuan Data Siswi &amp; Kewenangan:</strong>
          {isPondok
            ? " Seluruh status santriwati (Aktif, Cuti, Keluar/Boyong) dikelola dan disetujui di Pondok P3HM."
            : " Data siswi asal P3HM terisi otomatis melalui penarikan data Pondok. Pihak Madrasah berwenang menetapkan Kelas, Lokal, Status Cuti (langsung), & Status Lulus/Alumni. Status Boyong memerlukan persetujuan (approval) Pondok P3HM."}
        </span>
      </div>

      {/* Sub-tabs Menu */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("aktif")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "aktif"
            ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          {isPondok ? "Santriwati Asrama Aktif" : "Siswi Diniyyah Aktif"}
        </button>
        {!isPondok && (
          <button
            onClick={() => setActiveSubTab("cuti")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === ("cuti" as any)
              ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
          >
            Siswi Cuti Diniyyah 🌴
          </button>
        )}
        {!isPondok && (
          <button
            onClick={() => setActiveSubTab("tanpa_kelas")}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "tanpa_kelas"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
          >
            Tanpa Kelas / Belum Belajar
          </button>
        )}
        <button
          onClick={() => setActiveSubTab("alumni")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "alumni"
            ? isPondok ? "border-teal-600 text-teal-600 dark:text-teal-400 font-extrabold" : "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          {isPondok ? "Santriwati Khidmah P3HM" : "Siswi Alumni / Lulus"}
        </button>
        <button
          onClick={() => setActiveSubTab("mutasi")}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${activeSubTab === "mutasi"
            ? "border-rose-600 text-rose-600 dark:text-rose-400 font-extrabold"
            : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
        >
          {isPondok ? "Santriwati Boyong" : "Mutasi & Keluar"}
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
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            {userSupervisedLevel ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Jenjang Pengawasan Terkunci:</span>
                <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-blue-600 text-white shadow-xs">
                  {userSupervisedLevel}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Filter Jenjang:</span>
                <button
                  type="button"
                  onClick={() => setSelectedJenjangFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${selectedJenjangFilter === "ALL"
                      ? "bg-blue-600 text-white font-extrabold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJenjangFilter("Ibtida'iyyah")}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${selectedJenjangFilter === "Ibtida'iyyah"
                      ? "bg-blue-600 text-white font-extrabold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                >
                  Ibtida'iyyah
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJenjangFilter("Tsanawiyyah")}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${selectedJenjangFilter === "Tsanawiyyah"
                      ? "bg-blue-600 text-white font-extrabold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                >
                  Tsanawiyyah
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJenjangFilter("Aliyyah")}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${selectedJenjangFilter === "Aliyyah"
                      ? "bg-blue-600 text-white font-extrabold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                >
                  Aliyyah
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJenjangFilter("I'dadiyyah")}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${selectedJenjangFilter === "I'dadiyyah"
                      ? "bg-blue-600 text-white font-extrabold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                >
                  I'dadiyyah
                </button>
              </div>
            )}

            {availableClasses.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Filter Kelas:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kelas ({availableClasses.length})</option>
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      })()}

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
          disableImport: isReadOnly,
          title: isPondok
            ? "Data Induk Santriwati Asrama (P3HM Lirboyo)"
            : "Data Induk Siswi Diniyyah (MPHM Lirboyo)",
          headers: excelHeaders,
          onExportFetchAll: async () => {
            const statusParam = activeSubTab === "tanpa_kelas" ? "without_class" : activeSubTab;
            let url = `/api/admin/people?role=student&limit=10000&offset=0&status=${statusParam}`;
            if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
            const res = await apiRequest<{ data: Santri[] }>(url);
            return res?.data || [];
          },
          onImportSuccess: async (importedRows) => {
            let successCount = 0;
            for (const r of importedRows) {
              const nameVal = r["Nama Lengkap Santriwati"] || r["Nama Lengkap"] || r["nama"] || "";
              if (!nameVal.trim()) continue;
              try {
                const rawJenjang = r["Jenjang Aktif"] || r["Jenjang"] || "";
                const rawKelas = r["Kelas Aktif"] || r["Kelas"] || "";
                let fullClassName = rawKelas.trim();
                if (rawJenjang.trim() && rawKelas.trim() && !rawKelas.toLowerCase().includes(rawJenjang.toLowerCase())) {
                  fullClassName = `${rawJenjang.trim()} ${rawKelas.trim()}`;
                }

                const rawProv = r["Provinsi"] || r["provinsi"] || "";
                const rawKab = r["Kabupaten / Kota"] || r["Kabupaten"] || r["Kota"] || r["kabupaten"] || "";
                const rawKec = r["Kecamatan"] || r["kecamatan"] || "";
                const rawDesa = r["Desa / Kelurahan"] || r["Kelurahan"] || r["Desa"] || r["desa"] || "";
                const rawStreet = r["Alamat Lengkap (Jalan / RT / RW / No. Rumah)"] || r["Jalan / RT / RW"] || r["Alamat Lengkap"] || r["Alamat"] || "";

                let formattedAddress = rawStreet;
                const addrParts = [rawStreet, rawDesa, rawKec, rawKab, rawProv].map((s: string) => (s || "").trim()).filter(Boolean);
                if (addrParts.length > 1) {
                  formattedAddress = addrParts.join(", ");
                }

                const rawKamar = r["Kamar Aktif"] || r["Kamar / Asrama"] || r["Kamar Asrama"] || r["Nama Kamar"] || r["Kamar"] || r["Asrama"] || r["kamar"] || "";

                await createSantri({
                  name: nameVal,
                  nik: r["NIK Santri (16 Digit)"] || r["NIK Santri"] || r["NIK"] || r["nik"] || "",
                  gender: "P",
                  birthPlace: r["Tempat Lahir"] || r["tempat_lahir"] || "",
                  birthDate: r["Tanggal Lahir"] || r["tanggal_lahir"] || "",
                  phoneNumber: r["No. HP / WA Santri"] || r["No Telepon"] || r["phone"] || "",
                  stambuk: r["Nomor Stambuk"] || r["stambuk"] || "",
                  nis: r["NIS"] || r["Nomor Stambuk"] || r["stambuk"] || "",
                  nisn: r["NISN"] || "",
                  class: fullClassName || "Belum Ditentukan",
                  room: rawKamar.trim() || undefined,
                  enrollmentYear: Number(r["Tahun Masuk"]) || new Date().getFullYear(),
                  graduationYear: r["Tahun Lulus"] ? Number(r["Tahun Lulus"]) : undefined,
                  status: r["Status Keaktifan"] || "ACTIVE",
                  address: formattedAddress || "",
                  mustahiq: isPondok ? "Ustadzah Musyrifah" : "Ustadz Mustahiq",
                  guardianName: r["Nama Lengkap Wali"] || r["Nama Wali"] || "Wali Santri",
                  guardianRelation: (r["Hubungan Keluarga"] as any) || "WALI",
                  guardianPhone: r["No. HP / WA Wali"] || r["No Telepon Wali"] || "",
                  familyCardNumber: r["Nomor Kartu Keluarga (KK)"] || r["Nomor KK"] || "",
                  guardianNik: r["NIK Wali (16 Digit)"] || r["NIK Wali"] || ""
                });
                successCount++;
              } catch (e) {
                console.error("Gagal import baris:", r, e);
              }
            }
            if (successCount > 0) {
              toast(`${successCount} dari ${importedRows.length} data Santriwati berhasil diimpor!`, "success", "Import Berhasil");
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
                <button onClick={() => setShowPondokPullModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"><X className="w-5 h-5" /></button>
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
              <div className={`p-5 border-b flex justify-between items-center ${isPondok
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50"
                : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50"
                }`}>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {editingSantri
                      ? `Edit Data: ${editingSantri.name}`
                      : (isPondok ? "Registrasi Santriwati Asrama Baru (P3HM)" : "Tarik & Daftarkan Siswi Diniyyah (MPHM) dari Pondok")
                    }
                  </h3>
                  <p className="text-xs text-zinc-500">Lengkapi data 6-bagian: identitas pribadi, akademis/kamar, alamat (dropdown wilayah), wali (Smart KK), dan khidmah.</p>
                </div>
                <button onClick={() => setShowFormModal(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Feature: Tarik Data Santriwati Pondok (P3HM) & Input Unit Lain */}
                {!isPondok && !editingSantri && (
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
                      Format formal 3x4. Max file 2MB (JPG/PNG). Diunggah langsung ke Cloud Storage.
                    </p>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs cursor-pointer border border-blue-150 dark:border-blue-900/40 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      <span>Unggah Pas Foto</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} disabled={uploadingImage} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Form Fields - I. Pribadi */}
                {(() => {
                  const isPondokSantriLocked = !isPondok && !editingSantri && newResidenceType === "PONDOK_MUBTADIAAT" && !!selectedPondokSantriId;
                  return (
                    <div className="space-y-4">
                      {isPondokSantriLocked && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-xs">
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>🔒 FORM IDENTITAS & ALAMAT TERKUNCI: Data ditarik resmi dari Pondok P3HM Lirboyo. Madrasah hanya menentukan Jenjang & Kelas Diniyyah.</span>
                        </div>
                      )}
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span>I. Informasi Pribadi</span>
                        {isPondokSantriLocked && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">TERKUNCI DARI PONDOK</span>}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-zinc-500">Nama Lengkap Santriwati *</label>
                          <input type="text" required disabled={isPondokSantriLocked} value={newName} onChange={(e) => setNewName(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm disabled:opacity-75 disabled:cursor-not-allowed" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-zinc-500">NIK (16 Digit) *</label>
                          <input type="text" required maxLength={16} disabled={isPondokSantriLocked} value={newNik} onChange={(e) => setNewNik(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono disabled:opacity-75 disabled:cursor-not-allowed" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-zinc-500">Tempat Lahir</label>
                          <input type="text" disabled={isPondokSantriLocked} value={newBirthPlace} onChange={(e) => setNewBirthPlace(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm disabled:opacity-75 disabled:cursor-not-allowed" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-zinc-500">Tanggal Lahir</label>
                          <input type="date" disabled={isPondokSantriLocked} value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm disabled:opacity-75 disabled:cursor-not-allowed" />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-zinc-500">No. HP / WA Santri</label>
                          <input type="text" disabled={isPondokSantriLocked} value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono disabled:opacity-75 disabled:cursor-not-allowed" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Form Fields - II. Akademis / Keasramaan (Tarik Data > Isi Jenjang > Isi Kelas) */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      II. Informasi Akademik & Asrama (Alur: Tarik Data ➔ Isi Jenjang ➔ Isi Kelas)
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 w-fit">
                      {isPondok ? "Sistem Keasramaan (P3HM)" : "1. Tarik Data ➔ 2. Isi Jenjang ➔ 3. Isi Kelas"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Nomor Stambuk *</label>
                      <input type="text" required disabled={!isPondok && !editingSantri && newResidenceType === "PONDOK_MUBTADIAAT" && !!selectedPondokSantriId} value={newStambuk} onChange={(e) => setNewStambuk(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono disabled:opacity-75 disabled:cursor-not-allowed" />
                    </div>

                    {/* STEPS 2: ISI JENJANG DINIYYAH */}
                    {!isPondok ? (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500 flex items-center justify-between">
                          <span>Jenjang Diniyyah *</span>
                          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">Langkah 2</span>
                        </label>
                        <select
                          value={newJenjang}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewJenjang(val);
                            const avail = dbClasses.filter((c) => (c.institutionLevel || c.name || "").toLowerCase().includes(val.toLowerCase()));
                            if (avail.length > 0) {
                              setNewClass(avail[0].name);
                            }
                          }}
                          className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400"
                        >
                          <option value="Ibtida'iyyah">Ibtida'iyyah</option>
                          <option value="Tsanawiyyah">Tsanawiyyah</option>
                          <option value="Aliyyah">Aliyyah</option>
                          <option value="I'dadiyyah">I'dadiyyah</option>
                        </select>
                      </div>
                    ) : null}

                    {/* STEPS 3: ISI KELAS DINIYYAH (Filtered by Jenjang) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 flex items-center justify-between">
                        <span>{isPondok ? "Kelas Diniyyah (Database) *" : "Kelas Diniyyah (Filtered) *"}</span>
                        {!isPondok && <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">Langkah 3</span>}
                      </label>
                      <select
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400"
                      >
                        {(() => {
                          const filtered = (!isPondok && newJenjang)
                            ? dbClasses.filter((c) => (c.institutionLevel || c.name || "").toLowerCase().includes(newJenjang.toLowerCase()))
                            : dbClasses;

                          return filtered.length > 0 ? (
                            filtered.map((c) => (
                              <option key={c.id} value={c.name}>{c.name} ({c.mustahiq || "Wali Kelas"})</option>
                            ))
                          ) : (
                            <option value="">{dbClasses.length > 0 ? `-- Tidak Ada Kelas ${newJenjang} --` : "-- Pilih Kelas Diniyyah --"}</option>
                          );
                        })()}
                      </select>
                    </div>

                    {/* DROPDOWN KAMAR ASRAMA DARI MENU/DATABASE */}
                    {isPondok && (
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
                            <option value="">-- Pilih Kamar Asrama --</option>
                          )}
                        </select>
                      </div>
                    )}
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
                      <input type="text" required disabled={!isPondok && !editingSantri && newResidenceType === "PONDOK_MUBTADIAAT" && !!selectedPondokSantriId} value={newGuardianName} onChange={(e) => setNewGuardianName(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm disabled:opacity-75 disabled:cursor-not-allowed" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Nomor Kartu Keluarga (KK) *</label>
                      <input type="text" required maxLength={16} disabled={!isPondok && !editingSantri && newResidenceType === "PONDOK_MUBTADIAAT" && !!selectedPondokSantriId} value={newFamilyCardNumber} onChange={(e) => setNewFamilyCardNumber(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono disabled:opacity-75 disabled:cursor-not-allowed" />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-500">No. WhatsApp Wali *</label>
                      <input type="text" required disabled={!isPondok && !editingSantri && newResidenceType === "PONDOK_MUBTADIAAT" && !!selectedPondokSantriId} value={newGuardianPhone} onChange={(e) => setNewGuardianPhone(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono disabled:opacity-75 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 text-sm font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-xl">Batal</button>
                  <button type="submit" className={`px-6 py-2 text-sm font-bold text-white rounded-xl shadow-md ${isPondok ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {editingSantri ? "Simpan Perubahan" : (isPondok ? "Daftarkan Santriwati" : "Tarik & Daftarkan Siswi")}
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
              <div className={`p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md ${isPondok
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
                          <span>
                            Kamar: {selectedSantriForDetail.roomName && selectedSantriForDetail.roomName !== "-"
                              ? `${selectedSantriForDetail.roomName} (${selectedSantriForDetail.buildingName || "Asrama"})`
                              : selectedSantriForDetail.class || "Belum Ditentukan"}
                          </span>
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
                    className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${detailActiveSection === tab.id
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
                      <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                        {isPondok
                          ? (selectedSantriForDetail.roomName && selectedSantriForDetail.roomName !== "-"
                            ? selectedSantriForDetail.roomName
                            : selectedSantriForDetail.class)
                          : selectedSantriForDetail.class}
                      </p>
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
                          <span className="text-xs text-zinc-400">Akses Raport Kwartal</span>
                        </div>
                      </div>
                      <button onClick={() => toast("Membuka Raport Kwartal...", "info")} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg flex items-center gap-1">
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
