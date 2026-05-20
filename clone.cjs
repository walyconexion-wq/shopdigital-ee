const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'pages', 'ShopDetailPage.tsx');
const destPath = path.join(__dirname, 'pages', 'EnterpriseDetailPage.tsx');

let content = fs.readFileSync(srcPath, 'utf-8');
content = content.replace(/ShopDetailPage/g, 'EnterpriseDetailPage');
content = content.replace(/shopSlug/g, 'enterpriseSlug');
content = content.replace(/selectedShop/g, 'enterprise');

// Fix: "enterprise" needs to have entityType = enterprise, wait, selectedShop in ShopDetailPage just searches for slug.
// Let's modify the filtering logic a bit if needed.
fs.writeFileSync(destPath, content, 'utf-8');
console.log('Replaced and written successfully!');
