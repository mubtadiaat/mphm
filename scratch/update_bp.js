const fs = require('fs');
const path = require('path');
const dir = 'd:/DEVELZY/MPHM_V.02/.develzy';

function processFile(filePath) {
    if (!filePath.endsWith('.md')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Phrases
    content = content.replace(/5 Mapel Sakral/gi, '5 Mapel');
    content = content.replace(/5 Mata Pelajaran Sakral/gi, '5 Mapel');
    content = content.replace(/Mapel Sakral/gi, 'Mapel');
    content = content.replace(/Mata Pelajaran Sakral/gi, 'Mapel');
    content = content.replace(/Mapel Umum/gi, 'Non-Mapel');
    content = content.replace(/Mata Pelajaran Umum/gi, 'Non-Mapel');
    content = content.replace(/mata pelajaran umum/gi, 'non-mapel');
    content = content.replace(/mata pelajaran sakral/gi, 'mapel');
    
    // Specific contexts
    content = content.replace(/SAKRAL/g, 'MAPEL');
    content = content.replace(/Sakral/g, 'Mapel');
    content = content.replace(/sakral/g, 'mapel');
    content = content.replace(/"UMUM"/g, '"NON_MAPEL"');
    content = content.replace(/UMUM \(General\)/g, 'NON-MAPEL (General)');
    content = content.replace(/Umum\/Sakral/gi, 'Non-Mapel/Mapel');
    content = content.replace(/Umum \& Sakral/gi, 'Non-Mapel & Mapel');
    
    fs.writeFileSync(filePath, content);
}

const files = fs.readdirSync(dir);
for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile()) {
        processFile(fullPath);
    }
}
console.log('Blueprints updated');
