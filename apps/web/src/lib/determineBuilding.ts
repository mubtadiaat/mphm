/**
 * Building Rules for MPHM / P3HM Boarding System:
 * There are ONLY 2 official buildings:
 * 1. "Gedung Kota"
 * 2. "Gedung Desa"
 *
 * Mapping Rules by Room Code Prefix (A-Z):
 * - Rooms starting with 'A', 'B', 'C', 'D' (e.g. A-01, A-02, B-05, C-10, D-02) -> "Gedung Kota"
 * - Rooms starting with 'E' through 'Z' (e.g. E-01, F-02, G-10, Z-01) -> "Gedung Desa"
 * - Explicit keyword override: If room or input text contains "desa" -> "Gedung Desa", if "kota" -> "Gedung Kota".
 */
export function determineBuildingName(roomName: string, explicitBuilding?: string): "Gedung Kota" | "Gedung Desa" {
  if (explicitBuilding) {
    const norm = explicitBuilding.trim().toLowerCase();
    if (norm.includes("desa")) return "Gedung Desa";
    if (norm.includes("kota")) return "Gedung Kota";
  }

  const normRoom = (roomName || "").trim().toLowerCase();
  if (normRoom.includes("desa")) return "Gedung Desa";
  if (normRoom.includes("kota")) return "Gedung Kota";

  // Check prefix letter (A-Z)
  const letterMatch = (roomName || "").trim().match(/^([A-Za-z])/);
  if (letterMatch) {
    const char = letterMatch[1].toUpperCase();
    if (char >= "A" && char <= "D") {
      return "Gedung Kota";
    } else {
      return "Gedung Desa";
    }
  }

  return "Gedung Kota";
}
