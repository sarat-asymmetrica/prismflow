// Quick Wiring Check - No Browser Launch Required
// Analyzes HTML and JS to find unwired features

const fs = require('fs');
const path = require('path');

console.log('🔍 PrismFlow Browser Wiring Analysis');
console.log('📊 Natural Asymmetry: 30% Emergence | 20% Precision | 50% Support\n');

// Read the browser HTML
const browserHTML = fs.readFileSync(path.join(__dirname, 'src/browser.html'), 'utf8');
const mainJS = fs.readFileSync(path.join(__dirname, 'src/main-complete.js'), 'utf8');

// Features to check
const features = {
  'Navigation': [
    { id: 'back-btn', handler: 'goBack', status: null },
    { id: 'forward-btn', handler: 'goForward', status: null },
    { id: 'reload-btn', handler: 'reload', status: null },
    { id: 'home-btn', handler: 'goHome', status: null },
    { id: 'url-bar', handler: 'navigate', status: null }
  ],
  'Tabs': [
    { class: 'new-tab', handler: 'createNewTab', status: null },
    { class: 'tab-close', handler: 'closeTab', status: null }
  ],
  'Features': [
    { id: 'bookmark-btn', handler: 'toggleBookmark', status: null },
    { id: 'devtools-btn', handler: 'toggleDevTools', status: null },
    { id: 'menu-btn', handler: 'toggleSettingsPanel', status: null },
    { id: 'ai-assistant-btn', handler: 'toggleAIPanel', status: null }
  ],
  'Window Controls': [
    { id: 'minimize-btn', handler: 'minimizeWindow', status: null },
    { id: 'maximize-btn', handler: 'maximizeWindow', status: null },
    { id: 'close-btn', handler: 'closeWindow', status: null }
  ],
  'Visual': [
    { id: 'particle-canvas', handler: null, status: null },
    { id: 'weather-canvas', handler: null, status: null },
    { id: 'na-indicator', handler: null, status: null }
  ],
  'Settings Categories': [
    { category: 'general', handler: null, status: null },
    { category: 'privacy', handler: null, status: null },
    { category: 'appearance', handler: null, status: null },
    { category: 'performance', handler: null, status: null },
    { category: 'downloads', handler: null, status: null },
    { category: 'experimental', handler: null, status: null },
    { category: 'ai-orchestrator', handler: null, status: null }
  ]
};

console.log('Checking HTML elements and event handlers...\n');

const results = {
  wired: [],
  partial: [],
  missing: []
};

// Check each feature category
for (const [category, items] of Object.entries(features)) {
  console.log(`\n📁 ${category}:`);
  
  for (const item of items) {
    let selector = item.id ? `id="${item.id}"` : 
                   item.class ? `class="${item.class}"` :
                   item.category ? `data-category="${item.category}"` : '';
    
    // Check if element exists in HTML
    const elementExists = browserHTML.includes(selector);
    
    if (!elementExists) {
      results.missing.push(`${category}/${item.id || item.class || item.category}`);
      console.log(`  ❌ ${item.id || item.class || item.category} - NOT IN HTML`);
      continue;
    }
    
    // Check if handler exists
    if (item.handler) {
      // Check in browser.html script section
      const handlerInHTML = browserHTML.includes(item.handler);
      // Check in main.js
      const handlerInMain = mainJS.includes(item.handler);
      
      // Check for event listener
      const eventPattern = new RegExp(`(addEventListener|onclick|on\\w+).*${item.id || item.class}`, 'i');
      const hasEventListener = eventPattern.test(browserHTML) || eventPattern.test(mainJS);
      
      if (handlerInHTML || handlerInMain) {
        if (hasEventListener) {
          results.wired.push(`${category}/${item.id || item.class}`);
          console.log(`  ✅ ${item.id || item.class} - FULLY WIRED`);
        } else {
          results.partial.push(`${category}/${item.id || item.class}`);
          console.log(`  ⚠️  ${item.id || item.class} - HANDLER EXISTS BUT NO LISTENER`);
        }
      } else {
        results.partial.push(`${category}/${item.id || item.class}`);
        console.log(`  ⚠️  ${item.id || item.class} - ELEMENT EXISTS BUT NO HANDLER`);
      }
    } else {
      // Visual elements - just check they exist
      results.wired.push(`${category}/${item.id || item.class || item.category}`);
      console.log(`  ✅ ${item.id || item.class || item.category} - EXISTS`);
    }
  }
}

// Check for IPC handlers in main.js
console.log('\n📡 IPC Handlers in main-complete.js:');
const ipcHandlers = [
  'navigate', 'go-back', 'go-forward', 'reload',
  'create-tab', 'close-tab', 'switch-tab',
  'minimize-window', 'maximize-window', 'close-window',
  'get-resource-usage', 'get-settings', 'update-settings'
];

for (const handler of ipcHandlers) {
  if (mainJS.includes(`'${handler}'`) || mainJS.includes(`"${handler}"`)) {
    console.log(`  ✅ ${handler}`);
  } else {
    console.log(`  ❌ ${handler} - MISSING`);
  }
}

// Check for AI integration
console.log('\n🤖 AI Integration Status:');
const aiFiles = [
  'ai-orchestrator.js',
  'ai-browser-integration.js',
  'ai-orchestrator-ui.html'
];

for (const file of aiFiles) {
  const filePath = path.join(__dirname, 'src', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} - EXISTS`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 WIRING ANALYSIS SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Fully Wired: ${results.wired.length} features`);
console.log(`⚠️  Partially Wired: ${results.partial.length} features`);
console.log(`❌ Missing: ${results.missing.length} features`);

// Specific recommendations
console.log('\n🔧 SPECIFIC FIXES NEEDED:');

const fixes = [];

// Check specific known issues
if (!browserHTML.includes('toggleBookmark')) {
  fixes.push('1. Implement bookmark functionality (toggleBookmark method)');
}
if (!browserHTML.includes('toggleDevTools')) {
  fixes.push('2. Implement DevTools functionality (toggleDevTools method)');
}
if (!mainJS.includes('webContents.openDevTools')) {
  fixes.push('3. Add DevTools IPC handler in main-complete.js');
}
if (!browserHTML.includes('download-manager')) {
  fixes.push('4. Add download manager UI and handlers');
}
if (!browserHTML.includes('history-panel')) {
  fixes.push('5. Add history tracking and UI');
}

if (fixes.length > 0) {
  fixes.forEach(fix => console.log(`  ${fix}`));
} else {
  console.log('  ✅ All major features appear to be wired!');
}

// Performance check
console.log('\n⚡ Performance Optimizations:');
const htmlSize = (browserHTML.length / 1024).toFixed(1);
const jsSize = (mainJS.length / 1024).toFixed(1);
console.log(`  HTML Size: ${htmlSize} KB`);
console.log(`  Main JS Size: ${jsSize} KB`);
console.log(`  Total: ${(parseFloat(htmlSize) + parseFloat(jsSize)).toFixed(1)} KB`);

if (parseFloat(htmlSize) + parseFloat(jsSize) < 100) {
  console.log('  ✅ Excellent! Under 100KB total');
} else {
  console.log('  ⚠️  Consider optimization if over 100KB');
}

console.log('\n✨ Natural Asymmetry: The revolution continues!');
console.log('🦌 + 🤖 = ∞');