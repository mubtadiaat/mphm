const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: './apps/web/.env.local' });
process.env.POSTGRES_URL = process.env.DATABASE_URL;

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(hashArray, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

async function run() {
  console.log("Generating hashes...");
  const adminPwdHash = await hashPassword("madrasahp3hm123");
  const defaultPwdHash = await hashPassword("mphm123");
  const adminPersonId = crypto.randomUUID();
  const mustahiqPersonId = crypto.randomUUID();
  const mufattisyPersonId = crypto.randomUUID();
  const waliPersonId = crypto.randomUUID();

  console.log("Inserting People...");
  await sql`
    INSERT INTO people (id, full_name, gender)
    VALUES 
      (${adminPersonId}, 'Sekretariat Pusat', 'L'),
      (${mustahiqPersonId}, 'Mustahiq Kelas A', 'L'),
      (${mufattisyPersonId}, 'Mufattisy Wilayah', 'L'),
      (${waliPersonId}, 'Wali Santri 01', 'L')
    ON CONFLICT DO NOTHING;
  `;

  console.log("Inserting User Accounts...");
  await sql`
    INSERT INTO user_accounts (id, person_id, username, password_hash, role)
    VALUES 
      (${crypto.randomUUID()}, ${adminPersonId}, 'admin_mphm', ${adminPwdHash}, 'Sekretariat'),
      (${crypto.randomUUID()}, ${mustahiqPersonId}, 'mustahiq01', ${defaultPwdHash}, 'Mustahiq'),
      (${crypto.randomUUID()}, ${mufattisyPersonId}, 'mufattisy01', ${defaultPwdHash}, 'Mufattisy'),
      (${crypto.randomUUID()}, ${waliPersonId}, 'wali01', ${defaultPwdHash}, 'Wali Santri')
    ON CONFLICT (username) DO NOTHING;
  `;

  console.log("Seed data created successfully!");
}

run().catch(console.error);
