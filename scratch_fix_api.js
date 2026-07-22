const fs = require('fs');
const path = require('path');

function processDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const f = path.join(dir, file);
    if (fs.statSync(f).isDirectory()) {
      processDir(f);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(f, 'utf8');
      let changed = false;
      
      const pattern = /\|\|\s*["']https:\/\/api\.m\.p3hm\.my\.id["']/g;
      if (pattern.test(content)) {
        content = content.replace(pattern, '|| ""');
        changed = true;
      }
      
      const pattern2 = /["']https:\/\/api\.m\.p3hm\.my\.id\/api\//g;
      if (pattern2.test(content)) {
        content = content.replace(pattern2, '"/api/');
        changed = true;
      }

      const pattern3 = /\? process\.env\.NEXT_PUBLIC_API_URL\s*:\s*["']https:\/\/api\.m\.p3hm\.my\.id\/api\/settings["']/g;
      if (pattern3.test(content)) {
        content = content.replace(pattern3, '? process.env.NEXT_PUBLIC_API_URL : "/api/settings"');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed', f);
      }
    }
  }
}

processDir(path.join(__dirname, 'apps/web/src'));
