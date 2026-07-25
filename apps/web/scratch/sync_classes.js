const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('./apps/web/.env.local'));
const sql = neon(env.DATABASE_URL);

function parseRoman(roman) {
  const map = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
  return map[roman] || parseInt(roman) || 1;
}

async function run() {
  // Get active academic year
  const years = await sql`SELECT id, name FROM academic_years WHERE is_active = true AND deleted_at IS NULL LIMIT 1`;
  if (years.length === 0) {
    console.log('No active academic year found!');
    return;
  }
  const yearId = years[0].id;
  console.log('Active Academic Year:', years[0].name, 'ID:', yearId);

  // 1. Get all Mustahiq memberships
  const mustahiqs = await sql`SELECT om.id, om.person_id, om.role, om.supervised_level, p.full_name FROM organization_memberships om JOIN people p ON om.person_id = p.id WHERE om.role ILIKE '%mustahiq%' AND om.deleted_at IS NULL`;
  console.log('MUSTAHIQ_COUNT:', mustahiqs.length);

  let createdClasses = 0;
  let updatedClasses = 0;

  for (const m of mustahiqs) {
    let str = m.role.replace(/^Mustahiq\s*/i, '').trim();
    if (!str || str === 'Mustahiq') continue;

    let jenjang = 'Ibtida\'iyyah';
    if (/i['`’]?dadiyyah/i.test(str)) jenjang = 'I\'dadiyyah';
    else if (/ibtida['`’]?iyyah/i.test(str)) jenjang = 'Ibtida\'iyyah';
    else if (/tsanawiyyah/i.test(str)) jenjang = 'Tsanawiyyah';
    else if (/aliyyah/i.test(str)) jenjang = 'Aliyyah';

    let tingkat = 'I';
    const tingkatMatch = str.match(/\b(VI|IV|V|III|II|I|1|2|3|4|5|6)\b/i);
    if (tingkatMatch) tingkat = tingkatMatch[1].toUpperCase();

    let lokal = 'A';
    const parts = str.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    if (/^[A-Z]$/i.test(lastPart)) {
      lokal = lastPart.toUpperCase();
    }

    const className = `${jenjang} ${tingkat}-${lokal}`;
    const fullClassName = `Kelas ${jenjang} ${tingkat}-${lokal}`;
    const levelNumber = parseRoman(tingkat);

    // Check if class exists
    const existing = await sql`SELECT id, mustahiq_id FROM academic_classes WHERE academic_year_id = ${yearId} AND (name = ${className} OR name = ${className.replace('-', ' ')}) AND deleted_at IS NULL`;

    if (existing.length === 0) {
      await sql`INSERT INTO academic_classes (id, academic_year_id, name, full_name, institution_level, level_number, mustahiq_id) VALUES (gen_random_uuid(), ${yearId}, ${className}, ${fullClassName}, ${jenjang}, ${levelNumber}, ${m.person_id})`;
      console.log(`[AUTO-CREATED CLASS] ${className} -> Mustahiq: ${m.full_name}`);
      createdClasses++;
    } else {
      if (!existing[0].mustahiq_id) {
        await sql`UPDATE academic_classes SET mustahiq_id = ${m.person_id} WHERE id = ${existing[0].id}`;
        console.log(`[UPDATED MUSTAHIQ] ${className} -> Assigned: ${m.full_name}`);
        updatedClasses++;
      }
    }
  }

  console.log(`Done! Created ${createdClasses} new classes, updated ${updatedClasses} classes.`);

  // 2. Sync Santri Enrollments into created classes
  const students = await sql`SELECT sp.id AS student_id, sp.person_id, p.full_name FROM student_profiles sp JOIN people p ON sp.person_id = p.id WHERE sp.deleted_at IS NULL`;
  console.log('STUDENT_COUNT:', students.length);

  const allClasses = await sql`SELECT id, name, institution_level FROM academic_classes WHERE academic_year_id = ${yearId} AND deleted_at IS NULL`;

  let enrolledCount = 0;
  for (const s of students) {
    // Check if already enrolled
    const enrolled = await sql`SELECT id FROM class_enrollments WHERE student_id = ${s.student_id} AND status = 'ACTIVE' AND deleted_at IS NULL`;
    if (enrolled.length === 0 && allClasses.length > 0) {
      // Pick first class or match pattern
      const targetClass = allClasses[enrolledCount % allClasses.length];
      await sql`INSERT INTO class_enrollments (id, class_id, student_id, status) VALUES (gen_random_uuid(), ${targetClass.id}, ${s.student_id}, 'ACTIVE')`;
      enrolledCount++;
    }
  }
  console.log(`Enrolled ${enrolledCount} santri into academic classes.`);
}

run().catch(console.error);
