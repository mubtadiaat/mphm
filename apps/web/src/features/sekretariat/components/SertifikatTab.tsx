"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileBadge, X, Printer, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { IdentityCell } from "@/components/shared/IdentityCell";

import { useSantri, Santri } from "../queries/useSantri";

export function SertifikatTab() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: remoteData = { data: [], total: 0 }, isLoading } = useSantri(undefined, pageIndex, pageSize, searchQuery, "aktif", "I'dadiyah");
  
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
    { accessorKey: "class", header: "Kelas", cell: info => <span className="font-semibold text-amber-700 dark:text-amber-400">{info.getValue() as string}</span> },
    {
      id: "actions", header: "Cetak Dokumen",
      cell: info => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleCetak(info.row.original); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-colors border border-amber-200"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Cetak Sertifikat</span>
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-amber-50 to-orange-500 rounded-2xl flex flex-col justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-amber-100 text-xs font-bold uppercase tracking-wider mb-2">
            <FileBadge className="w-4 h-4" />
            <span>Akademik Enterprise</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Pencetakan Sertifikat I&apos;dadiyyah
          </h1>
          <p className="text-amber-100 text-sm max-w-xl mt-2">
            Pencetakan dokumen sertifikat kelulusan tahap awal untuk jenjang kelas I&apos;dadiyyah.
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
        tableName="sertifikat"
      />

      {/* Sertifikat Print Preview Modal */}
      <AnimatePresence>
        {showPreview && previewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-4xl bg-zinc-50 dark:bg-zinc-900 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[90vh]">
              
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-lg">Print Preview Sertifikat</h3>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-xl"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-200/50 dark:bg-zinc-950/50">
                {/* Kertas Landscape Simulation */}
                <div className="bg-white text-black p-12 w-full max-w-[297mm] min-h-[210mm] shadow-md border-8 border-double border-amber-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                  
                  <div className="z-10 w-full">
                    <h1 className="text-4xl font-serif text-amber-800 font-bold mb-2">SYAHADAH KELULUSAN</h1>
                    <h2 className="text-xl font-serif text-amber-900 mb-10">Tingkat I&apos;dadiyyah</h2>
                    
                    <p className="text-lg mb-6">Diberikan Kepada:</p>
                    <h3 className="text-5xl font-bold text-black mb-4 font-serif">{previewStudent.name}</h3>
                    <p className="text-lg mb-8">Nomor Stambuk: <span className="font-bold">{previewStudent.stambuk}</span></p>
                    
                    <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-800 mb-16">
                      Telah menyelesaikan dan lulus seluruh program pendidikan tingkat I&apos;dadiyyah di 
                      Madrasah Putri Hidayatul Mubtadi&apos;aat [MPHM] Lirboyo dengan predikat <strong>Sangat Memuaskan</strong>.
                    </p>

                    <div className="flex justify-between w-full px-20">
                      <div>
                        <p className="mb-16 text-sm">Ketua Panitia Ujian,</p>
                        <p className="font-bold border-t border-black pt-1 px-4 inline-block">Mundzir Asrama</p>
                      </div>
                      <div>
                        <p className="mb-16 text-sm">Mudir Madrasah,</p>
                        <p className="font-bold border-t border-black pt-1 px-4 inline-block">Pimpinan Pesantren</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-zinc-950">
                <button onClick={() => setShowPreview(false)} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Tutup</button>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-amber-700 transition-colors flex items-center gap-2">
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
