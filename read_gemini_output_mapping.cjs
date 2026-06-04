const fs = require('fs');

function searchFile(filename) {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const regex = /\{\{2\.[^}]+\}\}/g;
    const matches = content.match(regex);
    console.log(`=== Matches in ${filename} ===`);
    if (matches) {
      console.log(Array.from(new Set(matches)));
    } else {
      console.log("No matches");
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
  }
}

searchFile('scenario_5260209.json');
searchFile('scenario_4064964.json');
