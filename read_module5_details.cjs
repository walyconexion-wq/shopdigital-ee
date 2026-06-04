const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('scenario_5260209.json', 'utf8').trim().replace(/^\uFEFF/, ''));
  const mod5 = data.response.blueprint.flow.find(m => m.id === 5);
  console.log(JSON.stringify(mod5, null, 2));
} catch (err) {
  console.error("Error:", err.message);
}
