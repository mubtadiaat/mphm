🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)

**"Sistem Informasi Akademik & Pusat Data Abadi Enterprise"**

## #00: VISI STRATEGIS, ARSITEKTUR STACK & DEPLOYMENT

Sistem Informasi Akademik MPHM dibangun sebagai platform **Enterprise Internal SaaS**. Arsitektur wajib dipisah sepenuhnya (*Strictly Decoupled*) untuk menjamin performa maksimal, keamanan militer, dan keandalan jangka panjang di jaringan Cloudflare.

**1. Tech Stack Mutlak (The New Stack):**

* **Frontend Layer (Web & 3D Presentation):** Next.js 15+ (App Router), React 19. Di-deploy murni sebagai Static/Edge di **Cloudflare Pages**.
* **Backend API Gateway (Business Logic):** **Hono.js** berjalan di atas **Cloudflare Workers**. (Zero HTML rendering di backend, murni JSON REST API).
* **Pusat Data (Database):** **Cloudflare D1** (Serverless SQLite) dikelola dengan Drizzle ORM.
* **Media & Asset Storage:** **Cloudinary**. Seluruh foto profil, aset 3D, dokumen bukti, wajib diunggah langsung ke Cloudinary (bukan R2/Worker).

**2. Aturan Deployment & Domain Produksi:**

* **Domain Utama:** Seluruh sistem beroperasi HANYA di `https://m.p3hm.my.id`.
* **API Base URL:** `https://m.p3hm.my.id/api/*`.
* Tidak ada referensi ke domain `*.pages.dev` atau `*.workers.dev` pada konfigurasi produksi.

---

## #01: UI/UX, 3D, & MODERN ANIMATION STANDARD

Seluruh antarmuka WAJIB **100% Responsive (Mobile-First, Tablet, Desktop)** dan mengusung filosofi *Ultra-Modern Enterprise Professional SaaS* (sekelas UI premium di Uiverse/Vercel/Linear).

**1. Desain Visual & Komponen:**

* Menggunakan **Tailwind CSS v4** dan **shadcn/ui** (kustomisasi premium).
* Karakteristik visual: *Glassmorphism* halus, *soft shadow*, *thin border*, *hover elevation*, dan tipografi bersih.
* **Universal Data Grid:** Tabel wajib memiliki *Realtime Search* (tanpa tombol cari), *Column Manager*, *Server-Side Pagination*, dan format sel identitas (Avatar bulat + Nama Tebal + Sub-info).

**2. Animasi & Rendering 3D:**

* **Micro-interactions:** Menggunakan **Framer Motion** untuk transisi perpindahan halaman, *drawer collapse*, *subtle glow* pada form, dan *loading skeleton*.
* **3D Elements:** Menggunakan **React Three Fiber / Three.js** untuk elemen interaktif di Dashboard (misal: Logo MPHM 3D, Kartu Statistik Mengambang yang bereaksi terhadap kursor/sentuhan). Animasi 3D harus ringan dan tidak mengorbankan performa.

---

## #02: PIPELINE MEDIA CLOUDINARY (STRICTLY DECOUPLED)

Untuk memastikan Cloudflare Workers tidak dibebani file berat, sistem media menggunakan **Direct Signed Upload**.

1. **Request Signature:** Frontend meminta token otorisasi ke Backend (Hono).
2. **Direct Upload:** Frontend mengunggah file (Foto/Bukti) **langsung** ke server Cloudinary.
3. **Save URL:** Cloudinary membalas dengan URL gambar, lalu Frontend mengirim URL tersebut ke Backend untuk disimpan di database D1.

---

## #03: ENTERPRISE DATA ARCHITECTURE (PERSON-CENTRIC)

Database menganut prinsip **Single Source of Truth**. Tidak boleh ada duplikasi data manusia seumur hidup.

**1. Tabel Inti (`people`):**
Menyimpan identitas dasar (ID, NIK, Nama, TTL, Alamat, Nomor WA, URL Avatar Cloudinary). Wajib dikunci dengan indeks non-unik pada nama dan indeks unik pada NIK.

**2. Matriks Profil Polimorfik (Smart Data):**
Entitas `people` dapat memiliki banyak profil seiring waktu. Penghapusan `people` ditolak mutlak (`ON DELETE RESTRICT`) jika profil masih ada.

* `student_profiles`: Santri (Terkait NIS, NISN).
* `teacher_profiles`: Pengajar / Mustahiq (Terkait Kode Pengajar).
* `guardian_profiles`: Wali Santri (Diikat dengan Nomor KK, 1 KK bisa melihat banyak santri).
* `organization_memberships`: Pengurus / Mufattisy / Mundzir.
* `alumni_records`: Alumni (Otomatis dibuat saat lulus).

**3. Global Command Palette (CTRL+K):**
Pencarian instan lintas peran (Mencari "Fatimah" akan memunculkan apakah dia Santri, Alumni, atau Pengajar).

---

## #04: ACADEMIC WORKSPACE & MANAJEMEN ROMBEL

Seluruh data operasional diisolasi di dalam **Tahun Ajaran Aktif**.

