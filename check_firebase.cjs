const fs = require('fs');

const content = fs.readFileSync('C:/Users/walya/Downloads/shopdigital.ar---esteban-echeverría/firebase.ts', 'utf8');

// Find the function guardarComercio
const lines = content.split('\n');
let start = -1;
let openBrackets = 0;
let output = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const guardarComercio')) {
    start = i;
  }
  if (start !== -1) {
    output.push(`${i+1}: ${lines[i]}`);
    const matchesOpen = lines[i].match(/{/g);
    const matchesClose = lines[i].match(/}/g);
    if (matchesOpen) openBrackets += matchesOpen.length;
    if (matchesClose) openBrackets -= matchesClose.length;
    if (openBrackets === 0 && output.length > 1) {
      break;
    }
  }
}

console.log(output.join('\n'));
