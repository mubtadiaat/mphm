const fs = require('fs');
const path = require('path');

function processDir(dir) {
  for(const file of fs.readdirSync(dir)){
    const f=path.join(dir,file);
    if(fs.statSync(f).isDirectory()) processDir(f);
    else if(f.endsWith('.ts')){
      let c = fs.readFileSync(f, 'utf8');
      let changed = false;
      
      // We know countResult and result are the variables for raw queries.
      if (c.includes('countResult[0]')) {
        c = c.replace(/countResult\[0\]/g, 'countResult.rows[0]');
        changed = true;
      }
      if (c.includes('result.map')) {
        c = c.replace(/result\.map/g, 'result.rows.map');
        changed = true;
      }
      
      if (changed) fs.writeFileSync(f, c, 'utf8');
    }
  }
}
processDir(path.join(__dirname,'apps/web/src/server'));
console.log('Fixed .rows');
