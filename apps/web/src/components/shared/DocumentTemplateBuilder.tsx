"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Save, FileText, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Table as TableIcon, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/shared/ToastContext";

const mergeTags = [
  { label: "Nama Santri", value: "{{nama_santri}}" },
  { label: "Nomor Stambuk", value: "{{stambuk}}" },
  { label: "Kelas", value: "{{kelas}}" },
  { label: "Bagian", value: "{{bagian}}" },
  { label: "Wali Kelas", value: "{{wali_kelas}}" },
  { label: "Tahun Ajaran", value: "{{tahun_ajaran}}" },
  { label: "Tabel Nilai Arab", value: "{{tabel_nilai_arab}}" },
  { label: "Total Nilai", value: "{{total_nilai}}" },
  { label: "Rata-Rata", value: "{{rata_rata}}" },
];

export function DocumentTemplateBuilder() {
  const [templateType, setTemplateType] = useState("raport_1_aliyah");
  const { toast } = useToast();
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: `
      <div style="text-align: center;">
        <h2>[MASUKKAN KOP SURAT DI SINI]</h2>
      </div>
      <br />
      <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <div style="flex: 1;">
          <p>Nama : <b>{{nama_santri}}</b></p>
          <p>No. Stambuk : <b>{{stambuk}}</b></p>
          <p>Kelas : <b>{{kelas}}</b></p>
        </div>
        <div style="flex: 1; text-align: right;">
          <p>No. Tamrin : <b>21</b></p>
          <p>Bagian : <b>{{bagian}}</b></p>
        </div>
      </div>
      <br/>
      <div style="text-align: center; border: 1px dashed #ccc; padding: 20px; color: #888;">
        <i>Tabel Pelajaran (Arab) akan di-generate secara otomatis saat dicetak jika Anda menyisipkan tag {{tabel_nilai_arab}} di sini.</i>
      </div>
      <p style="text-align: center;">{{tabel_nilai_arab}}</p>
    `,
  });

  const insertTag = (tag: string) => {
    editor?.chain().focus().insertContent(tag).run();
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // 1. Get Signature from Backend
      const sigRes = await fetch("/api/media/signature");
      if (!sigRes.ok) throw new Error("Gagal mengambil token keamanan Cloudinary.");
      const sigData = await sigRes.json();
      
      if (sigData.status !== "Success") throw new Error(sigData.message || "Gagal mendapatkan token.");

      const { signature, timestamp, apiKey, cloudName, folder } = sigData.data;

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!cloudinaryRes.ok) throw new Error("Gagal mengunggah gambar ke Server.");
      
      const cloudinaryData = await cloudinaryRes.json();
      const secureUrl = cloudinaryData.secure_url;

      // 3. Log to audit
      await fetch("/api/media/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: secureUrl, 
          action: "UPLOAD_MEDIA", 
          details: "Upload KOP/Gambar pada Document Template Builder" 
        })
      });

      // 4. Insert into TipTap
      editor?.chain().focus().setImage({ src: secureUrl }).run();
      toast("Gambar berhasil diunggah!", "success", "Berhasil");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Terjadi kesalahan saat mengunggah gambar.", "error", "Gagal");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    const html = editor?.getHTML();
    console.log("Saved HTML:", html);
    toast("Template dokumen berhasil disimpan!", "success", "Berhasil");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Document Template Builder</h2>
          <p className="text-sm text-zinc-500">Desain Raport, Ijazah, dan Sertifikat seperti MS Word. (In-App A4 Mode)</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Save className="w-4 h-4" /> Simpan Template
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">Pilih Template Kelas:</label>
        <select 
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
          className="w-full max-w-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <optgroup label="Madrasah Aliyah">
            <option value="raport_1_aliyah">Raport - Kelas I Aliyah</option>
            <option value="raport_2_aliyah">Raport - Kelas II Aliyah</option>
            <option value="raport_3_aliyah">Raport - Kelas III Aliyah</option>
            <option value="ijazah_aliyah">Ijazah Kelulusan Aliyah</option>
          </optgroup>
          <optgroup label="Tsanawiyah">
            <option value="raport_1_tsanawiyah">Raport - Kelas I Tsanawiyah</option>
            <option value="raport_2_tsanawiyah">Raport - Kelas II Tsanawiyah</option>
          </optgroup>
          <optgroup label="Lainnya">
            <option value="sertifikat_tahfidz">Sertifikat Tahfidz</option>
            <option value="sertifikat_khidmah">Sertifikat Khidmah</option>
          </optgroup>
        </select>
        <span className="text-xs text-zinc-500 italic hidden sm:block">*Mata pelajaran Arab akan disesuaikan dengan kurikulum kelas.</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Editor Toolbar & Paper */}
        <div className="flex-1 flex flex-col gap-3 w-full">
          <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm sticky top-0 z-10">
            <button onClick={() => editor?.chain().focus().toggleBold().run()} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded transition-colors"><Bold className="w-4 h-4"/></button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded transition-colors"><Italic className="w-4 h-4"/></button>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1 self-center" />
            <button onClick={() => editor?.chain().focus().setTextAlign('left').run()} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded transition-colors"><AlignLeft className="w-4 h-4"/></button>
            <button onClick={() => editor?.chain().focus().setTextAlign('center').run()} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded transition-colors"><AlignCenter className="w-4 h-4"/></button>
            <button onClick={() => editor?.chain().focus().setTextAlign('right').run()} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded transition-colors"><AlignRight className="w-4 h-4"/></button>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1 self-center" />
            <button onClick={addTable} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded flex items-center gap-1.5 transition-colors"><TableIcon className="w-4 h-4"/> <span className="text-xs font-semibold">Tabel</span></button>
            <button onClick={addImage} disabled={isUploading} className={`p-2 rounded flex items-center gap-1.5 transition-colors ${isUploading ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
              <ImageIcon className={`w-4 h-4 ${isUploading ? 'animate-pulse' : ''}`}/> 
              <span className="text-xs font-semibold">{isUploading ? 'Mengunggah...' : 'KOP / Gambar'}</span>
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>

          <div className="bg-[#e5e7eb] dark:bg-zinc-950 p-4 sm:p-10 rounded-2xl overflow-x-auto flex justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner min-h-[600px]">
            {/* A4 Paper Container - Fixed A4 dimensions for WYSIWYG */}
            <div className="bg-white text-black shadow-2xl relative max-w-full" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: '"Times New Roman", Times, serif' }}>
              <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none min-h-[200mm]" />
            </div>
          </div>
        </div>

        {/* Sidebar Variables */}
        <div className="w-full xl:w-72 flex flex-col gap-4 shrink-0">
          <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">Sisipkan Data Otomatis</h3>
            <p className="text-xs text-blue-700 dark:text-blue-400/80 mb-5 leading-relaxed">
              Klik tombol di bawah ini untuk menyisipkan variabel ke dalam dokumen. Saat dokumen dicetak, variabel ini otomatis berubah menjadi data santri.
            </p>
            
            <div className="flex flex-col gap-2.5">
              {mergeTags.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => insertTag(tag.value)}
                  className="group flex flex-col p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-left shadow-sm"
                >
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{tag.label}</span>
                  <span className="text-[11px] text-zinc-500 font-mono mt-1">{tag.value}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-blue-100 dark:border-blue-900 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tabel Arab Otomatis</h4>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
                Gunakan variabel <code>{`{{tabel_nilai_arab}}`}</code> untuk menghasilkan tabel nilai full bahasa Arab secara instan sesuai kurikulum kelas terkait.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Required CSS for TipTap Table styling and A4 constraints */}
      <style dangerouslySetInnerHTML={{__html: `
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1rem 0;
          overflow: hidden;
        }
        .ProseMirror table td, .ProseMirror table th {
          min-width: 1em;
          border: 1px solid #000;
          padding: 8px 10px;
          vertical-align: middle;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror table th {
          font-weight: bold;
          text-align: center;
          background-color: #f9fafb;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .ProseMirror p {
          margin-bottom: 0.5rem;
          margin-top: 0;
        }
        .ProseMirror-focused {
          outline: none !important;
        }
      `}} />
    </div>
  );
}
