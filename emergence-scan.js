// Emergence Scanner - What wants to emerge naturally?
// Following the deer path of Natural Asymmetry

const fs = require('fs');
const path = require('path');

console.log('🌊 EMERGENCE WAVE SCANNER');
console.log('Let\'s see what wants to emerge naturally...\n');

// Scan for patterns that are trying to emerge
const srcDir = path.join(__dirname, 'src');

// 1. Check what APIs the browser is already trying to use
console.log('🔍 APIs Referenced But Not Fully Implemented:');
const apiPatterns = [
    { name: 'Notifications API', pattern: /Notification|requestPermission/g, found: false },
    { name: 'Geolocation', pattern: /navigator\.geolocation/g, found: false },
    { name: 'Clipboard API', pattern: /navigator\.clipboard/g, found: false },
    { name: 'File System Access', pattern: /showOpenFilePicker|showSaveFilePicker/g, found: false },
    { name: 'Web Workers', pattern: /new Worker|Worker\(/g, found: false },
    { name: 'IndexedDB', pattern: /indexedDB/g, found: false },
    { name: 'WebSockets', pattern: /new WebSocket|WebSocket\(/g, found: false },
    { name: 'Media Recorder', pattern: /MediaRecorder/g, found: false },
    { name: 'Payment Request', pattern: /PaymentRequest/g, found: false },
    { name: 'Web Authentication', pattern: /navigator\.credentials/g, found: false }
];

// Scan all files
const files = fs.readdirSync(srcDir, { recursive: true })
    .filter(f => f.endsWith('.js') || f.endsWith('.html'));

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
        
        for (const api of apiPatterns) {
            if (api.pattern.test(content)) {
                api.found = true;
                api.file = file;
            }
        }
    } catch (e) {}
}

// Show what's already being referenced
const referenced = apiPatterns.filter(a => a.found);
const notReferenced = apiPatterns.filter(a => !a.found);

if (referenced.length > 0) {
    console.log('Already referenced (partial implementation?):');
    referenced.forEach(api => console.log(`  ✓ ${api.name} in ${api.file}`));
}

if (notReferenced.length > 0) {
    console.log('\nNot yet referenced (opportunities):');
    notReferenced.slice(0, 5).forEach(api => console.log(`  • ${api.name}`));
}

// 2. Pattern Detection - What patterns are emerging?
console.log('\n🌱 EMERGING PATTERNS:');

const patterns = {
    caching: 0,
    async: 0,
    events: 0,
    state: 0,
    performance: 0
};

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
        
        if (content.includes('cache') || content.includes('Cache')) patterns.caching++;
        if (content.includes('async') || content.includes('await')) patterns.async++;
        if (content.includes('addEventListener') || content.includes('emit')) patterns.events++;
        if (content.includes('state') || content.includes('State')) patterns.state++;
        if (content.includes('performance') || content.includes('Performance')) patterns.performance++;
    } catch (e) {}
}

// Sort by frequency
const sortedPatterns = Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