**1. Hierarki Mutlak:**
`Tahun Ajaran -> Semester -> Jenjang -> Tingkat -> Kelas/Bagian -> Jadwal & Nilai`

**2. Master Jenjang & Tingkat (Permanen & Hardcoded di Logic):**

* **I'dadiyyah:** Tingkat I - III (Hanya pembagian kelompok, masa 1 tahun, **tanpa kenaikan kelas**).
* **Ibtida'iyyah:** Tingkat I - VI (Masa 6 tahun).
* **Tsanawiyyah:** Tingkat I - III (Masa 3 tahun).
* **Aliyyah:** Tingkat I - III (Masa 3 tahun).
* **Al-Robithoh:** Khidmah/Mengabdi pasca Aliyyah (Masa 1 tahun).

**3. Aturan Rombel & Mustahiq:**
Satu kelas hanya dipegang oleh 1 Mustahiq (Wali Kelas) per Tahun Ajaran. Kelas yang sudah berjalan tidak boleh dihapus permanen (Gunakan *Soft Delete*).

---

## #05: ENGINE PENILAIAN & PROMOTION (KENAIKAN KELAS)

Ini adalah jantung logika komputasi akademik MPHM.

**1. Sistem Penilaian (Kwartal 1 - 4):**

* Mustahiq menginput nilai asli (mendukung pecahan, misal: `6.5` atau `7.5`).
* **Pengecualian 5 Mapel:** Al-Qur'an, Al-Khot/Al-Imla', Qiro'ah al-Kutub, Al-Muhafadhoh, dan Akhlaq.
* **Nilai Maksimal 5 Mapel ini dibatasi mutlak di angka 8.** (API wajib menolak input > 8).
* Kelima mapel ini **TIDAK DIHITUNG** (dieliminasi) dari total agregat nilai untuk penentuan Ranking kelas.



**2. Promotion Engine (Kenaikan Kelas Akhir Tahun):**

* Mesin yang mengeksekusi rekomendasi akhir secara massal: `PROMOTED` (Naik), `RETAINED` (Tinggal), `GRADUATED` (Lulus), atau `KHIDMAH` (Al-Robithoh).
* Membaca histori Kwartal 1-4, persentase kehadiran, dan tingkat pelanggaran.
* I'dadiyyah dikecualikan dari algoritma naik/tinggal tingkat.

---

## #06: JADWAL PENDIDIKAN & MANAJEMEN KEDISIPLINAN

**1. Struktur Jadwal (Hissoh):**

* Jadwal terikat pada `Tahun Ajaran -> Kelas`.
* Dibagi menjadi sesi khusus Pesantren: *Hissoh Ula* (Sesi 1) dan *Hissoh Tsani* (Sesi 2).

**2. Kedisiplinan & Worst-Case Tier Shifting:**

* Master Pelanggaran bersifat dinamis (dikelola Admin Sekretariat) berisi: Kategori, Tingkat Keparahan (Ringan/Sedang/Berat/Sangat Berat), dan Poin.
* **Algoritma Shifting Akhlaq:** Absensi fisik (kehadiran) dan pelanggaran fatal akan langsung memengaruhi/menjatuhkan predikat kualitatif Akhlaq (misal dari *Jayyid Awwal* jatuh ke *Maqbul*) secara otomatis pada Rapor.

---

## #07: ATURAN KEAMANAN & PENGEMBANGAN (AI AGENT RULES)

Ini adalah **HARGA MATI** bagi eksekusi pengembangan:

1. **RBAC (Role-Based Access Control):** Super Admin, Sekretariat, Operator, Mustahiq, Mufattisy, Pimpinan, Wali Santri. Setiap *role* HANYA BISA melihat data sesuai lingkup kerjanya (*Data Scope Authorization*).
2. **Otentikasi:** Wajib menggunakan `HttpOnly Secure Cookie`.
3. **Realtime Audit Log:** Seluruh aktivitas POST/PUT/DELETE memicu *Middleware* Worker untuk mencatat secara otomatis (Siapa, Kapan, Aksi, *Before/After*).
4. **TanStack Query + Optimistic Update:** Frontend wajib menggunakan TanStack Query v5 dengan tata kelola *Cache* yang rapi. Antarmuka harus terasa realtime tanpa *reload*.
5. **NO DUMMY LOGIC:** Dilarang keras membuat logika hardcode palsu (*mock* yang tidak bisa diganti). Backend API harus siap memvalidasi dengan *Zod Interceptors*. Seluruh penanganan *Error* membalas dengan format JSON yang konsisten.

---

### 🚀 STATUS: READY FOR DEVELOPMENT

Blueprint ini adalah spesifikasi teknis tingkat *Enterprise SaaS*. Anda dapat langsung memerintahkan agen AI/Developer Anda dengan *prompt* berikut untuk memulai:

> *"Berdasarkan Master Blueprint MPHM v4.0, mulai inisialisasi monorepo Turborepo. Set up Cloudflare Pages untuk Next.js 15 (Frontend) dengan Tailwind v4 dan shadcn, serta Cloudflare Workers untuk Hono.js (Backend) dengan D1 Database. Buat skema Drizzle pertama untuk tabel `people` dan `student_profiles`."*