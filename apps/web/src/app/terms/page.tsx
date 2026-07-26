import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-xl drop-shadow-md" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Syarat & Ketentuan Layanan (Terms of Service)</h1>
            <p className="text-xs text-slate-400">P3HM & MPHM Lirboyo Kediri - Sistem Informasi Pesantren</p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan portal P3HM & MPHM Lirboyo, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan Layanan ini serta seluruh peraturan administrasi yang berlaku di Pondok Pesantren Putri Hidayatul Mubtadi'at Lirboyo Kediri.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Akun & Kredensial Akses</h2>
            <p>
              Pengguna bertanggung jawab untuk menjaga kerahasiaan username, password, dan akses Google OAuth akun masing-masing. Setiap aktivitas yang terjadi di bawah akun Anda menjadi tanggung jawab pemilik akun.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Penggunaan yang Diperbolehkan</h2>
            <p>
              Portal ini ditujukan untuk memfasilitasi administrasi data kesiswaan, santriwati, presensi, kedisiplinan, dan komunikasi resmi antara Sekretariat, Pengurus, Musyrifah, Mustahiq, Mufattisy, dan Wali Santri. Pengguna dilarang menyalahgunakan sistem atau mencoba merusak integritas data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Perubahan Ketentuan</h2>
            <p>
              Pengelola berhak memperbarui Syarat dan Ketentuan Layanan ini sewaktu-waktu sesuai dengan kebijakan internal pesantren dan perkembangan regulasi.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>&copy; 2026 P3HM & MPHM Lirboyo. All rights reserved.</span>
          <Link href="/" className="text-blue-400 hover:underline font-bold">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
