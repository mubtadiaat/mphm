export interface StructuralJabatan {
  id: string;
  institution: "MADRASAH" | "PONDOK";
  jabatan: string;
  posisiList: string[];
}

export const DEFAULT_STRUCTURAL_JABATAN: StructuralJabatan[] = [
  // Madrasah Diniyyah (MPHM) Default Categories
  { id: "mad-mundzir", institution: "MADRASAH", jabatan: "Mundzir", posisiList: [] },
  { id: "mad-mufattisy", institution: "MADRASAH", jabatan: "Mufattisy", posisiList: [] },
  { id: "mad-mustahiq", institution: "MADRASAH", jabatan: "Mustahiq", posisiList: [] },
  { id: "mad-dewan-harian", institution: "MADRASAH", jabatan: "Dewan Harian", posisiList: [] },
  { id: "mad-dewan-pleno", institution: "MADRASAH", jabatan: "Dewan Pleno", posisiList: [] },

  // Pondok Pesantren (P3HM) Default Categories
  { id: "pon-penasihat", institution: "PONDOK", jabatan: "Penasihat", posisiList: [] },
  { id: "pon-pengurus-harian", institution: "PONDOK", jabatan: "Pengurus Harian", posisiList: [] },
  { id: "pon-pengurus-pleno", institution: "PONDOK", jabatan: "Pengurus Pleno", posisiList: [] },
];

export function getStoredStructuralJabatan(): StructuralJabatan[] {
  if (typeof window === "undefined") return DEFAULT_STRUCTURAL_JABATAN;
  const saved = localStorage.getItem("structural_job_positions");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_STRUCTURAL_JABATAN;
    }
  }
  return DEFAULT_STRUCTURAL_JABATAN;
}

export function getPositionsForJabatan(
  jabatanName: string,
  institution: "MADRASAH" | "PONDOK" = "MADRASAH"
): string[] {
  const all = getStoredStructuralJabatan();
  const found = all.find(
    (item) =>
      item.institution === institution &&
      item.jabatan.toLowerCase() === jabatanName.toLowerCase()
  );
  return found ? found.posisiList : [];
}
