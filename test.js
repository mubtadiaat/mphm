require('dotenv').config({path: './apps/web/.env.local'});
process.env.POSTGRES_URL=process.env.DATABASE_URL;
process.env.POSTGRES_URL_NON_POOLING=process.env.DATABASE_URL_UNPOOLED;
const {sql} = require('drizzle-orm');
const {createClient} = require('@vercel/postgres');
const {drizzle} = require('drizzle-orm/vercel-postgres');
const client = createClient();
client.connect().then(() => {
  const db = drizzle(client);
  const searchPattern = null;
  db.execute(sql`SELECT COUNT(DISTINCT gp.family_card_number) as total FROM guardian_profiles gp JOIN people p ON p.id = gp.person_id WHERE gp.deleted_at IS NULL AND p.deleted_at IS NULL AND (${searchPattern} IS NULL OR p.full_name LIKE ${searchPattern})`)
    .then(r => {console.log(r); client.end()})
    .catch(e => {console.error("ERROR:"); console.error(e); client.end()});
});
