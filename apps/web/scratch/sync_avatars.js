const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('./apps/web/.env.local'));
const sql = neon(env.DATABASE_URL);

// High quality professional profile photo avatars
const AVATARS_MALE = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250"
];

const AVATARS_FEMALE = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250"
];

async function run() {
  const people = await sql`SELECT id, full_name, gender, avatar_url FROM people WHERE deleted_at IS NULL`;
  console.log(`Found ${people.length} people in database.`);

  let updatedCount = 0;
  for (let i = 0; i < people.length; i++) {
    const p = people[i];
    if (!p.avatar_url || p.avatar_url.trim() === '' || p.avatar_url === '-') {
      const list = p.gender === 'P' ? AVATARS_FEMALE : AVATARS_MALE;
      const avatarUrl = list[i % list.length];
      await sql`UPDATE people SET avatar_url = ${avatarUrl} WHERE id = ${p.id}`;
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} people with photo avatar URLs!`);
}

run().catch(console.error);
