"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileBadge, X, Printer, Award, Search, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { IdentityCell } from "@/components/shared/IdentityCell";
import { useSantri, Santri } from "../queries/useSantri";

export function SertifikatTab() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenjang, setSelectedJenjang] = useState<string>("I'dadiyah");

  const { data: remoteData = { data: [], total: 0 }, isLoading } = useSantri(
    undefined,
    pageIndex,
    pageSize,
    searchQuery,
    "aktif",
    selectedJenjang === "semua" ? undefined : selectedJenjang
  );

  const [showPreview, setShowPreview] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<Santri | null>(null);

  const displayedStudents = remoteData.data;

  const handleCetak = (student: Santri) => {
    setPreviewStudent(student);
    setShowPreview(true);
  };

  const columns: ColumnDef<Santri, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Santriwati & Stambuk",
      cell: (info) => (
        <IdentityCell
          name={info.getValue() as string}
          subInfo={`Stambuk: ${info.row.original.stambuk} • NIK: ${info.row.original.nik || "-"}`}
          stambuk={info.row.original?.stambuk}
          avatarUrl={info.row.original?.avatarUrl}
        />
      ),
    },
    {
      accessorKey: "class",
      header: "Kelas Diniyyah",
      cell: (info) => (
        <span className="font-bold text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg text-xs border border-amber-200 dark:border-amber-800/50">
          {info.getValue() as string || "Belum Ditentukan"}
        </span>
      ),
    },
    {
      accessorKey: "guardianName",
      header: "Wali Santri",
      cell: (info) => (
        <span className="text-zinc-700 dark:text-zinc-300 font-medium text-xs">
          {info.getValue() as string || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi Cetak Dokumen",
      cell: (info) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCetak(info.row.original);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>Cetak Sertifikat</span>
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner Header Enterprise Style */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-amber-600 via-orange-600 to-amber-800 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider px-3 py-1 bg-black/20 rounded-full border border-white/20 w-fit backdrop-blur-xs text-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dokumen Resmi Kelulusan Siswi</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Pencetakan Sertifikat Kelulusan
          </h1>
          <p className="text-amber-100/90 text-sm leading-relaxed">
            Pusat penerbitan sertifikat resmi (Syahadah) kelulusan santriwati per jenjang pendidikan (I&apos;dadiyyah, Tsanawiyyah, Aliyyah). Terintegrasi dengan stambuk abadi dan legalitas pesantren.
          </p>
        </div>

        <div className="flex sm:flex-col justify-center items-end gap-2 z-10 shrink-0">
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-3">
            <FileBadge className="w-8 h-8 text-amber-200" />
            <div>
              <div className="text-2xl font-black">{remoteData.total}</div>
              <div className="text-[11px] font-medium text-amber-100">Total Siswi Berhak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs Jenjang */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px">
        {[
          { id: "I'dadiyah", label: "Jenjang I'dadiyyah" },
          { id: "Tsanawiyyah", label: "Jenjang Tsanawiyyah" },
          { id: "Aliyyah", label: "Jenjang Aliyyah" },
          { id: "semua", label: "Semua Jenjang" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedJenjang(tab.id);
              setPageIndex(0);
            }}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              selectedJenjang === tab.id
                ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Grid */}
      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={displayedStudents as unknown as Record<string, unknown>[]}
        pageCount={Math.ceil(remoteData.total / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        onRowClick={(row) => handleCetak(row as unknown as Santri)}
        tableName="sertifikat_kelulusan"
      />

      {/* Sertifikat Print Preview Modal */}
      <AnimatePresence>
        {showPreview && previewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowPreview(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-zinc-50 dark:bg-zinc-900 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">Print Preview Sertifikat Kelulusan</h3>
                    <p className="text-xs text-zinc-500">Santriwati: {previewStudent.name} ({previewStudent.stambuk})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-200/60 dark:bg-zinc-950/60">
                {/* Kertas Landscape Simulation */}
                <div className="bg-white text-black p-12 w-full max-w-[297mm] min-h-[210mm] shadow-xl border-[10px] border-double border-amber-800 flex flex-col items-center justify-between text-center relative overflow-hidden rounded-sm">
                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />

                  {/* Top Header Decorative */}
                  <div className="z-10 w-full flex flex-col items-center border-b-2 border-amber-800/30 pb-6 mb-6">
                    <div className="text-xs tracking-widest text-amber-800 font-bold uppercase mb-1">
                      MADRASAH PUTRI HIDAYATUL MUBTADI&apos;AAT [MPHM]
                    </div>
                    <div className="text-xs text-zinc-600">PONDOK PESANTREN LIRBOYO KEDIRI JAWA TIMUR</div>
                    <h1 className="text-4xl font-serif text-amber-900 font-bold mt-4 tracking-wider">
                      SYAHADAH KELULUSAN
                    </h1>
                    <h2 className="text-lg font-serif text-amber-800 font-semibold mt-1">
                      Tingkat {previewStudent.class || selectedJenjang}
                    </h2>
                  </div>

                  {/* Body Content */}
                  <div className="z-10 w-full flex flex-col items-center my-4">
                    <p className="text-base text-zinc-700 italic mb-4">Diberikan Kepada Santriwati:</p>
                    <h3 className="text-4xl font-bold text-amber-950 mb-2 font-serif tracking-wide border-b-2 border-amber-900/20 pb-2 px-8">
                      {previewStudent.name}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-zinc-700 mb-6 font-mono">
                      <span>Stambuk: <strong>{previewStudent.stambuk}</strong></span>
                      <span>•</span>
                      <span>NIK: <strong>{previewStudent.nik || "-"}</strong></span>
                    </div>

                    <p className="max-w-2xl mx-auto text-base leading-relaxed text-zinc-800 mb-6 font-serif">
                      Telah menyelesaikan seluruh rangkaian ujian dan dinyatakan <strong>LULUS</strong> pada jenjang pendidikan{" "}
                      <strong>{previewStudent.class || selectedJenjang}</strong> di Madrasah Putri Hidayatul Mubtadi&apos;aat [MPHM] Lirboyo Kediri dengan hasil Sangat Memuaskan.
                    </p>
                  </div>

                  {/* Signature Section */}
                  <div className="z-10 w-full flex justify-between px-16 pt-8 border-t border-amber-800/20 mt-4">
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-zinc-600 mb-16">Kediri, 9 Safar 1448 H / 23 Juli 2026<br />Mundzir / Kepala Tingkat,</p>
                      <p className="font-bold border-b border-black text-sm px-6 pb-1">Ustadzah Musyrifah</p>
                      <span className="text-[11px] text-zinc-500 mt-0.5">NIP. 19880412202601</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-zinc-600 mb-16">Mengetahui,<br />Mudir Madrasah Diniyyah,</p>
                      <p className="font-bold border-b border-black text-sm px-6 pb-1">KH. M. An'im Falahuddin</p>
                      <span className="text-[11px] text-zinc-500 mt-0.5">Pengasuh P3HM Lirboyo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-zinc-950">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-amber-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Fisik Dokumen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
