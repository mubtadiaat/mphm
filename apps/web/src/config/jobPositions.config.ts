export interface StructuralJabatan {
  id: string;
  institution: "MADRASAH" | "PONDOK";
  jabatan: string;
  posisiList: string[];
}

export const PONDOK_PENGURUS_JABATAN_LIST = [
  "Pimpinan Umum",
  "Pimpinan 1",
  "Pimpinan 2",
  "Pimpinan 3",
  "Pimpinan 4",
  "Sekretaris Umum",
  "Sekretaris 1",
  "Sekretaris 2",
  "Sekretaris 3",
  "Bendahara",
  "Keuangan 1",
  "Keuangan 2",
  "Keuangan 3"
];

export const MADRASAH_PENGURUS_JABATAN_LIST = [
  "Pimpinan Umum",
  "Pimpinan 1",
  "Pimpinan 2",
  "Pimpinan 3",
  "Sekretaris Umum",
  "Sekretaris 1",
  "Sekretaris 2",
  "Sekretaris 3",
  "Bendahara",
  "Keuangan 1",
  "Keuangan 2"
];

export const DEFAULT_STRUCTURAL_JABATAN: StructuralJabatan[] = [
  // Madrasah Diniyyah (MPHM) Default Categories
  { id: "mad-pengurus", institution: "MADRASAH", jabatan: "Pengurus", posisiList: MADRASAH_PENGURUS_JABATAN_LIST },
  { id: "mad-mustahiq", institution: "MADRASAH", jabatan: "Mustahiq", posisiList: [] },
  { id: "mad-munawwib", institution: "MADRASAH", jabatan: "Munawwib", posisiList: [] },

  // Pondok Pesantren (P3HM) Default Categories
  { id: "pon-pengurus", institution: "PONDOK", jabatan: "Pengurus", posisiList: PONDOK_PENGURUS_JABATAN_LIST },
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

export async function addPosisiToJabatan(
  jabatanName: string,
  newPosisi: string,
  institution: "MADRASAH" | "PONDOK" = "MADRASAH"
): Promise<void> {
  if (!newPosisi || !newPosisi.trim()) return;
  const posTrim = newPosisi.trim();
  const all = getStoredStructuralJabatan();

  let targetIndex = all.findIndex(
    (item) =>
      item.institution === institution &&
      item.jabatan.toLowerCase() === jabatanName.toLowerCase()
  );

  if (targetIndex === -1) {
    const newJabatanObj: StructuralJabatan = {
      id: `${institution.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institution,
      jabatan: jabatanName,
      posisiList: [posTrim]
    };
    all.push(newJabatanObj);
  } else {
    if (!all[targetIndex].posisiList.includes(posTrim)) {
      all[targetIndex].posisiList.push(posTrim);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("structural_job_positions", JSON.stringify(all));
    window.dispatchEvent(new Event("structural_job_positions_changed"));
  }

  try {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structural_job_positions: all })
    });
  } catch (err) {
    console.error("Failed to sync structural_job_positions:", err);
  }
}
