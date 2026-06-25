const fs = require('fs');
const path = require('path');

const files = [
    'AccountingBunkerPage.tsx',
    'AdminBunkerPage.tsx',
    'CloningBunkerPage.tsx',
    'DirectorBunkerPage.tsx',
    'HRBunkerPage.tsx',
    'InvestmentBunkerPage.tsx',
    'MaintenanceBunkerPage.tsx',
    'MarketingBunkerPage.tsx',
    'PlanningBunkerPage.tsx',
    'SecOpsBunkerPage.tsx',
    'SystemsBunkerPage.tsx'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, '../pages', file);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Find const ARI_..._PROMPT = `...` or const LUZ_... = `...`
    const promptRegex = /const (ARI_\w+|LUZ_\w+)\s*=\s*`([\s\S]*?)`/;
    const promptMatch = content.match(promptRegex);
    
    // Find const current...Summary = `...`
    const summaryRegex = /const (current\w+|telemetrySummary)\s*=\s*`([\s\S]*?)`|const (current\w+|telemetrySummary)\s*=\s*([\s\S]*?);/;
    const summaryMatch = content.match(summaryRegex);
    
    console.log(`=== ${file} ===`);
    if (promptMatch) {
        console.log(`PROMPT_NAME: ${promptMatch[1]}`);
        console.log(`PROMPT_TEXT:\n${promptMatch[2].trim()}`);
    } else {
        console.log("PROMPT NOT FOUND");
    }
    
    // Let's also look for the KPIs summary inside handleSend
    const handleSendContent = content.indexOf('handleSend') !== -1 ? content.substring(content.indexOf('handleSend'), content.indexOf('handleSend') + 1500) : '';
    const kpiRegex = /const\s+(current\w+Summary|telemetrySummary)\s*=\s*`([\s\S]*?)`/;
    const kpiMatch = handleSendContent.match(kpiRegex) || content.match(kpiRegex);
    if (kpiMatch) {
        console.log(`KPIs:\n${kpiMatch[2].trim()}`);
    }
    console.log("\n");
});
