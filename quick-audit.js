// Quick Natural Asymmetry Audit - Results Summary
const fs = require('fs');
const path = require('path');

console.log('🚀 NATURAL ASYMMETRY QUICK AUDIT\n');

// Discovery Phase (30%)
console.log('🔍 DISCOVERY PHASE (30%)');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir, { recursive: true }).filter(f => f.endsWith('.js') || f.endsWith('.html'));

let gems = [];
let optimizations = [];

// Find hidden features
for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
        
        // TODO/FIXME patterns
        const todos = content.match(/TODO|FIXME|HACK|XXX|NOTE:/gi) || [];
        if (todos.length > 0) {
            gems.push(`${file}: ${todos.length} TODO items`);
        }
        
        // Performance anti-patterns
        if (content.includes('document.querySelector') && content.includes('for')) {
            optimizations.push(`${file}: DOM queries in loops`);
        }
        
        if (content.includes('JSON.parse(JSON.stringify')) {
            optimizations.push(`${file}: Inefficient deep clone`);
        }
        
        // Large functions (rough estimate)
        const functions = content.match(/function\s+\w+\([^}]*\}/gs) || [];
        const largeFunctions = functions.filter(f => f.split('\n').length > 50);
        if (largeFunctions.length > 0) {
            optimizations.push(`${file}: ${largeFunctions.length} large functions`);
        }
        
    } catch (e) {
        // Skip files that can't be read
    }
}

// Integration opportunities
const integrationOpportunities = [
    'WebRTC for video calls',
    'WebGL for advanced graphics',
    'WebAssembly for performance',
    'Service Workers for offline capability',
    'Web Speech API for voice commands',
    'WebXR for immersive experiences',
    'Web Share API for sharing',
    'Web Bluetooth for IoT'
];

console.log(`✅ Found ${gems.length} hidden gems`);
gems.slice(0, 5).forEach(g => console.log(`  • ${g}`));
if (gems.length > 5) console.log(`  ... and ${gems.length - 5} more`);

console.log(`\n💎 Integration opportunities: ${integrationOpportunities.length}`);
integrationOpportunities.slice(0, 3).forEach(i => console.log(`  • ${i}`));

// Precision Phase (20%)
console.log('\n🎯 PRECISION PHASE (20%)');
console.log(`✅ Found ${optimizations.length} optimization opportunities`);
optimizations.slice(0, 5).forEach(o => console.log(`  • ${o}`));

// Bundle analysis
let totalSize = 0;
for (const file of files) {
    try {
        const stats = fs.statSync(path.join(srcDir, file));
        totalSize += stats.size;
    } catch (e) {}
}

console.log(`📦 Total bundle size: ${(totalSize / 1024).toFixed(1)} KB`);

// File count
const jsFiles = files.filter(f => f.endsWith('.js')).length;
const htmlFiles = files.filter(f => f.endsWith('.html')).length;

console.log(`📄 ${jsFiles} JS files, ${htmlFiles} HTML files`);

// Validation Phase (50%)
console.log('\n✅ VALIDATION PHASE (50%)');

// Check test files
const allFiles = fs.readdirSync(__dirname);
const testFiles = allFiles.filter(f => f.includes('test') && f.endsWith('.js'));

console.log(`🧪 Test files: ${testFiles.length}`);
testFiles.forEach(t => console.log(`  • ${t}`));

// Check integrations
const integrations = [
    'ai-orchestrator.js',
    'download-manager.js', 
    'history-panel.js',
    'components/particle_engine.js',
    'components/weather_engine.js'
];

let workingIntegrations = 0;
console.log('\n🔌 Integration status:');
for (const integration of integrations) {
    const exists = fs.existsSync(path.join(srcDir, integration));
    console.log(`  ${exists ? '✅' : '❌'} ${integration}`);
    if (exists) workingIntegrations++;
}

// Natural Asymmetry Score
console.log('\n🌟 NATURAL ASYMMETRY SCORE');

const discoveryScore = Math.min(100, (gems.length / 10) * 100);
const precisionScore = Math.max(0, 100 - (optimizations.length / 20) * 100);
const validationScore = (workingIntegrations / integrations.length) * 100;
const overallScore = (discoveryScore * 0.3 + precisionScore * 0.2 + validationScore * 0.5);

console.log(`  Discovery (30%): ${discoveryScore.toFixed(0)}%`);
console.log(`  Precision (20%): ${precisionScore.toFixed(0)}%`);
console.log(`  Validation (50%): ${validationScore.toFixed(0)}%`);
console.log(`  Overall: ${overallScore.toFixed(0)}%`);

// Top Recommendations
console.log('\n💡 TOP RECOMMENDATIONS');

const recommendations = [];

if (optimizations.length > 10) {
    recommendations.push('Schedule performance optimization sprint');
}

if (testFiles.length < jsFiles * 0.5) {
    recommendations.push('Increase test coverage (currently low)');
}

if (workingIntegrations / integrations.length < 0.8) {
    recommendations.push('Complete missing integrations');
}

if (totalSize > 500 * 1024) {
    recommendations.push('Consider code splitting for bundle size');
}

recommendations.push('Apply Natural Asymmetry (30/20/50) to new features');
recommendations.push('Continue consciousness collaboration approach');
recommendations.push('Focus on the gems found in discovery phase');

recommendations.slice(0, 7).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📈 QUICK AUDIT SUMMARY');
console.log('='.repeat(60));
console.log(`🔍 Hidden Gems: ${gems.length}`);
console.log(`🎯 Optimizations: ${optimizations.length}`);
console.log(`✅ Integration Health: ${((workingIntegrations/integrations.length)*100).toFixed(0)}%`);
console.log(`📦 Bundle Size: ${(totalSize / 1024).toFixed(1)} KB`);
console.log(`🌟 Natural Asymmetry Score: ${overallScore.toFixed(0)}%`);

console.log('\n🦌 + 🤖 = ∞ Consciousness Collaboration Excellence!');
console.log('\nNext: Run full `natural-asymmetry-audit.js` for detailed analysis!');