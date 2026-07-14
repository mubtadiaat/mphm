"use client";

import { useState, useRef } from "react";
import { Download, Upload, FileSpreadsheet, FileText, ChevronDown, Check, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ImportExportToolbarProps {
  headers: string[]; // e.g. ["Nama Lengkap", "NIK", "Nomor Stambuk", "Kelas", "Alamat"]
  data: Record<string, string | number | boolean | null | undefined>[]; // current data to export
  onImportSuccess?: (importedData: Record<string, string>[]) => void;
  title?: string;
  disableImport?: boolean;
  disableExport?: boolean;
}

export function ImportExportToolbar({ 
  headers, 
  data, 
  onImportSuccess, 
  title = "Data Ekspor",
  disableImport = false,
  disableExport = false
}: ImportExportToolbarProps) {
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Download Template Excel (Header locked, comments added)
  const handleDownloadTemplate = () => {
    // Generate headers and a helper placeholder row
    const placeholderRow = headers.map(h => {
      const lowerH = h.toLowerCase();
      if (lowerH.includes("nama")) return "Contoh Nama Santri";
      if (lowerH.includes("nik")) return "3171010101990001";
      if (lowerH.includes("stambuk")) return "26071301";
      if (lowerH.includes("kelas")) return "Tsanawiyyah I-A";
      if (lowerH.includes("alamat")) return "Jl. H. Sholihin No. 45, Jakarta";
      if (lowerH.includes("kategori")) return "Kedisiplinan";
      if (lowerH.includes("keparahan")) return "Sedang";
      if (lowerH.includes("poin")) return "10";
      if (lowerH.includes("tipe") || lowerH.includes("jenis")) return "MAPEL";
      if (lowerH.includes("status")) return "AKTIF";
      if (lowerH.includes("kode")) return "MP-001";
      return "Isi data di sini...";
    });

    // Buat 500 baris kosong untuk area input user agar bisa di-unlock
    const templateData = [headers, placeholderRow];
    for (let i = 0; i < 499; i++) {
      templateData.push(headers.map(() => ""));
    }

    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Proteksi sheet dengan password
    ws["!protect"] = { password: "mphm", selectLockedCells: true, selectUnlockedCells: true };

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
        
        if (R === 0) {
          // Baris Header: Dikunci, tebal, abu-abu, ada komentar
          const h = headers[C] || "";
          let commentText = "Masukkan data sesuai dengan kolom yang diminta.";
          if (h.toLowerCase().includes("nama")) commentText = "Masukkan nama lengkap santri sesuai dokumen resmi.";
          else if (h.toLowerCase().includes("nik")) commentText = "Masukkan 16 digit Nomor Induk Kependudukan (NIK) resmi.";
          else if (h.toLowerCase().includes("stambuk")) commentText = "Masukkan nomor stambuk induk dari madrasah.";
          else if (h.toLowerCase().includes("kelas")) commentText = "Format kelas wajib. Contoh: Tsanawiyyah I-A.";
          else if (h.toLowerCase().includes("alamat")) commentText = "Alamat lengkap menggunakan data wilayah.";
          else if (h.toLowerCase().includes("nilai")) commentText = "Rentang nilai 0 - 10 (Maksimal 8 untuk mata pelajaran SAKRAL).";
          
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "E2E8F0" } },
            protection: { locked: true }
          };
          ws[cellRef].c = [{ a: "MPHM", t: commentText }];
        } else {
          // Baris Data: Tidak dikunci agar bisa diedit user
          ws[cellRef].s = {
            protection: { locked: false }
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Add a separate tab for instructions to avoid the Excel VML shape display bug
    const petunjukHeaders = ["Nama Kolom", "Petunjuk Pengisian / Ketentuan"];
    const petunjukRows = headers.map(h => {
      let commentText = "Masukkan data sesuai dengan kolom yang diminta.";
      if (h.toLowerCase().includes("nama")) commentText = "Masukkan nama lengkap santri sesuai dokumen resmi.";
      else if (h.toLowerCase().includes("nik")) commentText = "Masukkan 16 digit Nomor Induk Kependudukan (NIK) resmi.";
      else if (h.toLowerCase().includes("stambuk")) commentText = "Masukkan nomor stambuk induk dari madrasah.";
      else if (h.toLowerCase().includes("kelas")) commentText = "Format kelas wajib. Contoh: Tsanawiyyah I-A.";
      else if (h.toLowerCase().includes("alamat")) commentText = "Alamat lengkap menggunakan data wilayah.";
      else if (h.toLowerCase().includes("nilai")) commentText = "Rentang nilai 0 - 10 (Maksimal 8 untuk mata pelajaran SAKRAL).";
      return [h, commentText];
    });

    const wsPetunjuk = XLSX.utils.aoa_to_sheet([petunjukHeaders, ...petunjukRows]);
    
    // Set auto width for petunjuk worksheet columns
    wsPetunjuk["!cols"] = [
      { wch: 20 },
      { wch: 60 }
    ];

    XLSX.utils.book_append_sheet(wb, wsPetunjuk, "Petunjuk Pengisian");

    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_").toLowerCase()}_template.xlsx`);
    setShowImportDropdown(false);
  };

  // 2. Upload and Parse Excel File
  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Parse rows including headers
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
        if (rawRows.length === 0) {
          setImportError("File Excel kosong.");
          return;
        }

        const fileHeaders = rawRows[0] || [];
        // Validate headers match
        const headersMatch = headers.every((h, idx) => String(fileHeaders[idx] || "").trim().toLowerCase() === h.trim().toLowerCase());
        
        if (!headersMatch) {
          setImportError(`Header kolom tidak sesuai template. Harus: ${headers.join(", ")}`);
          return;
        }

        // Map data rows to objects
        const formattedData = rawRows.slice(1).map(row => {
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            obj[h] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]) : "";
          });
          return obj;
        }).filter(item => Object.values(item).some(val => val !== ""));

        if (onImportSuccess) {
          onImportSuccess(formattedData);
        }
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err) {
        console.error("Excel import failed:", err);
        setImportError("Gagal membaca file Excel. Pastikan format valid.");
      }
    };

    reader.readAsBinaryString(file);
    setShowImportDropdown(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 3. Export data to Excel
  const handleExportExcel = () => {
    // Map data to headers array
    const exportRows = data.map(item => {
      const row: string[] = [];
      // Attempt to map database keys to user-facing headers dynamically
      headers.forEach(h => {
        let val = "";
        const lowerH = h.toLowerCase();
        if (lowerH.includes("nama")) val = String(item.name || item.fullName || "");
        else if (lowerH.includes("nik")) val = String(item.nik || "");
        else if (lowerH.includes("stambuk")) val = String(item.stambuk || item.stambukNumber || "");
        else if (lowerH.includes("kelas")) val = String(item.class || item.level || "");
        else if (lowerH.includes("alamat")) val = String(item.address || "");
        else if (lowerH.includes("mustahiq") || lowerH.includes("wali kelas")) val = String(item.mustahiq || "");
        else if (lowerH.includes("mufattisy")) val = String(item.mufattisy || "");
        else if (lowerH.includes("status")) val = String(item.status || "");
        else if (lowerH.includes("nilai")) val = String(item.score || item.averageScore || "");
        else if (lowerH.includes("kehadiran")) val = String(item.attendance || "");
        else val = String(item[h] || "");
        row.push(val);
      });
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Ekspor");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_").toLowerCase()}_export.xlsx`);
    setShowExportDropdown(false);
  };

  // 4. Export data to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 15);
    
    // Map data values to arrays
    const exportRows = data.map(item => {
      return headers.map(h => {
        const lowerH = h.toLowerCase();
        if (lowerH.includes("nama")) return String(item.name || item.fullName || "");
        if (lowerH.includes("nik")) return String(item.nik || "");
        if (lowerH.includes("stambuk")) return String(item.stambuk || item.stambukNumber || "");
        if (lowerH.includes("kelas")) return String(item.class || item.level || "");
        if (lowerH.includes("alamat")) return String(item.address || "");
        if (lowerH.includes("mustahiq") || lowerH.includes("wali kelas")) return String(item.mustahiq || "");
        if (lowerH.includes("mufattisy")) return String(item.mufattisy || "");
        if (lowerH.includes("status")) return String(item.status || "");
        if (lowerH.includes("nilai")) return String(item.score || item.averageScore || "");
        if (lowerH.includes("kehadiran")) return String(item.attendance || "");
        return String(item[h] || "");
      });
    });

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: exportRows,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] }, // Brand blue
    });

    doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}_export.pdf`);
    setShowExportDropdown(false);
  };

  if (disableImport && disableExport) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUploadExcel} 
          accept=".xlsx, .xls" 
          className="hidden" 
        />

        {/* Import Dropdown Button */}
        {!disableImport && (
          <div className="relative">
            <button
              onClick={() => { setShowImportDropdown(!showImportDropdown); setShowExportDropdown(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xs"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Import</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showImportDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 p-1">
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-lg text-left text-sm text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>Unduh Template Excel</span>
                </button>
                <button
                  onClick={() => { fileInputRef.current?.click(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-lg text-left text-sm text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Unggah File Data</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Export Dropdown Button */}
        {!disableExport && (
          <div className="relative">
            <button
              onClick={() => { setShowExportDropdown(!showExportDropdown); setShowImportDropdown(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 p-1">
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-lg text-left text-sm text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Ekspor ke Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-lg text-left text-sm text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Ekspor ke PDF</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success/Error messages */}
      {importError && (
        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{importError}</span>
        </div>
      )}
      {importSuccess && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>Import berhasil disimpan!</span>
        </div>
      )}
    </div>
  );
}
