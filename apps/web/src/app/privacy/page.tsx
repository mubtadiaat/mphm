import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-xl drop-shadow-md" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Kebijakan Privasi (Privacy Policy)</h1>
            <p className="text-xs text-slate-400">P3HM &amp; MPHM Lirboyo Kediri - Sistem Informasi Pesantren</p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Pendahuluan</h2>
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana Pondok Pesantren Putri Hidayatul Mubtadi&apos;at (P3HM) dan Madrasah Diniyyah Putri Hidayatul Mubtadi&apos;at (MPHM) Lirboyo Kediri mengumpulkan, menggunakan, dan melindungi informasi pribadi pengguna portal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Informasi yang Kami Kumpulkan</h2>
            <p>
              Saat Anda menggunakan otentikasi Google OAuth atau registrasi akun portal, kami dapat mengumpulkan informasi dasar meliputi:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Nama Lengkap dan Alamat Email Akun Google</li>
              <li>Foto Profil Akun Google (Avatar)</li>
              <li>Nomor Telepon / WhatsApp untuk koordinasi sekretariat</li>
              <li>Data Akademik &amp; Pengasuhan Santriwati</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Penggunaan Informasi</h2>
            <p>
              Informasi yang dikumpulkan hanya digunakan untuk kepentingan verifikasi identitas pengguna, autentikasi login portal, pengelolaan data kesiswaan/santriwati, serta komunikasi resmi sekretariat pesantren. Kami tidak menjual atau membagikan data pribadi Anda kepada pihak ketiga mana pun.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Keamanan Data</h2>
            <p>
              Kami menerapkan standar keamanan data berlapis menggunakan enkripsi SSL/TLS dan enkripsi password aman untuk melindungi informasi pribadi Anda dari akses yang tidak sah.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi Sekretariat P3HM/MPHM Lirboyo Kediri melalui kontak WhatsApp resmi yang tertera di sistem.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>&copy; 2026 P3HM &amp; MPHM Lirboyo. All rights reserved.</span>
          <Link href="/" className="text-blue-400 hover:underline font-bold">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
