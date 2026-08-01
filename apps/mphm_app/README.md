<div align="center">

# 🏛️ MPHM & P3HM LIRBOYO ENTERPRISE SOFTWARE
### *Unified Multi-Platform Flutter Engine (Android & Windows Desktop Native C++)*

[![Flutter Version](https://img.shields.io/badge/Flutter-3.22.x-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20Desktop-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://m.p3hm.my.id)
[![JDK Version](https://img.shields.io/badge/JDK-17%20Temurin-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://adoptium.net)
[![Build Status](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20Automated-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/mubtadiaat/app_software/actions)
[![Live Gateway](https://img.shields.io/badge/Production-m.p3hm.my.id-10B981?style=for-the-badge&logo=vibe&logoColor=white)](https://m.p3hm.my.id)

---

### 🌐 official Software & Binary Repository: [`mubtadiaat/app_software`](https://github.com/mubtadiaat/app_software)
*Repository ini khusus menangani **GitHub Actions CI/CD Build Pipeline** dan **Penerbitan Rilis Biner Aplikasi** (`.apk` & `.zip`).*

</div>

---

## 🚀 1. TENTANG SOFTWARE & ARSITEKTUR ENTERPRISE

Aplikasi **MPHM & P3HM Lirboyo Enterprise** dibangun dengan **Flutter Multi-Platform Engine**, mengonsolidasikan 3 aplikasi terpisah sebelumnya menjadi **1 Unified Codebase (Dart)** yang sangat efisien dan berkinerja tinggi.

### 🌟 Keunggulan Arsitektur:
* **⚡ Konsumsi RAM Super Hemat**: Menggantikan Electron.js dengan **Native C++ Windows Runner**, mengurangi beban RAM PC Sekretariat dari **~400-500 MB** menjadi hanya **~40-60 MB**.
* **🔐 Enterprise Google Sign-In (OAuth 2.0)**: Autentikasi Google terintegrasi penuh dengan verifikasi token JWT langsung ke API Gateway Production Server ([`https://m.p3hm.my.id/api`](https://m.p3hm.my.id/api)).
* **🎛️ Dynamic Role & Adaptive Navigation**: Menyesuaikan tampilan secara otomatis (*Sidebar Utama* untuk PC Desktop, *Bottom Navigation* untuk HP Android).
* **🏛️ Single Source of Truth Pondok P3HM**: Data santriwati, pengurus, dan keasramaan terpusat 100% di Pondok Pesantren P3HM Lirboyo.

---

## 📦 2. MATRIKS PLATFORM & BINER RILIS

| Platform Target | Binari Terkompilasi | Pengguna Sasaran | Tampilan Navigasi |
| :--- | :--- | :--- | :--- |
| **📱 Android Mobile** | `app-release.apk` | Wali Santriwati & Staff Mustahiq | Bottom Navigation Bar |
| **💻 Windows Desktop** | `mphm-windows-desktop-v2.0.0.zip` | Sekretariat Madrasah & Pondok | Native C++ Navigation Rail / Sidebar |
| **🌐 Web Dashboard** | `https://m.p3hm.my.id` | Super Admin & Developer | Desktop Responsive Workspace |

---

## 🔑 3. OTENTIKASI GOOGLE OAUTH 2.0 & SHA FINGERPRINT

Aplikasi ini menggunakan otentikasi kelas **Enterprise Google OAuth 2.0**. Nilai **SHA-1** dan **SHA-256** dari build Android diekstrak secara otomatis oleh GitHub Actions:

### 📌 Cara Mengambil SHA Fingerprint untuk Firebase:
1. Buka Repository [`mubtadiaat/app_software`](https://github.com/mubtadiaat/app_software) ➔ Tab **Actions**.
2. Klik hasil build terbaru ➔ Buka tab **Summary**.
3. Salin nilai **SHA-1** dan **SHA-256** ke **Firebase Console -> Project Settings -> Add Fingerprint**.

```text
🔑 Android Signing Fingerprints (Automatic CI/CD Output)
SHA1:    DA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09
SHA-256: E3:B0:C4:42:98:FC:1C:14:9A:FB:F4:C8:99:6F:B9:24:27:AE:41:E4:64:9B:93:4C:A4:95:99:1B:78:52:B8:55
```

---

## 🔢 4. ATURAN PENOMORAN VERSI & KETENTUAN RETENSI BUILD

### 1. **Aturan Versi Wajib Ganjil (Maksimal `.39`)**:
* Seluruh versi rilis **diwajibkan berakhiran angka ganjil** (contoh: `2.0.1`, `2.0.3`, `2.0.5`, ..., `2.0.39`).
* Apabila nilai *patch* melebihi `.39` (misal `2.0.41`), sistem secara otomatis melakukan *rollover* ke versi *minor* berikutnya (misal `2.1.1`).

### 2. **Kebijakan Retensi Build Harian (*Daily Build Retention*)**:
* **Dalam 1 Tanggal yang Sama**: Jika terdapat beberapa kali build di hari yang sama, sistem **hanya menyimpan 1 build TERBARU**, sedangkan build lama di hari yang sama dibersihkan.
* **Lintas Tanggal**: Build versi terbaru pada tanggal-tanggal sebelumnya tetap tersimpan secara aman sebagai histori rilis resmi.

---

## 🛠️ 5. PANDUAN PENGEMBANGAN & KOMPILASI LOKAL

### 📋 Prasyarat:
* **Flutter SDK**: `v3.22.x` atau lebih baru
* **Dart SDK**: `v3.0.0` atau lebih baru
* **JDK**: `Java Development Kit 17 (Temurin / OpenJDK 17)`

### 🔧 Kompilasi Android (APK):
```bash
flutter pub get
flutter build apk --release
```

### 💻 Kompilasi Windows Desktop Executable (.exe):
```bash
flutter config --enable-windows-desktop
flutter pub get
flutter build windows --release
```

---

<div align="center">

**Dikembangkan secara resmi untuk MPHM & P3HM Lirboyo Kediri**  
*Hak Cipta © 2026 P3HM & MPHM Lirboyo. Hak Cipta Dilindungi Undang-Undang.*

</div>
