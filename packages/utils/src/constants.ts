// ============================================================
// MPHM SYSTEM CONSTANTS & HARDCODED ENUMS
// ============================================================

// 1. Peran Struktural Resmi (#08 Matriks Otorisasi)
export const ROLES = [
  "Sekretariat",
  "Mustahiq",
  "Mufattisy",
  "Mundzir",
  "Petugas Keamanan",
  "Wali Santri"
] as const;

export type RoleType = typeof ROLES[number];

// 2. Jenjang Pendidikan Permanen (#03 System Rule #AC-01)
export const INSTITUTION_LEVELS = [
  "I'dadiyyah",
  "Ibtida'iyyah",
  "Tsanawiyyah",
  "Aliyyah",
  "Al-Robithoh"
] as const;

export type InstitutionLevel = typeof INSTITUTION_LEVELS[number];

// Tingkat per Jenjang Pendidikan (Hardcoded Constants)
export const CLASS_LEVELS_MAP = {
  "I'dadiyyah": ["I", "II", "III"],
  "Ibtida'iyyah": ["I", "II", "III", "IV", "V", "VI"],
  "Tsanawiyyah": ["I", "II", "III"],
  "Aliyyah": ["I", "II", "III"],
  "Al-Robithoh": ["I"] // Khidmah 1 tahun
} as const;

// 3. Status Kenaikan Kelas Mutlak (#05)
export const PROMOTION_STATUSES = [
  "PROMOTED",   // Naik Kelas
  "RETAINED",   // Tinggal Kelas
  "GRADUATED",  // Lulus
  "KHIDMAH",    // Mengabdi
  "TRANSFERRED",// Mutasi/Pindah
  "DROPPED"     // Dikeluarkan
] as const;

export type PromotionStatus = typeof PROMOTION_STATUSES[number];

// 4. Kategori Pelanggaran Resmi (#06)
export const VIOLATION_CATEGORIES = [
  "Adab",
  "Ibadah",
  "Administrasi",
  "Perizinan",
  "Kebersihan",
  "Asrama",
  "Keamanan"
] as const;

export type ViolationCategory = typeof VIOLATION_CATEGORIES[number];

// 5. Tingkat Keparahan Pelanggaran (#06)
export const VIOLATION_SEVERITIES = [
  { name: "Ringan", level: 1, badgeColor: "#22c55e" },       // Hijau
  { name: "Sedang", level: 2, badgeColor: "#eab308" },       // Kuning/Amber
  { name: "Berat", level: 3, badgeColor: "#f97316" },        // Orange
  { name: "Sangat Berat", level: 4, badgeColor: "#ef4444" }  // Merah
] as const;

export type ViolationSeverityName = typeof VIOLATION_SEVERITIES[number]["name"];

// 6. Sesi Absensi Madrasah Pesantren (#03)
export const ATTENDANCE_SESSIONS = [
  "HISSOH_ULA",   // Sesi 1
  "HISSOH_TSANI"  // Sesi 2
] as const;

export type AttendanceSession = typeof ATTENDANCE_SESSIONS[number];

// 7. Status Absensi Kehadiran
export const ATTENDANCE_STATUSES = [
  "HADIR",
  "SAKIT",
  "IZIN",
  "ALFA"
] as const;

export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];

// 8. Status Santri
export const STUDENT_STATUSES = [
  "ACTIVE",
  "GRADUATED",
  "DROPPED",
  "BOYONG",
  "KHIDMAH"
] as const;

export type StudentStatus = typeof STUDENT_STATUSES[number];
