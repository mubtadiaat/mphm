/**
 * Version comparison, odd-ending formatting, and daily build retention utilities.
 */

/**
 * Validates and formats a version string according to the rule:
 * 1. Version MUST end in an ODD number (e.g., .1, .3, .5, ... .39).
 * 2. Maximum patch number is .39. When patch > 39, rollover minor version to .1 (e.g. 2.0.41 -> 2.1.1).
 */
export function validateAndFormatOddVersion(versionStr: string): string {
  const clean = (versionStr || "2.0.1").replace(/^v/i, "").trim();
  const parts = clean.split(".").map((x) => parseInt(x, 10) || 0);

  let major = parts[0] ?? 2;
  let minor = parts[1] ?? 0;
  let patch = parts[2] ?? 1;

  // Max patch allowed is 39
  if (patch > 39) {
    minor += 1;
    patch = 1;
  }

  // Ensure patch is an ODD number
  if (patch % 2 === 0) {
    patch += 1;
  }

  if (patch > 39) {
    minor += 1;
    patch = 1;
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Compare two semver-like version strings (e.g. "1.4.1" vs "1.4.3")
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
 * Extract date key (YYYY-MM-DD) from a Date or ISO timestamp string
 */
export function getDateKey(isoDateString: string | Date): string {
  if (!isoDateString) return "unknown";
  try {
    const d = new Date(isoDateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return String(isoDateString).slice(0, 10);
  }
}

/**
 * Filters a list of releases so that for each published date (YYYY-MM-DD),
 * ONLY the highest/latest version published on that date is kept.
 * Older builds created on the same date are filtered out/deleted.
 */
export function filterHighestVersionPerDate<T extends { publishedAt?: string; createdAt?: string; version: string }>(
  items: T[]
): T[] {
  const mapByDate = new Map<string, T>();

  for (const item of items) {
    if (!item) continue;
    const dateVal = item.publishedAt || item.createdAt || new Date().toISOString();
    const dateKey = getDateKey(dateVal);
    const existing = mapByDate.get(dateKey);

    if (!existing) {
      mapByDate.set(dateKey, item);
    } else {
      // Keep the release with the higher version number created on the same date
      if (compareVersions(item.version, existing.version) > 0) {
        mapByDate.set(dateKey, item);
      }
    }
  }

  // Return filtered releases sorted descending by date and version
  return Array.from(mapByDate.values()).sort((a, b) => {
    const dateValA = a.publishedAt || a.createdAt || "";
    const dateValB = b.publishedAt || b.createdAt || "";
    const timeA = new Date(dateValA).getTime();
    const timeB = new Date(dateValB).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return compareVersions(b.version, a.version);
  });
}
