const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('./apps/web/.env.local'));
const sql = neon(env.DATABASE_URL);

async function run() {
  const teachers = await sql`SELECT tp.id, tp.person_id, p.full_name FROM teacher_profiles tp JOIN people p ON tp.person_id = p.id WHERE tp.deleted_at IS NULL`;
  console.log('TEACHER_COUNT:', teachers.length);
  
  let createdCount = 0;
  for (const t of teachers) {
    const mems = await sql`SELECT id FROM organization_memberships WHERE person_id = ${t.person_id}`;
    if (mems.length === 0) {
      await sql`INSERT INTO organization_memberships (id, person_id, role, service_year, status) VALUES (gen_random_uuid(), ${t.person_id}, 'Mustahiq', '2026', 'ACTIVE')`;
      createdCount++;
    }
  }
  console.log(`Created ${createdCount} OrganizationMembership records for teachers.`);
}

run().catch(console.error);
