const fs = require('fs');
const path = require('path');

const searchDir = 'C:\\Users\\walya\\Downloads\\shopdigital.ar---esteban-echeverría';
const keywords = ['incrementarVisitas', 'registrarVisita'];

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      search(fullPath);
    } else {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js')) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const kw of keywords) {
        if (content.includes(kw)) {
          console.log(`Found "${kw}" in: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes(kw)) {
              console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

search(searchDir);
