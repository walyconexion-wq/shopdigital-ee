const fs = require('fs');

const css = fs.readFileSync('C:/Users/walya/Downloads/shopdigital.ar---esteban-echeverría/index.css', 'utf8');

const lines = css.split('\n');
let count = 0;
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('input') || line.toLowerCase().includes('select') || line.toLowerCase().includes('option')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
    count++;
  }
});
console.log(`Total occurrences found: ${count}`);
