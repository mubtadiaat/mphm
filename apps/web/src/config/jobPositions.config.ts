export interface StructuralJabatan {
  id: string;
  institution: "MADRASAH" | "PONDOK";
  jabatan: string;
  posisiList: string[];
}

export const DEFAULT_STRUCTURAL_JABATAN: StructuralJabatan[] = [
  // Madrasah Diniyyah (MPHM) Default Categories
  { id: "mad-pengurus", institution: "MADRASAH", jabatan: "Pengurus", posisiList: [] },
  { id: "mad-mustahiq", institution: "MADRASAH", jabatan: "Mustahiq", posisiList: [] },
  { id: "mad-munawwib", institution: "MADRASAH", jabatan: "Munawwib", posisiList: [] },

  // Pondok Pesantren (P3HM) Default Categories
  { id: "pon-pengurus", institution: "PONDOK", jabatan: "Pengurus", posisiList: [] },
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
