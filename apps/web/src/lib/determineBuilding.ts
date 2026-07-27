/**
 * Dynamic Building/Komplek Rules for MPHM / P3HM Boarding System:
 * Secretariat can define any custom Block / Komplek name (e.g. "Blok A", "Komplek Al-Mahrusiyah", "Blok Utama").
 */
export function determineBuildingName(roomName: string, explicitBuilding?: string): string {
  if (explicitBuilding && explicitBuilding.trim()) {
    return explicitBuilding.trim();
  }

  const trimmed = (roomName || "").trim();
  if (!trimmed) return "Blok Utama";

  // Check prefix letter (A-Z)
  const letterMatch = trimmed.match(/^([A-Za-z])/);
  if (letterMatch) {
    const char = letterMatch[1].toUpperCase();
    return `Blok ${char}`;
  }

  return "Blok Utama";
}
