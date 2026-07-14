export interface HijriDate {
  day: number;
  month: number; // 1-12
  year: number;
  monthName: string;
}

const HIJRI_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabi'ul Awwal",
  "Rabi'uts Tsani",
  "Jumadil Awwal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah"
];

export function getHijriDate(date: Date = new Date()): HijriDate {
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const dayVal = parts.find(p => p.type === 'day')?.value;
    const monthVal = parts.find(p => p.type === 'month')?.value;
    const yearVal = parts.find(p => p.type === 'year')?.value;

    if (dayVal && monthVal && yearVal) {
      const day = parseInt(dayVal);
      const month = parseInt(monthVal);
      const year = parseInt(yearVal.replace(/[^0-9]/g, ''));
      return {
        day,
        month,
        year,
        monthName: HIJRI_MONTH_NAMES[month - 1] || "Unknown"
      };
    }
  } catch (e) {
    console.error("Intl Hijri formatting failed, falling back to static default", e);
  }

  // Fallback map based on approximate date
  return {
    day: 29,
    month: 1,
    year: 1448,
    monthName: "Muharram"
  };
}

export function getHijriAndMasehiDate(date: Date = new Date()): string {
  const h = getHijriDate(date);
  
  // Format Gregorian date: e.g. "14 Juli 2026"
  try {
    const masehiFormatter = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const masehiStr = masehiFormatter.format(date);
    return `${h.day} ${h.monthName} ${h.year} H / ${masehiStr}`;
  } catch {
    return `${h.day} ${h.monthName} ${h.year} H / ${date.toDateString()}`;
  }
}

export function formatAcademicYearHijri(gregorianYearRange: string): string {
  if (!gregorianYearRange) return "";
  const parts = gregorianYearRange.split("/");
  if (parts.length === 2) {
    const y1 = parseInt(parts[0].replace(/[^0-9]/g, ''));
    const y2 = parseInt(parts[1].replace(/[^0-9]/g, ''));
    if (!isNaN(y1) && !isNaN(y2)) {
      return `${y1 - 579}/${y2 - 579} H`;
    }
  }
  return gregorianYearRange;
}
