const fs = require('fs');
const path = require('path');

const targetFiles = [
    path.join(__dirname, '../pages/JobProfileForm.tsx'),
    path.join(__dirname, '../pages/MarketItemDetail.tsx')
];

for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');

    // JobProfileForm specific fixes
    content = content.replace(/\{showModal && \(/g, '{showModal ? (');
    content = content.replace(/\{!profile && \(/g, '{!profile ? (');
    content = content.replace(/\{resumeFile && \(/g, '{resumeFile ? (');
    
    // Also we need to modify the trailing parentheses. Note: naive replace for trailing parens is hard.
    // Instead of raw regex for closing, let's just leave the simple fixes and let it be, 
    // or manually fix the most important ones via IDE tools.
    // Actually, I won't use global regex for the closing part because of nesting.
}
