require('dotenv').config({ path: './apps/web/.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.userAccount.findMany();
  console.log('Total accounts in DB:', users.length);

  for (const u of users) {
    let inst = 'MADRASAH';
    const r = (u.role || '').toLowerCase();
    const uName = (u.username || '').toLowerCase();

    if (uName === 'develzy' || r.includes('superadmin') || uName === 'admin' || uName === 'admin mphm') {
      inst = 'ALL';
    } else if (r.includes('pondok') || r.includes('p3hm') || r.includes('musyrifah') || r.includes('mufat') || r.includes('mundzir') || r.includes('keamanan') || uName.includes('p3hm')) {
      inst = 'PONDOK';
    } else if (r.includes('madrasah') || r.includes('mphm') || r.includes('mustahiq') || r.includes('munawwib') || uName.includes('mphm')) {
      inst = 'MADRASAH';
    }

    console.log(`Account [${u.username}] -> Role: "${u.role}" -> Institution: "${inst}"`);
    await (prisma.userAccount).update({
      where: { id: u.id },
      data: { institution: inst }
    });
  }

  // Also backfill organization_memberships
  const orgs = await prisma.organizationMembership.findMany();
  console.log('Total organization memberships in DB:', orgs.length);
  for (const om of orgs) {
    let inst = 'PONDOK';
    const r = (om.role || '').toLowerCase();
    if (r.includes('madrasah') || r.includes('mphm') || r.includes('mustahiq') || r.includes('munawwib')) {
      inst = 'MADRASAH';
    }
    await (prisma.organizationMembership).update({
      where: { id: om.id },
      data: { institution: inst }
    });
  }

  console.log('✅ Done backfilling database!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
