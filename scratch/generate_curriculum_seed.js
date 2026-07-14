const fs = require('fs');

const data = {
  "Ibtidaiyah": {
    "III": ["Zad al-Mubtadi'", "Fasholatan", "Nadhom al-Mathlab", "Hisab Aba-ja-dun", "Al-Lughoh al-Jawiyyah", "Madarij al-Durus al-Arobiyyah", "Al-Qur'an", "Aswaja dan Ke-NU-an", "Qiro'ah al-Kutub", "Nadhom Birru Walidaikum", "Tarikh al-Anbiya'", "Al-Khoth / Al-Imla'"],
    "IV": ["Aqidah al-Awwam", "Al-Ajurrumiyah", "Al-Mabadi' al-Fiqhiyyah", "Madarij al-Durus al-Arobiyyah", "Al-Akhlaq Li al-Banat", "Mabadi' al-Tajwid", "Al-Qur'an", "Tarikh Khulafa' al-Rosyidin", "Al-Khoth / Al-Imla'", "Pedoman Ke-NU-an"],
    "V": ["Al-Nahwu al-Wadlih", "Ta'lim al-Lughoh al-Arobiyyah", "Hidayah al-Shibyan", "Safinah al-Sholah", "Awamil al-Jurjani", "Al-Akhlaq Li al-Banat", "Al-I'rob", "Al-Khoth / Al-Imla'", "Hadits 101", "Pedoman Ke-NU-an", "Matan Qothrul al-Ghoits", "Al-Qur'an"],
    "VI": ["Tanwir al-Hija", "Al-Qowa'id al-Natsriyyah", "Al-Tashrif al-Isthilahii", "Al-Nahwu al-Wadlih", "Al-Akhlaq Li al-Banat", "Fath al-Mubin", "Pedoman Ke-NU-an", "Fath al-Rohman", "Al-Qur'an", "Al-Arba'in al-Nawawiyyah", "Al-I'rob", "Ta'lim al-Lughoh al-Arobiyyah", "Matan Ibrahim al-Bajuri", "Haidl dan Permasalahannya"]
  },
  "I'dadiyah": {
    "I": ["Baca Tulis Arab", "Baca Tulis Latin", "Ro'sun Sirah", "Fasholatan", "Pengantar Akhlak", "Yanbu'a"],
    "II": ["Al-Ajurrumiyah", "Al-I'rob", "Al-Qowa'id al-Natsriyyah", "Al-Tashrif al-Isthilahii", "Hidayah al-Shibyan", "Aqidah al-Awwam", "Safinah as-Sholah", "Fath al-Mubin", "Al-Akhlaq Li al-Banat", "Al-Qur'an", "Al-Khoth / Al-Imla'"],
    "III": ["Mukhtashor Jiddan", "Al-Qowa'id al-Shorfiyyah", "Al-Tashrif al-Isthilahi", "Sullam at-Taufiq", "Al-Akhlaq Li al-Banat", "Al-Khoridah al-Bahiyyah", "Al-I'lal", "Al-Khoth / Al-Imla'", "Tuhfah al-Athfal", "Al-Qur'an"]
  },
  "Tsanawiyah": {
    "I": ["Mukhtashor Jiddan", "Al-Khoridah al-Bahiyyah", "Al-Qowa'id al-Shorfiyyah", "Al-Tashrif al-Ishthilahi", "Al-I'lal", "Sullam al-Taufiq", "Bulugh al-Marom", "Fath al-Mubin", "Washoya", "Tuhfah al-Athfal", "Al-Qur'an"],
    "II": ["Al-Maqshud", "Mutammimah al-Ajurrumiyyah", "Al-Qowa'id al-Shorfiyyah", "Al-Tashrif al-Lughowi", "Fath al-Qorib", "Bulugh al-Marom", "Maslak al-Muhtajiin", "Hujjat Ahli al-Sunnah wa al-Jamaah", "Al-I'lal", "Taisir al-Khollaq", "Matan al-Sanusiyyah", "Hidayah al-Mustafid", "Al-Qur'an"],
    "III": ["Al-Imrithi", "Fath al-Qorib", "Al-Jazariyyah", "Al-Qur'an", "Bulugh al-Marom", "Tarikh al-Hawadits", "Al-Qowa'id al-Asasiyyah", "Al-Jawahir al-Kalamiyyah", "Qowaid al-Imla'", "Organisasi & Administrasi", "Ta'lim al-Muta'allim", "Uyun al-Masa'il li al-Nisa'"]
  },
  "Aliyah": {
    "I": ["Alfiyah Ibnu Malik", "Al-Baiquniyyah", "Fath al-Mu'in", "Qowa'id al-I'rob / Al-I'rob", "Riyadl al-Sholihin", "Al-Minah al-Saniyyah", "Syarh al-Waroqot", "Al-Kawakib al-Lamma'ah", "Tafsir al-Jalalain"],
    "II": ["Alfiyah Ibnu Malik", "Fath al-Mu'in", "'Uddah al-Farid", "Tashil al-Thuruqot", "Kifayah al-Awam", "Riyadl al-Sholihin", "Bidayah al-Hidayah", "Tafsir al-Jalalain", "Itmam al-Diroyah", "Mabadi' Qowa'id al-Fiqhiyyah"],
    "III": ["Al-Jauhar al-Maknun", "Al-Faro'id al-Bahiyyah", "Fath al-Mu'in", "Al-Sullam al-Munawroq", "Salalim al-Fudlola'", "Tafsir al-Jalalain", "Al-'Arudl", "Al-Fajru al-Shodiq", "Riyadl al-Sholihin"]
  }
};

