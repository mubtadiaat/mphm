const fs = require('fs');

const filesToUpdate = [
    'd:/DEVELZY/MPHM_V.02/apps/api/src/services/grade.service.ts',
    'd:/DEVELZY/MPHM_V.02/apps/api/src/routes/assessmentEngine.ts',
    'd:/DEVELZY/MPHM_V.02/apps/api/src/routes/promotionEngine.ts',
    'd:/DEVELZY/MPHM_V.02/apps/web/src/features/sekretariat/queries/useSubjects.ts',
    'd:/DEVELZY/MPHM_V.02/apps/web/src/features/sekretariat/components/KurikulumTab.tsx',
    'd:/DEVELZY/MPHM_V.02/apps/web/src/components/shared/ImportExportToolbar.tsx',
    'd:/DEVELZY/MPHM_V.02/apps/web/src/app/(dashboard)/mustahiq/penilaian/page.tsx',
    'd:/DEVELZY/MPHM_V.02/apps/web/src/app/(dashboard)/guardian/[[...slug]]/page.tsx',
    'd:/DEVELZY/MPHM_V.02/apps/web/src/app/(dashboard)/pimpinan/[[...slug]]/page.tsx',
];

for (const file of filesToUpdate) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // TypeScript types and string constants
        content = content.replace(/"SAKRAL"/g, '"MAPEL"');
        content = content.replace(/'SAKRAL'/g, "'MAPEL'");
        content = content.replace(/"UMUM"/g, '"NON_MAPEL"');
        content = content.replace(/'UMUM'/g, "'NON_MAPEL'");
        
        // UI Text and comments
        content = content.replace(/Sakral/g, 'Mapel');
        content = content.replace(/sakral/g, 'mapel');
        content = content.replace(/Umum/g, 'Non-Mapel');
        content = content.replace(/umum/g, 'non-mapel');
        content = content.replace(/SAKRAL \(Al-Qur\'an, Akhlaq & Internal\)/g, 'MAPEL (Al-Qur\'an, Akhlaq & Internal)');
        content = content.replace(/UMUM \(Ilmu Pengetahuan & Kitab Kuning\)/g, 'NON-MAPEL (Ilmu Pengetahuan & Kitab Kuning)');
        content = content.replace(/Mapel Mapel/g, 'Mapel');
        
        fs.writeFileSync(file, content);
    }
}
console.log('Code files updated');
