export interface ClassCurriculum {
  jenjang: "I'dadiyyah" | "Ibtida'iyyah" | "Tsanawiyyah" | "Aliyyah";
  kelas: string; // "I", "II", "III", "IV", "V", "VI"
  subjects: string[];
}

export const OFFICIAL_CURRICULUM: ClassCurriculum[] = [
  // 1. I'dadiyyah
  {
    jenjang: "I'dadiyyah",
    kelas: "I",
    subjects: [
      "Baca Tulis Arab",
      "Baca Tulis Latin",
      "Ro'sun Sirah",
      "Fasholatan",
      "Pengantar Akhlak",
      "Yanbu'a"
    ]
  },
  {
    jenjang: "I'dadiyyah",
    kelas: "II",
    subjects: [
      "Al-Ajurrumiyah",
      "Al-I'rob",
      "Al-Qowa'id al-Natsriyyah",
      "Al-Tashrif al-Isthilahii",
      "Hidayah al-Shibyan",
      "Aqidah al-Awwam",
      "Safinah as-Sholah",
      "Fath al-Mubin",
      "Al-Akhlaq Li al-Banat",
      "Al-Qur'an",
      "Al-Khoth / Al-Imla'"
    ]
  },
  {
    jenjang: "I'dadiyyah",
    kelas: "III",
    subjects: [
      "Mukhtashor Jiddan",
      "Al-Qowa'id al-Shorfiyyah",
      "Al-Tashrif al-Isthilahi",
      "Sullam at-Taufiq",
      "Al-Akhlaq Li al-Banat",
      "Al-Khoridah al-Bahiyyah",
      "Al-I'lal",
      "Al-Khoth / Al-Imla'",
      "Tuhfah al-Athfal",
      "Al-Qur'an"
    ]
  },

  // 2. Ibtida'iyyah
  {
    jenjang: "Ibtida'iyyah",
    kelas: "III",
    subjects: [
      "Zad al-Mubtadi'",
      "Fasholatan",
      "Nadhom al-Mathlab",
      "Hisab Aba-ja-dun",
      "Al-Lughoh al-Jawiyyah",
      "Madarij al-Durus al-Arobiyyah",
      "Al-Qur'an",
      "Aswaja dan Ke-NU-an",
      "Qiro'ah al-Kutub",
      "Nadhom Birru Walidaikum",
      "Tarikh al-Anbiya'",
      "Al-Khoth / Al-Imla'"
    ]
  },
  {
    jenjang: "Ibtida'iyyah",
    kelas: "IV",
    subjects: [
      "Aqidah al-Awwam",
      "Al-Ajurrumiyah",
      "Al-Mabadi' al-Fiqhiyyah",
      "Madarij al-Durus al-Arobiyyah",
      "Al-Akhlaq Li al-Banat",
      "Mabadi' al-Tajwid",
      "Al-Qur'an",
      "Tarikh Khulafa' al-Rosyidin",
      "Al-Khoth / Al-Imla'",
      "Pedoman Ke-NU-an"
    ]
  },
  {
    jenjang: "Ibtida'iyyah",
    kelas: "V",
    subjects: [
      "Al-Nahwu al-Wadlih",
      "Ta'lim al-Lughoh al-Arobiyyah",
      "Hidayah al-Shibyan",
      "Safinah al-Sholah",
      "Awamil al-Jurjani",
      "Al-Akhlaq Li al-Banat",
      "Al-I'rob",
      "Al-Khoth / Al-Imla'",
      "Hadits 101",
      "Pedoman Ke-NU-an",
      "Matan Qothrul al-Ghoits",
      "Al-Qur'an"
    ]
  },
  {
    jenjang: "Ibtida'iyyah",
    kelas: "VI",
    subjects: [
      "Tanwir al-Hija",
      "Al-Qowa'id al-Natsriyyah",
      "Al-Tashrif al-Isthilahii",
      "Al-Nahwu al-Wadlih",
      "Al-Akhlaq Li al-Banat",
      "Fath al-Mubin",
      "Pedoman Ke-NU-an",
      "Fath al-Rohman",
      "Al-Qur'an",
      "Al-Arba'in al-Nawawiyyah",
      "Al-I'rob",
      "Ta'lim al-Lughoh al-Arobiyyah",
      "Matan Ibrahim al-Bajuri",
      "Haidl dan Permasalahannya"
    ]
  },

  // 3. Tsanawiyyah
  {
    jenjang: "Tsanawiyyah",
    kelas: "I",
    subjects: [
      "Mukhtashor Jiddan",
      "Al-Khoridah al-Bahiyyah",
      "Al-Qowa'id al-Shorfiyyah",
      "Al-Tashrif al-Ishthilahi",
      "Al-I'lal",
      "Sullam al-Taufiq",
      "Bulugh al-Marom",
      "Fath al-Mubin",
      "Washoya",
      "Tuhfah al-Athfal",
      "Al-Qur'an"
    ]
  },
  {
    jenjang: "Tsanawiyyah",
    kelas: "II",
    subjects: [
      "Al-Maqshud",
      "Mutammimah al-Ajurrumiyyah",
      "Al-Qowa'id al-Shorfiyyah",
      "Al-Tashrif al-Lughowi",
      "Fath al-Qorib",
      "Bulugh al-Marom",
      "Maslak al-Muhtajiin",
      "Hujjat Ahli al-Sunnah wa al-Jamaah",
      "Al-I'lal",
      "Taisir al-Khollaq",
      "Matan al-Sanusiyyah",
      "Hidayah al-Mustafid",
      "Al-Qur'an"
    ]
  },
  {
    jenjang: "Tsanawiyyah",
    kelas: "III",
    subjects: [
      "Al-Imrithi",
      "Fath al-Qorib",
      "Al-Jazariyyah",
      "Al-Qur'an",
      "Bulugh al-Marom",
      "Tarikh al-Hawadits",
      "Al-Qowa'id al-Asasiyyah",
      "Al-Jawahir al-Kalamiyyah",
      "Qowaid al-Imla'",
      "Organisasi & Administrasi",
      "Ta'lim al-Muta'allim",
      "Uyun al-Masa'il li al-Nisa'"
    ]
  },

  // 4. Aliyyah
  {
    jenjang: "Aliyyah",
    kelas: "I",
    subjects: [
      "Alfiyah Ibnu Malik",
      "Al-Baiquniyyah",
      "Fath al-Mu'in",
      "Qowa'id al-I'rob / Al-I'rob",
      "Riyadl al-Sholihin",
      "Al-Minah al-Saniyyah",
      "Syarh al-Waroqot",
      "Al-Kawakib al-Lamma'ah",
      "Tafsir al-Jalalain"
    ]
  },
  {
    jenjang: "Aliyyah",
    kelas: "II",
    subjects: [
      "Alfiyah Ibnu Malik",
      "Fath al-Mu'in",
      "'Uddah al-Farid",
      "Tashil al-Thuruqot",
      "Kifayah al-Awam",
      "Riyadl al-Sholihin",
      "Bidayah al-Hidayah",
      "Tafsir al-Jalalain",
      "Itmam al-Diroyah",
      "Mabadi' Qowa'id al-Fiqhiyyah"
    ]
  },
  {
    jenjang: "Aliyyah",
    kelas: "III",
    subjects: [
      "Al-Jauhar al-Maknun",
      "Al-Faro'id al-Bahiyyah",
      "Fath al-Mu'in",
      "Al-Sullam al-Munawroq",
      "Salalim al-Fudlola'",
      "Tafsir al-Jalalain",
      "Al-'Arudl",
      "Al-Fajru al-Shodiq",
      "Riyadl al-Sholihin"
    ]
  }
];

export function getSubjectsForClass(jenjang: string, kelas: string): string[] {
  if (!jenjang || !kelas) return [];
  const normJenjang = jenjang.toLowerCase().trim();
  const normKelas = kelas.toUpperCase().trim();

  const found = OFFICIAL_CURRICULUM.find((c) => {
    const cJenjang = c.jenjang.toLowerCase().trim();
    const cKelas = c.kelas.toUpperCase().trim();
    return (normJenjang.includes(cJenjang) || cJenjang.includes(normJenjang)) && cKelas === normKelas;
  });

  return found ? found.subjects : [];
}
