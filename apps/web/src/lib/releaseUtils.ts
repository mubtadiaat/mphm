/**
 * Version comparison and date filtering utilities for release history
 */

/**
 * Compare two semver-like version strings (e.g. "1.4.10" vs "1.4.9" or "v1.4.11" vs "v1.4.10")
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  const clean1 = (v1 || "").replace(/^v/i, "").trim();
  const clean2 = (v2 || "").replace(/^v/i, "").trim();

  const parts1 = clean1.split(".").map((x) => parseInt(x, 10) || 0);
  const parts2 = clean2.split(".").map((x) => parseInt(x, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Extract date string (YYYY-MM-DD) from an ISO timestamp
 */
export function getDateKey(isoDateString: string): string {
  if (!isoDateString) return "unknown";
  try {
    const d = new Date(isoDateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return isoDateString.slice(0, 10);
  }
}

/**
 * Filters a list of releases so that for each published date (YYYY-MM-DD),
 * ONLY the highest version published on that date is kept.
 */
export function filterHighestVersionPerDate<T extends { publishedAt: string; version: string }>(
  items: T[]
): T[] {
  const mapByDate = new Map<string, T>();

  for (const item of items) {
    if (!item) continue;
    const dateKey = getDateKey(item.publishedAt);
    const existing = mapByDate.get(dateKey);

    if (!existing) {
      mapByDate.set(dateKey, item);
    } else {
      // Keep the release with the higher version number
      if (compareVersions(item.version, existing.version) > 0) {
        mapByDate.set(dateKey, item);
      }
    }
  }

  // Return filtered releases sorted descending by publishedAt and version
  return Array.from(mapByDate.values()).sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return compareVersions(b.version, a.version);
  });
}
