const fs = require('fs');

const dbFiles = [
    'd:/DEVELZY/MPHM_V.02/packages/db/src/schema/academic.ts',
    'd:/DEVELZY/MPHM_V.02/packages/db/drizzle/0000_nice_winter_soldier.sql',
    'd:/DEVELZY/MPHM_V.02/packages/db/drizzle/meta/0000_snapshot.json',
    'd:/DEVELZY/MPHM_V.02/packages/db/data_dummy.sql',
];

for (const file of dbFiles) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/"SAKRAL"/g, '"MAPEL"');
        content = content.replace(/'SAKRAL'/g, "'MAPEL'");
        content = content.replace(/"UMUM"/g, '"NON_MAPEL"');
        content = content.replace(/'UMUM'/g, "'NON_MAPEL'");
        fs.writeFileSync(file, content);
    }
}
console.log('DB files updated');
