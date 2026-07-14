const fs = require('fs');
const path = require('path');

function summarizeMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const summary = [];
    
    let currentHeader = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#')) {
            currentHeader = line;
            summary.push(line);
        } else if (line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
            // Keep lists
            if (line.includes('**')) {
                 summary.push('  ' + line);
            }
        } else if (line.includes('**')) {
            // Extract lines with bold keywords which usually denote important rules
            // Just extract the bold part to keep it short
            const bolds = [...line.matchAll(/\*\*(.*?)\*\*/g)].map(m => m[1]);
            if (bolds.length > 0) {
                 summary.push('  [Key Concepts]: ' + bolds.join(', '));
            }
        }
    }
    return summary.join('\n');
}

function processDirectory(dir, excludePath) {
    const files = fs.readdirSync(dir);
    let result = '';
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) continue;
        if (excludePath && fullPath.includes(excludePath)) continue;
        if (file.endsWith('.md')) {
            result += `\n\n=== ${file} ===\n`;
            result += summarizeMarkdown(fullPath);
        }
    }
    return result;
}

const oldDir = 'd:\\DEVELZY\\MPHM_V.02\\.develzy\\Blueprint_lama';
const newDir = 'd:\\DEVELZY\\MPHM_V.02\\.develzy';

const oldSummary = processDirectory(oldDir, null);
const newSummary = processDirectory(newDir, 'Blueprint_lama');

fs.writeFileSync('d:\\DEVELZY\\MPHM_V.02\\scratch\\old_summary.txt', oldSummary, 'utf-8');
fs.writeFileSync('d:\\DEVELZY\\MPHM_V.02\\scratch\\new_summary.txt', newSummary, 'utf-8');
console.log('Summaries created successfully.');