const sacredSubjects = [
    "Al-Qur'an", 
    "Al-Khoth / Al-Imla'", 
    "Qiro'ah al-Kutub", 
    "Al-Muhafadhoh", 
    "Akhlaq",
    "Al-Akhlaq Li al-Banat",
    "Pengantar Akhlak"
];

function isSacred(name) {
    return sacredSubjects.some(s => name.includes(s) || s.includes(name)) ? "MAPEL" : "NON_MAPEL";
}

function generateId(str) {
    return "sub-" + str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateCode(str) {
    return "MP-" + str.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3) + "-" + Math.floor(Math.random() * 90 + 10);
}

const uniqueSubjects = new Map();

let sql = `-- SEED SCRIPT: KURIKULUM SEMI PERMANEN MPHM\n\n`;
sql += `-- 1. INSERT MATA PELAJARAN (Abaikan jika sudah ada)\n`;
sql += `INSERT OR IGNORE INTO subjects (id, code, name, subject_type, is_active) VALUES \n`;

for (const level in data) {
    for (const cls in data[level]) {
        for (const subject of data[level][cls]) {
            if (!uniqueSubjects.has(subject)) {
                uniqueSubjects.set(subject, {
                    id: generateId(subject),
                    code: generateCode(subject),
                    name: subject,
                    type: isSacred(subject)
                });
            }
        }
    }
}

const subjectValues = Array.from(uniqueSubjects.values()).map(s => 
    `('${s.id}', '${s.code}', '${s.name.replace(/'/g, "''")}', '${s.type}', 1)`
);

sql += subjectValues.join(",\n") + ";\n\n";

sql += `-- 2. INSERT KURIKULUM MASTER\n`;
sql += `INSERT OR IGNORE INTO curriculums (id, name, description, is_active) VALUES \n`;
sql += `('curriculum-semi-permanen', 'Kurikulum Semi Permanen', 'Kurikulum acuan utama untuk Ibtidaiyah, I''dadiyah, Tsanawiyah, dan Aliyah', 1);\n\n`;

sql += `-- 3. MAPPING KURIKULUM KE MATA PELAJARAN PER TINGKAT DAN KELAS\n`;
sql += `INSERT OR IGNORE INTO curriculum_subjects (id, curriculum_id, subject_id, institution_level, class_level) VALUES \n`;

const mappingValues = [];
let mapCounter = 1;
for (const level in data) {
    for (const cls in data[level]) {
        for (const subject of data[level][cls]) {
            const subjObj = uniqueSubjects.get(subject);
            const uuid = 'map-' + Date.now() + '-' + mapCounter++;
            mappingValues.push(`('${uuid}', 'curriculum-semi-permanen', '${subjObj.id}', '${level}', '${cls}')`);
        }
    }
}

sql += mappingValues.join(",\n") + ";\n";

fs.writeFileSync('d:/DEVELZY/MPHM_V.02/packages/db/seed_kurikulum_semi_permanen.sql', sql);
console.log('Seed SQL generated successfully');