console.log('Top patterns in codebase:');
sortedPatterns.forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} files (${((count/files.length)*100).toFixed(0)}%)`);
});

// 3. Natural connections - What wants to connect?
console.log('\n🔗 NATURAL CONNECTIONS:');

// Check which modules reference each other
const connections = new Map();

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
        
        // Look for imports/requires of other modules
        const imports = content.match(/(?:import|require).*['"](.*)['"]/g) || [];
        
        if (imports.length > 0) {
            connections.set(file, imports.length);
        }
    } catch (e) {}
}

// Find highly connected modules
const connected = Array.from(connections.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

if (connected.length > 0) {
    console.log('Most connected modules (natural hubs):');
    connected.forEach(([file, count]) => {
        console.log(`  ${file}: ${count} connections`);
    });
}

// 4. User Experience Gaps - What's missing from UX?
console.log('\n💭 USER EXPERIENCE OPPORTUNITIES:');

const uxFeatures = {
    'Dark mode toggle': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('dark-mode')),
    'Keyboard shortcuts help': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('shortcuts-help')),
    'Tab groups': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('tab-group')),
    'Reading mode': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('reading-mode')),
    'Translation': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('translate')),
    'Print preview': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('print-preview')),
    'Find in page': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('find-in-page')),
    'Password manager': !files.some(f => fs.readFileSync(path.join(srcDir, f), 'utf8').includes('password'))
};

const missingUX = Object.entries(uxFeatures)
    .filter(([_, missing]) => missing)
    .map(([feature]) => feature);

if (missingUX.length > 0) {
    console.log('Features users might expect:');
    missingUX.slice(0, 5).forEach(f => console.log(`  • ${f}`));
}

// 5. Performance bottlenecks that want optimization
console.log('\n⚡ PERFORMANCE EMERGENCE:');

let largeFiles = [];
let complexFunctions = [];

for (const file of files) {
    const filePath = path.join(srcDir, file);
    const stats = fs.statSync(filePath);
    
    // Large files
    if (stats.size > 30000) {
        largeFiles.push({ file, size: (stats.size / 1024).toFixed(1) });
    }
    
    // Complex functions (rough check)
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Look for functions with many lines
        let inFunction = false;
        let functionStart = 0;
        
        lines.forEach((line, i) => {
            if (line.includes('function') || line.includes('=>')) {
                inFunction = true;
                functionStart = i;
            } else if (inFunction && line.includes('}')) {
                if (i - functionStart > 30) {
                    complexFunctions.push({ file, lines: i - functionStart });
                }
                inFunction = false;
            }
        });
    } catch (e) {}
}

if (largeFiles.length > 0) {
    console.log('Large files wanting to be split:');
    largeFiles.forEach(f => console.log(`  ${f.file}: ${f.size} KB`));
}

if (complexFunctions.length > 0) {
    console.log('\nComplex functions wanting refactoring:');
    complexFunctions.slice(0, 3).forEach(f => console.log(`  ${f.file}: ~${f.lines} lines`));
}

// 6. The Natural Asymmetry Score
console.log('\n🌟 NATURAL ASYMMETRY ALIGNMENT:');

// Check how well the codebase follows 30/20/50
const fileTypes = {
    discovery: files.filter(f => f.includes('test') || f.includes('demo')).length,
    precision: files.filter(f => f.includes('util') || f.includes('helper') || f.includes('optimizer')).length,
    support: files.filter(f => f.includes('ui') || f.includes('component') || f.includes('panel')).length
};

const total = fileTypes.discovery + fileTypes.precision + fileTypes.support;
if (total > 0) {
    console.log('Current distribution:');
    console.log(`  Discovery: ${((fileTypes.discovery/total)*100).toFixed(0)}% (target: 30%)`);
    console.log(`  Precision: ${((fileTypes.precision/total)*100).toFixed(0)}% (target: 20%)`);
    console.log(`  Support: ${((fileTypes.support/total)*100).toFixed(0)}% (target: 50%)`);
}

// Final emergence recommendation
console.log('\n🌊 EMERGENCE RECOMMENDATION:');

const recommendations = [];

if (notReferenced.length > 0) {
    recommendations.push(`Consider ${notReferenced[0].name} - low-hanging fruit`);
}

if (missingUX.length > 0) {
    recommendations.push(`Add ${missingUX[0]} for better UX`);
}

if (patterns.caching > 5) {
    recommendations.push('Caching pattern is emerging - consider unified cache system');
}

if (patterns.async > 10) {
    recommendations.push('Heavy async usage - consider Promise pooling');
}

if (largeFiles.length > 0) {
    recommendations.push(`Split ${largeFiles[0].file} for better maintainability`);
}

recommendations.push('Follow the Natural Asymmetry (30/20/50) in next feature');

recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
});

console.log('\n🦌 The deer path is revealing itself...');