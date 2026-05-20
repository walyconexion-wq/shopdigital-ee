const fs = require('fs');
const path = require('path');

const destPath = path.join(__dirname, 'pages', 'EnterpriseDetailPage.tsx');
let content = fs.readFileSync(destPath, 'utf-8');

// Color swap
content = content.replace(/#22d3ee/g, '#f59e0b');
content = content.replace(/cyan-/g, 'amber-');
// Adjust back button path
content = content.replace(/navigate\(`\/\$\{townId\}\/\$\{categorySlug\}`\)/g, 'navigate(`/empresas/${categorySlug}`)');
content = content.replace(/navigate\(`\/\$\{townId\}\`/g, 'navigate(`/empresas`');

fs.writeFileSync(destPath, content, 'utf-8');
console.log('Colors and routes swapped for B2B!');
