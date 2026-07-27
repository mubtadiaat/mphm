/**
 * Building/Komplek Rules for MPHM / P3HM Boarding System:
 * There are ONLY 2 official complexes/blocks:
 * 1. "Komplek Kota"
 * 2. "Komplek Desa"
 *
 * Mapping Rules by Room Code Prefix (A-Z):
 * - Rooms starting with 'A', 'B', 'C', 'D' (e.g. A-01, A-02, B-05, C-10, D-02) -> "Komplek Kota"
 * - Rooms starting with 'E' through 'Z' (e.g. E-01, F-02, G-10, Z-01) -> "Komplek Desa"
 * - Explicit keyword override: If room or input text contains "desa" -> "Komplek Desa", if "kota" -> "Komplek Kota".
 */
export function determineBuildingName(roomName: string, explicitBuilding?: string): "Komplek Kota" | "Komplek Desa" {
  if (explicitBuilding) {
    const norm = explicitBuilding.trim().toLowerCase();
    if (norm.includes("desa")) return "Komplek Desa";
    if (norm.includes("kota")) return "Komplek Kota";
  }

  const normRoom = (roomName || "").trim().toLowerCase();
  if (normRoom.includes("desa")) return "Komplek Desa";
  if (normRoom.includes("kota")) return "Komplek Kota";

  // Check prefix letter (A-Z)
  const letterMatch = (roomName || "").trim().match(/^([A-Za-z])/);
  if (letterMatch) {
    const char = letterMatch[1].toUpperCase();
    if (char >= "A" && char <= "D") {
      return "Komplek Kota";
    } else {
      return "Komplek Desa";
    }
  }

  return "Komplek Kota";
}
