"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Search, Filter, Plus, CheckCircle2, XCircle, 
  Clock, CheckCheck, Trash2, Calendar, User, AlertCircle, X, Loader2 
} from "lucide-react";
import { PillBadge } from "@/components/shared/PillBadge";
import { useToast } from "@/components/shared/ToastContext";
import { useAuth } from "@/lib/auth";

export interface StudentPermitData {
  id: string;
  studentId: string;
  studentName: string;
  stambuk: string;
  permitType: "PULANG" | "SAMBANGAN" | "KELUAR";
  reason: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  approvedByName: string;
  notes?: string;
  createdAt: string;
}

export function PerizinanManagementView() {
  const { data: user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [permitType, setPermitType] = useState<"PULANG" | "SAMBANGAN" | "KELUAR">("PULANG");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Fetch Permits List
  const { data: permitsResponse, isLoading, refetch } = useQuery({
    queryKey: ["permits", statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      
      const res = await fetch(`/api/disciplinary/permits?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data perizinan");
      return res.json();
    },
  });

  // Fetch Students for dropdown
  const { data: studentsResponse } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/people?role=santri&limit=100");
      if (!res.ok) throw new Error("Gagal mengambil data santri");
      return res.json();
    },
    enabled: isModalOpen,
  });

  const permits: StudentPermitData[] = permitsResponse?.data || [];
  const studentsList = studentsResponse?.data || [];

  // Create Permit Mutation
  const createPermitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/disciplinary/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal membuat perizinan");
      }
      return res.json();
    },
    onSuccess: () => {
      toast("Pengajuan perizinan berhasil dibuat!", "success");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["permits"] });
    },
    onError: (err: any) => {
      toast(err.message || "Gagal menyimpan perizinan", "error");
    },
  });

  // Update Status Mutation (Approve / Reject / Complete)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await fetch(`/api/disciplinary/permits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          approvedById: user?.personId || undefined,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status perizinan");
      return res.json();
    },
    onSuccess: (data) => {
      toast(data.message || "Status perizinan berhasil diperbarui!", "success");
      queryClient.invalidateQueries({ queryKey: ["permits"] });
    },
    onError: (err: any) => {
      toast(err.message || "Gagal memperbarui status", "error");
    },
  });

  // Delete Mutation
  const deletePermitMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/disciplinary/permits/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus data perizinan");
      return res.json();
    },
    onSuccess: () => {
      toast("Data perizinan berhasil dihapus", "success");
      queryClient.invalidateQueries({ queryKey: ["permits"] });
    },
    onError: (err: any) => {
      toast(err.message || "Gagal menghapus data", "error");
    },
  });

  const resetForm = () => {
    setSelectedStudentId("");
    setPermitType("PULANG");
    setReason("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !reason.trim()) {
      toast("Santri dan Alasan Perizinan wajib diisi", "error");
      return;
    }

    createPermitMutation.mutate({
      studentId: selectedStudentId,
      permitType,
      reason: reason.trim(),
      startDate,
      endDate,
      notes: notes.trim() || undefined,
    });
  };

  // Filtered List based on client search
  const filteredPermits = permits.filter((p) => {
    const query = (searchQuery || "").toLowerCase();
    if (!query) return true;
    const nameStr = (p.studentName || "").toLowerCase();
    const stambukStr = (p.stambuk || "").toLowerCase();
    const reasonStr = (p.reason || "").toLowerCase();
    return nameStr.includes(query) || stambukStr.includes(query) || reasonStr.includes(query);
  });

  // Stats calculation
  const totalCount = permits.length;
  const pendingCount = permits.filter((p) => p.status === "PENDING").length;
  const approvedCount = permits.filter((p) => p.status === "APPROVED").length;
  const completedCount = permits.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Manajemen Kedisiplinan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Sistem Perizinan Santri
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Kelola pengajuan surat izin pulang, sambangan wali santri, dan perizinan keluar komplek secara terintegrasi.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="z-10 inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Perizinan Baru</span>
        </button>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-400">Total Permohonan</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-500">Menunggu (Pending)</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-500">Disetujui</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-indigo-500">Selesai / Kembali</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{completedCount}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari santri, stambuk, alasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">PENDING (Menunggu)</option>
            <option value="APPROVED">APPROVED (Disetujui)</option>
            <option value="REJECTED">REJECTED (Ditolak)</option>
            <option value="COMPLETED">COMPLETED (Selesai)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="PULANG">Izin Pulang</option>
            <option value="SAMBANGAN">Sambangan</option>
            <option value="KELUAR">Izin Keluar</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Memuat data perizinan...</p>
          </div>
        ) : filteredPermits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center gap-3">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Tidak ada data perizinan</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Belum ada permohonan izin yang sesuai dengan kriteria pencarian atau filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Santriwati</th>
                  <th className="py-4 px-4">Jenis Izin</th>
                  <th className="py-4 px-6">Alasan Permohonan</th>
                  <th className="py-4 px-4">Periode Tanggal</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Penyetuju / Catatan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {filteredPermits.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white leading-tight">{item.studentName}</p>
                          <p className="text-xs text-zinc-400">Stambuk: {item.stambuk}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${
                        item.permitType === "PULANG" 
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : item.permitType === "SAMBANGAN"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}>
                        {item.permitType}
                      </span>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium line-clamp-2">{item.reason}</p>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.startDate} s/d {item.endDate}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.status === "APPROVED" && <PillBadge label="DISETUJUI" variant="success" />}
                      {item.status === "PENDING" && <PillBadge label="MENUNGGU" variant="warning" />}
                      {item.status === "REJECTED" && <PillBadge label="DITOLAK" variant="danger" />}
                      {item.status === "COMPLETED" && <PillBadge label="SELESAI" variant="info" />}
                    </td>

                    <td className="py-4 px-4 text-xs text-zinc-500">
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">{item.approvedByName}</p>
                      {item.notes && <p className="text-zinc-400 italic line-clamp-1">{item.notes}</p>}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === "PENDING" && (
                          <>
                            <button
                              title="Setujui Perizinan"
                              onClick={() => updateStatusMutation.mutate({ id: item.id, status: "APPROVED" })}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              title="Tolak Perizinan"
                              onClick={() => updateStatusMutation.mutate({ id: item.id, status: "REJECTED" })}
                              className="p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {item.status === "APPROVED" && (
                          <button
                            title="Tandai Santri Kembali (Selesai)"
                            onClick={() => updateStatusMutation.mutate({ id: item.id, status: "COMPLETED" })}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Kembali</span>
                          </button>
                        )}

                        <button
                          title="Hapus Record"
                          onClick={() => {
                            if (confirm("Apakah Anda yakin ingin menghapus data perizinan ini?")) {
                              deletePermitMutation.mutate(item.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat Perizinan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Pengajuan Perizinan Baru</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pilih Santriwati <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Pilih Santri --</option>
                  {studentsList.map((st: any) => (
                    <option key={st.id} value={st.id}>
                      {st.person?.fullName} ({st.stambukNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Jenis Perizinan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={permitType}
                  onChange={(e) => setPermitType(e.target.value as any)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="PULANG">Izin Pulang (Ke Rumah)</option>
                  <option value="SAMBANGAN">Sambangan Wali Santri</option>
                  <option value="KELUAR">Izin Keluar Komplek Pesantren</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tanggal Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tanggal Selesai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Alasan Permohonan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tuliskan alasan lengkap pengajuan izin..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nama pendamping / instruksi khusus..."
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createPermitMutation.isPending}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {createPermitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan & Ajukan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
