"use client";

import { useState, useRef } from "react";
import { Download, Upload, FileSpreadsheet, FileText, ChevronDown, Check, AlertCircle } from "lucide-react";


function resolveValue(item: any, h: string): string {
  const lowerH = h.toLowerCase().trim();
  const cleanH = lowerH.replace(/\s+/g, "");

  // 1. Direct match on clean header name (lowercase)
  const directKey = Object.keys(item).find(k => k.toLowerCase() === cleanH);
  if (directKey !== undefined) {
    const v = item[directKey];
    if (typeof v === "boolean") return v ? "AKTIF" : "NON-AKTIF";
    return String(v ?? "");
  }

  // 2. Fuzzy matches
  if (lowerH.includes("nama") || lowerH.includes("wali santri")) {
    return String(item.name || item.fullName || item.guardianName || "");
  }
  if (lowerH.includes("nik")) {
    return String(item.nik || item.guardianNik || "");
  }
  if (lowerH.includes("kk") || lowerH.includes("card") || lowerH.includes("keluarga")) {
    return String(item.familyCardNumber || "");
  }
  if (lowerH.includes("telepon") || lowerH.includes("phone") || lowerH.includes("hp")) {
    return String(item.phone || item.phoneNumber || item.guardianPhone || "");
  }
  if (lowerH.includes("stambuk")) {
    return String(item.stambuk || item.stambukNumber || "");
  }
  if (lowerH.includes("kelas") || lowerH.includes("rombel")) {
    return String(item.class || item.level || "");
  }
  if (lowerH.includes("alamat") || lowerH.includes("address")) {
    return String(item.address || "");
  }
  if (lowerH.includes("kode")) {
    return String(item.code || item.teacherCode || "");
  }
  if (lowerH.includes("tipe") || lowerH.includes("kategori") || lowerH.includes("jenis")) {
    return String(item.subjectType || item.type || item.category || "");
  }
  if (lowerH.includes("keparahan") || lowerH.includes("severity") || lowerH.includes("tingkat")) {
    return String(item.severity || "");
  }
  if (lowerH.includes("poin") || lowerH.includes("point")) {
    return String(item.points || "");
  }
  if (lowerH.includes("mulai")) {
    return String(item.startDate || "");
  }
  if (lowerH.includes("berakhir")) {
    return String(item.endDate || "");
  }
  if (lowerH.includes("tahun") || lowerH.includes("akademik") || lowerH.includes("ajaran")) {
    return String(item.name || item.academicYear || "");
  }
  if (lowerH.includes("mustahiq") || lowerH.includes("guru") || lowerH.includes("wali kamar") || lowerH.includes("ust")) {
    return String(item.mustahiq || item.teacherCode || item.supervisorName || "");
  }
  if (lowerH.includes("mufattisy")) {
    return String(item.mufattisy || "");
  }
  if (lowerH.includes("status")) {
    if (item.isActive !== undefined) return item.isActive ? "AKTIF" : "NON-AKTIF";
    return String(item.status || "");
  }
  if (lowerH.includes("nilai") || lowerH.includes("gpa") || lowerH.includes("ipk")) {
    return String(item.score || item.averageScore || item.averageGpa || "");
  }
  if (lowerH.includes("kehadiran") || lowerH.includes("absen")) {
    return String(item.attendance || item.attendanceRate || "");
  }
  if (lowerH.includes("deskripsi") || lowerH.includes("keterangan") || lowerH.includes("detail")) {
    return String(item.description || item.detailDescription || "");
  }

  // 3. Last fallback: search for keys containing substring
  const fuzzyKey = Object.keys(item).find(k => cleanH.includes(k.toLowerCase()) || k.toLowerCase().includes(cleanH));
  if (fuzzyKey !== undefined) {
    const v = item[fuzzyKey];
    if (typeof v === "boolean") return v ? "AKTIF" : "NON-AKTIF";
    return String(v ?? "");
  }

  return "";
}

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
  const handleDownloadTemplate = async () => {
    const ExcelJSMod = await import("exceljs");
    const ExcelJS = ExcelJSMod.default || ExcelJSMod;
    const fileSaver = await import("file-saver");
    const saveAs = fileSaver.saveAs || (fileSaver as any).default || fileSaver;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Template");

    // Protect sheet
    await sheet.protect("mphm", { selectLockedCells: true, selectUnlockedCells: true });

    // Set headers
    sheet.columns = headers.map(h => ({ header: h, key: h, width: 25 }));
    const headerRow = sheet.getRow(1);

    headerRow.eachCell((cell, colNumber) => {
      // Style headers
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
      };
      cell.protection = { locked: true };

      const h = headers[colNumber - 1] || "";
      let commentText = "Masukkan data sesuai dengan kolom yang diminta.";
      if (h.toLowerCase().includes("nama")) commentText = "Masukkan nama lengkap santri sesuai dokumen resmi.";
      else if (h.toLowerCase().includes("nik")) commentText = "Masukkan 16 digit Nomor Induk Kependudukan (NIK) resmi.";
      else if (h.toLowerCase().includes("stambuk")) commentText = "Masukkan nomor stambuk induk dari madrasah.";
      else if (h.toLowerCase().includes("kelas")) commentText = "Format kelas wajib. Contoh: Tsanawiyyah I-A.";
      else if (h.toLowerCase().includes("alamat")) commentText = "Alamat lengkap menggunakan data wilayah.";
      else if (h.toLowerCase().includes("nilai")) commentText = "Rentang nilai 0 - 10 (Maksimal 8 untuk mata pelajaran SAKRAL).";
      
      // Add hidden note (comment) that appears on hover
      cell.note = commentText;
    });

    // Add placeholder row and style as unlocked
    const placeholderRowData: Record<string, string> = {};
    headers.forEach(h => {
      const lowerH = h.toLowerCase();
      if (lowerH.includes("nama")) placeholderRowData[h] = "Contoh Nama Santri";
      else if (lowerH.includes("nik")) placeholderRowData[h] = "3171010101990001";
      else if (lowerH.includes("stambuk")) placeholderRowData[h] = "26071301";
      else if (lowerH.includes("kelas")) placeholderRowData[h] = "Tsanawiyyah I-A";
      else if (lowerH.includes("alamat")) placeholderRowData[h] = "Jl. H. Sholihin No. 45, Jakarta";
      else if (lowerH.includes("kategori")) placeholderRowData[h] = "Kedisiplinan";
      else if (lowerH.includes("keparahan")) placeholderRowData[h] = "Sedang";
      else if (lowerH.includes("poin")) placeholderRowData[h] = "10";
      else if (lowerH.includes("tipe") || lowerH.includes("jenis")) placeholderRowData[h] = "MAPEL";
      else if (lowerH.includes("status")) placeholderRowData[h] = "AKTIF";
      else if (lowerH.includes("kode")) placeholderRowData[h] = "MP-001";
      else placeholderRowData[h] = "Isi data di sini...";
    });
    
    sheet.addRow(placeholderRowData);

    // Provide 500 unlocked rows for user input
    for (let r = 2; r <= 501; r++) {
      const row = sheet.getRow(r);
      for (let c = 1; c <= headers.length; c++) {
        row.getCell(c).protection = { locked: false };
      }
    }

    // Add a separate tab for instructions
    const wsPetunjuk = workbook.addWorksheet("Petunjuk Pengisian");
    wsPetunjuk.columns = [
      { header: "Nama Kolom", key: "col", width: 25 },
      { header: "Petunjuk Pengisian / Ketentuan", key: "desc", width: 80 }
    ];
    
    wsPetunjuk.getRow(1).font = { bold: true };
    wsPetunjuk.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    headers.forEach(h => {
      let commentText = "Masukkan data sesuai dengan kolom yang diminta.";
      if (h.toLowerCase().includes("nama")) commentText = "Masukkan nama lengkap santri sesuai dokumen resmi.";
      else if (h.toLowerCase().includes("nik")) commentText = "Masukkan 16 digit Nomor Induk Kependudukan (NIK) resmi.";
      else if (h.toLowerCase().includes("stambuk")) commentText = "Masukkan nomor stambuk induk dari madrasah.";
      else if (h.toLowerCase().includes("kelas")) commentText = "Format kelas wajib. Contoh: Tsanawiyyah I-A.";
      else if (h.toLowerCase().includes("alamat")) commentText = "Alamat lengkap menggunakan data wilayah.";
      else if (h.toLowerCase().includes("nilai")) commentText = "Rentang nilai 0 - 10 (Maksimal 8 untuk mata pelajaran SAKRAL).";
      wsPetunjuk.addRow({ col: h, desc: commentText });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${title.replace(/\s+/g, "_").toLowerCase()}_template.xlsx`);
    setShowImportDropdown(false);
  };

  // 2. Upload and Parse Excel File
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    try {
      const ExcelJSMod = await import("exceljs");
      const ExcelJS = ExcelJSMod.default || ExcelJSMod;
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      
      const ws = workbook.worksheets[0];
      if (!ws) {
        setImportError("File Excel kosong.");
        return;
      }
      
      const fileHeaders: string[] = [];
      const headerRow = ws.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        fileHeaders[colNumber - 1] = String(cell.value || "").trim();
      });

      // Validate headers match
      const headersMatch = headers.every((h, idx) => fileHeaders[idx]?.toLowerCase() === h.trim().toLowerCase());
      
      if (!headersMatch) {
        setImportError(`Header kolom tidak sesuai template. Harus: ${headers.join(", ")}`);
        return;
      }

      const formattedData: Record<string, string>[] = [];
      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const obj: Record<string, string> = {};
        let hasValue = false;
        headers.forEach((h, idx) => {
          const cellValue = row.getCell(idx + 1).value;
          const val = cellValue !== undefined && cellValue !== null ? String(cellValue) : "";
          obj[h] = val;
          if (val.trim() !== "") hasValue = true;
        });
        if (hasValue) {
          formattedData.push(obj);
        }
      });

      if (onImportSuccess) {
        onImportSuccess(formattedData);
      }
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err) {
      console.error("Excel import failed:", err);
      setImportError("Gagal membaca file Excel. Pastikan format valid.");
    }

    setShowImportDropdown(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 3. Export data to Excel
  const handleExportExcel = async () => {
    const ExcelJSMod = await import("exceljs");
    const ExcelJS = ExcelJSMod.default || ExcelJSMod;
    const fileSaver = await import("file-saver");
    const saveAs = fileSaver.saveAs || (fileSaver as any).default || fileSaver;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data Ekspor");
    
    sheet.columns = headers.map(h => ({ header: h, key: h, width: 25 }));
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    data.forEach(item => {
      const rowData: Record<string, string> = {};
      headers.forEach(h => {
        rowData[h] = resolveValue(item, h);
      });
      sheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${title.replace(/\s+/g, "_").toLowerCase()}_export.xlsx`);
    setShowExportDropdown(false);
  };

  // 4. Export data to PDF
  const handleExportPDF = async () => {
    const jsPDFMod = await import("jspdf");
    const jsPDF = jsPDFMod.jsPDF || jsPDFMod.default || jsPDFMod;
    const autoTableMod = await import("jspdf-autotable");
    const autoTable = autoTableMod.default || autoTableMod;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 15);
    
    // Map data values to arrays
    const exportRows = data.map(item => {
      return headers.map(h => {
        return resolveValue(item, h);
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
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowImportDropdown(false)} />
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
              </>
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
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(false)} />
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
              </>
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
