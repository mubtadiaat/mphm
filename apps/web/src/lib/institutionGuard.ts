/**
 * institutionGuard.ts
 * Utilitas terpusat untuk mendeteksi dan memvalidasi instansi (PONDOK vs MADRASAH)
 * berdasarkan role pengguna. Ini adalah inti dari kebijakan isolasi data antarinstansi.
 *
 * Prinsip: Pondok P3HM dan Madrasah MPHM adalah DUA INSTANSI BERBEDA meskipun
 * berada di bawah satu yayasan. Data keduanya TIDAK BOLEH saling bocor.
 */

export type InstitutionType = "PONDOK" | "MADRASAH" | "ALL";

/**
 * Deteksi instansi pengguna dari role-nya.
 * Digunakan saat login untuk mengisi field institution di JWT payload.
 */
export function detectInstitutionFromRole(role: string): InstitutionType {
  const r = String(role || "").trim().toLowerCase();

  // Developer master = akses ALL
  if (r === "develzy" || r.includes("superadmin") || r.includes("super_admin")) {
    return "ALL";
  }

  // Admin = akses ALL (lintas instansi)
  if (r === "admin") {
    return "ALL";
  }

  // Sekretariat PONDOK P3HM
  if (r === "sek.pondok" || r.includes("pondok") || r.includes("p3hm")) {
    return "PONDOK";
  }

  // Sekretariat MADRASAH MPHM
  if (r === "sek.madrasah" || r.includes("madrasah") || r.includes("mphm")) {
    return "MADRASAH";
  }

  // Mustahiq = portal Madrasah
  if (r.includes("mustahiq") || r.includes("munawwib")) {
    return "MADRASAH";
  }

  // Wali Santri = bisa dari kedua, default MADRASAH
  if (r.includes("wali") || r.includes("guardian")) {
    return "MADRASAH";
  }

  // Pengurus pondok default: Mufattish, Mundzir, Keamanan, Pimpinan, Staf, Pengurus tanpa prefix
  // NOTE: Jika instansi spesifik perlu dibedakan, gunakan role suffix:
  // "pengurus.pondok" → PONDOK, "pengurus.madrasah" → MADRASAH
  if (r.includes(".pondok")) return "PONDOK";
  if (r.includes(".madrasah")) return "MADRASAH";

  // Peran struktural pondok umum (tanpa prefix)
  if (
    r.includes("mufat") ||
    r.includes("mundzir") ||
    r.includes("keamanan") ||
    r.includes("pimpinan") ||
    r.includes("musyrifah") ||
    r.includes("pembina")
  ) {
    return "PONDOK";
  }

  // Default fallback: jika tidak teridentifikasi, anggap MADRASAH
  return "MADRASAH";
}

/**
 * Validasi apakah pengguna dari instansi yang diizinkan mengakses resource.
 *
 * @param sessionInstitution - Instansi pengguna dari JWT session
 * @param requiredInstitution - Instansi yang diperlukan untuk akses resource
 * @returns true jika akses diizinkan
 */
export function isInstitutionAllowed(
  sessionInstitution: InstitutionType,
  requiredInstitution: InstitutionType
): boolean {
  // "ALL" selalu lolos (admin/superadmin)
  if (sessionInstitution === "ALL") return true;

  // Resource yang berlaku untuk semua instansi
  if (requiredInstitution === "ALL") return true;

  // Harus sama persis
  return sessionInstitution === requiredInstitution;
}

/**
 * Validasi akses cross-institution: apakah sessionUser berhak mengakses data targetUser.
 * Digunakan di API endpoints yang memodifikasi data berdasarkan ID.
 *
 * @param sessionInstitution - Instansi pengguna dari JWT session
 * @param targetInstitution - Instansi dari data yang akan diakses/dimodifikasi
 * @returns true jika akses diizinkan
 */
export function canAccessCrossInstitution(
  sessionInstitution: InstitutionType,
  targetInstitution: InstitutionType
): boolean {
  if (sessionInstitution === "ALL") return true;
  if (targetInstitution === "ALL") return true; // Target berlaku untuk semua
  return sessionInstitution === targetInstitution;
}

/**
 * Mapping role ke institution yang diizinkan untuk portal-specific login.
 * Digunakan untuk memastikan bahwa role dari instansi yang berbeda tidak bisa
 * login melalui portal yang salah.
 */
export const PORTAL_INSTITUTION_MAP: Record<string, InstitutionType[]> = {
  sekretariat: ["PONDOK", "MADRASAH", "ALL"],
  mustahiq: ["MADRASAH"],
  staff: ["PONDOK", "MADRASAH"], // Pengurus bisa dari kedua instansi tapi dibatasi workspace
  guardian: ["MADRASAH", "PONDOK"],
};
