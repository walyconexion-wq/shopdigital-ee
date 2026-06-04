const fs = require('fs');
const path = require('path');

const searchDir = 'C:\\Users\\walya\\Downloads\\shopdigital.ar---esteban-echeverría';
const appID = '198551957566823';

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      search(fullPath);
    } else {
      let content;
      try {
        content = fs.readFileSync(fullPath, 'utf8');
      } catch (e) {
        continue;
      }
      if (content.includes(appID) || content.toLowerCase().includes('appsecret') || content.toLowerCase().includes('app_secret')) {
        console.log(`Found in: ${fullPath}`);
        // print lines containing match
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes(appID) || line.toLowerCase().includes('secret') || line.toLowerCase().includes('app_secret')) {
            console.log(`  Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

search(searchDir);
