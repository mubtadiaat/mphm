const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');

const envPath = path.resolve(__dirname, './apps/web/.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const connectionString = envConfig.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL missing from apps/web/.env.local");
  process.exit(1);
}

const sql = neon(connectionString);

async function seedCoreUsers() {
  console.log("🌱 Menyiapkan akun sistem utama (Sekretariat & Admin)...");

  const coreUsers = [
    {
      id: "u-mphm2026",
      username: "mphm2026",
      email: "sekretariat.madrasah@mphm.org",
      role: "sek.madrasah",
      fullName: "Sekretariat Madrasah Diniyyah (MPHM)",
      gender: "P",
    },
    {
      id: "u-p3hm20026",
      username: "p3hm20026",
      email: "sekretariat.pondok@p3hm.org",
      role: "sek.pondok",
      fullName: "Sekretariat Pondok Pesantren (P3HM)",
      gender: "L",
    },
    {
      id: "u-sek-madrasah",
      username: "sek_madrasah",
      email: "admin.madrasah@mphm.org",
      role: "sek.madrasah",
      fullName: "Pengelola Madrasah",
      gender: "P",
    },
    {
      id: "u-sek-pondok",
      username: "sek_pondok",
      email: "admin.pondok@p3hm.org",
      role: "sek.pondok",
      fullName: "Pengelola Pondok",
      gender: "L",
    },
    {
      id: "u-admin-mphm",
      username: "admin_mphm",
      email: "superadmin@mphm.org",
      role: "sek.madrasah",
      fullName: "Super Admin Sistem MPHM",
      gender: "L",
    },
  ];

  for (const user of coreUsers) {
    const personId = `p-${user.username}`;

    // 1. Upsert Person
    await sql`
      INSERT INTO people (id, full_name, gender, phone_number, created_at)
      VALUES (${personId}, ${user.fullName}, ${user.gender}, '081234567890', NOW())
      ON CONFLICT (id) 
      DO UPDATE SET full_name = ${user.fullName}, gender = ${user.gender};
    `;

    // 2. Upsert UserAccount
    await sql`
      INSERT INTO user_accounts (id, person_id, username, email, password_hash, role, status)
      VALUES (${user.id}, ${personId}, ${user.username}, ${user.email}, 'mubtadiaat123', ${user.role}, 'ACTIVE')
      ON CONFLICT (username)
      DO UPDATE SET status = 'ACTIVE', role = ${user.role}, person_id = ${personId};
    `;

    console.log(`✅ Akun ${user.username} (${user.role}) berhasil didaftarkan.`);
  }

  console.log("======================================================");
  console.log("🎉 SEEDING SELESAI! Seluruh akun inti siap digunakan.");
  console.log("======================================================");
}

seedCoreUsers().catch(err => {
  console.error("❌ Error seeding core users:", err);
  process.exit(1);
});
