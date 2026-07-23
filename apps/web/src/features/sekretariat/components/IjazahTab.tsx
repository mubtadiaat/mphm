"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GraduationCap, X, Printer, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { IdentityCell } from "@/components/shared/IdentityCell";

import { useSantri, Santri } from "../queries/useSantri";

export function IjazahTab() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: remoteData = { data: [], total: 0 }, isLoading } = useSantri(undefined, pageIndex, pageSize, searchQuery, "alumni", "Aliyyah");
  
  const [showPreview, setShowPreview] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<Santri | null>(null);

  // We can display the paginated data directly now since it is filtered by the server
  const displayedStudents = remoteData.data;

  const handleCetak = (student: Santri) => {
    setPreviewStudent(student);
    setShowPreview(true);
  };

  const columns: ColumnDef<Santri, unknown>[] = [
    { 
      accessorKey: "name", 
      header: "Nama Santri", 
      cell: info => (
        <IdentityCell 
          name={info.getValue() as string} 
          subInfo={`Stambuk: ${info.row.original.stambuk}`} 
          stambuk={info.row.original?.stambuk}
          avatarUrl={info.row.original?.avatarUrl}
        />
      )
    },
    { accessorKey: "class", header: "Kelas Akhir", cell: info => <span className="font-semibold text-emerald-700 dark:text-emerald-400">{info.getValue() as string}</span> },
    {
      id: "actions", header: "Cetak Dokumen",
      cell: info => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleCetak(info.row.original); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-200"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Cetak Ijazah</span>
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-emerald-600 to-teal-600 rounded-2xl flex flex-col justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>Akademik Enterprise</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Pencetakan Ijazah Aliyyah
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl mt-2">
            Pencetakan dokumen kelulusan tertinggi (Ijazah) untuk santriwati tingkat Aliyyah yang telah berstatus Alumni (Lulus).
          </p>
        </div>
      </div>

      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={displayedStudents as unknown as Record<string, unknown>[]}
        pageCount={Math.ceil(remoteData.total / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery} loading={isLoading}
        onRowClick={(row) => handleCetak(row as unknown as Santri)}
        tableName="ijazah"
      />

      {/* Ijazah Print Preview Modal */}
      <AnimatePresence>
        {showPreview && previewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-4xl bg-zinc-50 dark:bg-zinc-900 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[90vh]">
              
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg">Print Preview Ijazah</h3>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-xl"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-200/50 dark:bg-zinc-950/50">
                {/* Kertas Landscape Simulation */}
                <div className="bg-white text-black p-12 w-full max-w-[297mm] min-h-[210mm] shadow-md border-8 border-double border-emerald-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                  
                  <div className="z-10 w-full">
                    <h1 className="text-5xl font-serif text-emerald-800 font-extrabold mb-2 uppercase tracking-wider">Ijazah Kelulusan</h1>
                    <h2 className="text-2xl font-serif text-emerald-900 mb-10 font-semibold tracking-wide">Madrasah Putri Hidayatul Mubtadi&apos;aat [MPHM] Lirboyo</h2>
                    <p className="text-gray-700 italic mb-8">Dengan bertawakkal kepada Allah SWT, Menerangkan Bahwa:</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2 font-serif underline underline-offset-8">{previewStudent.name}</h3>
                    <p className="text-sm font-mono text-gray-600 mb-8">Stambuk: {previewStudent.stambuk} | NIS: {(previewStudent as any).nis}</p>
                    
                    <p className="text-gray-800 leading-relaxed text-justify max-w-xl mx-auto mb-16 font-serif">
                      Telah menyelesaikan dan memenuhi segala persyaratan kelulusan serta ujian akhir pada tingkat Aliyyah dengan predikat <strong>Mumtaz (Sangat Memuaskan)</strong>. Kepadanya diberikan Ijazah Kelulusan sebagai tanda bukti sah tamat belajar dari Madrasah Putri Hidayatul Mubtadi&apos;aat [MPHM] Lirboyo.
                    </p>

                    <div className="flex justify-between w-full px-20">
                      <div className="text-center">
                        <p className="mb-20 text-sm font-semibold">Mudir Madrasah Aliyyah,</p>
                        <p className="font-bold border-t-2 border-black pt-1 px-4 inline-block">K.H. Abdullah Syafi&apos;i</p>
                      </div>
                      <div className="text-center">
                        <p className="mb-20 text-sm font-semibold">Pimpinan Pengasuh Pesantren,</p>
                        <p className="font-bold border-t-2 border-black pt-1 px-4 inline-block">K.H. Ahmad Dahlan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-zinc-950">
                <button onClick={() => setShowPreview(false)} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Tutup</button>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Cetak Fisik
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
