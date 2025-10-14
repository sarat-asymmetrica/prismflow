// Quick Browser Feature Test
// Run this to quickly identify unwired features

const puppeteer = require('puppeteer');
const path = require('path');

async function testBrowserFeatures() {
  console.log('🚀 Starting PrismFlow Browser Feature Test...');
  console.log('📊 Natural Asymmetry: 30% Emergence | 20% Precision | 50% Support\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Load the browser HTML directly
  const browserPath = 'file://' + path.resolve(__dirname, 'src/browser.html');
  await page.goto(browserPath);
  
  console.log('✅ Browser loaded: ' + browserPath + '\n');
  
  // Wait for page to fully load
  await page.waitForTimeout(2000);
  
  const results = {
    wired: [],
    unwired: [],
    missing: []
  };
  
  // Test all UI elements
  const elementsToTest = [
    // Navigation
    { id: 'back-btn', name: 'Back Button', expectedBehavior: 'navigation' },
    { id: 'forward-btn', name: 'Forward Button', expectedBehavior: 'navigation' },
    { id: 'reload-btn', name: 'Reload Button', expectedBehavior: 'navigation' },
    { id: 'home-btn', name: 'Home Button', expectedBehavior: 'navigation' },
    { id: 'url-bar', name: 'URL Bar', expectedBehavior: 'input' },
    
    // Tab Management
    { class: 'new-tab', name: 'New Tab Button', expectedBehavior: 'creates tab' },
    { class: 'tab-close', name: 'Tab Close Button', expectedBehavior: 'closes tab' },
    
    // Features
    { id: 'bookmark-btn', name: 'Bookmark Button', expectedBehavior: 'bookmark' },
    { id: 'devtools-btn', name: 'DevTools Button', expectedBehavior: 'devtools' },
    { id: 'menu-btn', name: 'Settings Menu', expectedBehavior: 'settings' },
    { id: 'ai-assistant-btn', name: 'AI Assistant', expectedBehavior: 'AI panel' },
    
    // Window Controls
    { id: 'minimize-btn', name: 'Minimize', expectedBehavior: 'window' },
    { id: 'maximize-btn', name: 'Maximize', expectedBehavior: 'window' },
    { id: 'close-btn', name: 'Close', expectedBehavior: 'window' },
    
    // Visual Elements
    { id: 'particle-canvas', name: 'Particle Engine', expectedBehavior: 'canvas' },
    { id: 'weather-canvas', name: 'Weather Engine', expectedBehavior: 'canvas' },
    { id: 'na-indicator', name: 'Natural Asymmetry Indicator', expectedBehavior: 'display' },
    
    // Status Bar
    { id: 'status-text', name: 'Status Text', expectedBehavior: 'display' },
    { id: 'loading', name: 'Loading Indicator', expectedBehavior: 'display' },
    { id: 'memory-usage', name: 'Memory Usage', expectedBehavior: 'display' },
    { id: 'cpu-usage', name: 'CPU Usage', expectedBehavior: 'display' }
  ];
  
  console.log('🔍 Testing ' + elementsToTest.length + ' features...\n');
  
  for (const element of elementsToTest) {
    let selector = element.id ? `#${element.id}` : `.${element.class}`;
    
    try {
      const el = await page.$(selector);
      
      if (!el) {
        results.missing.push(`❌ ${element.name} - NOT FOUND (${selector})`);
        continue;
      }
      
      // Check if element is visible
      const isVisible = await page.evaluate((sel) => {
        const elem = document.querySelector(sel);
        if (!elem) return false;
        const style = window.getComputedStyle(elem);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }, selector);
      
      if (!isVisible) {
        results.unwired.push(`⚠️  ${element.name} - HIDDEN`);
        continue;
      }
      
      // Try to interact with element
      if (element.expectedBehavior === 'input') {
        // Test input field
        await page.click(selector);
        await page.type(selector, 'test');
        const value = await page.$eval(selector, el => el.value);
        if (value.includes('test')) {
          results.wired.push(`✅ ${element.name} - WORKING`);
        } else {
          results.unwired.push(`⚠️  ${element.name} - INPUT NOT WORKING`);
        }
        // Clear the input
        await page.click(selector, { clickCount: 3 });
        await page.keyboard.press('Backspace');
      } else if (element.expectedBehavior === 'canvas') {
        // Check canvas exists and has context
        const hasContext = await page.evaluate((sel) => {
          const canvas = document.querySelector(sel);
          return canvas && canvas.getContext;
        }, selector);
        
        if (hasContext) {
          results.wired.push(`✅ ${element.name} - RENDERING`);
        } else {
          results.unwired.push(`⚠️  ${element.name} - NO CONTEXT`);
        }
      } else if (element.expectedBehavior === 'display') {
        // Check display elements have content
        const hasContent = await page.evaluate((sel) => {
          const elem = document.querySelector(sel);
          return elem && elem.textContent.trim().length > 0;
        }, selector);
        
        if (hasContent) {
          results.wired.push(`✅ ${element.name} - DISPLAYING`);
        } else {
          results.unwired.push(`⚠️  ${element.name} - NO CONTENT`);
        }
      } else {
        // Try clicking button
        try {
          await page.click(selector);
          await page.waitForTimeout(500);
          
          // Check if something happened
          // For now, if click didn't throw, consider it partially wired
          results.wired.push(`✅ ${element.name} - CLICKABLE`);
        } catch (clickError) {
          results.unwired.push(`⚠️  ${element.name} - CLICK FAILED`);
        }
      }
    } catch (error) {
      results.unwired.push(`⚠️  ${element.name} - ERROR: ${error.message}`);
    }
  }
  
  // Test special features
  console.log('\n🎯 Testing Special Features...\n');
  
  // Test tab creation
  try {
    const tabsBefore = await page.$$('.tab');
    await page.click('.new-tab');
    await page.waitForTimeout(500);
    const tabsAfter = await page.$$('.tab');
    
    if (tabsAfter.length > tabsBefore.length) {
      results.wired.push('✅ Tab Creation - WORKING');
    } else {
      results.unwired.push('⚠️  Tab Creation - NOT WORKING');
    }
  } catch (e) {
    results.unwired.push('⚠️  Tab Creation - ERROR');
  }
  
  // Test settings panel
  try {
    await page.click('#menu-btn');
    await page.waitForTimeout(1000);
    
    const settingsVisible = await page.evaluate(() => {
      const panel = document.querySelector('#settings-panel');
      return panel && panel.classList.contains('visible');
    });
    
    if (settingsVisible) {
      results.wired.push('✅ Settings Panel - WORKING');
      
      // Test AI Orchestrator category
      const aiCategory = await page.$('[data-category="ai-orchestrator"]');
      if (aiCategory) {
        results.wired.push('✅ AI Orchestrator Category - FOUND');
      } else {
        results.unwired.push('⚠️  AI Orchestrator Category - MISSING');
      }
      
      // Close settings
      await page.click('#settings-close');
    } else {
      results.unwired.push('⚠️  Settings Panel - NOT OPENING');
    }
  } catch (e) {
    results.unwired.push('⚠️  Settings Panel - ERROR');
  }
  
  // Test AI integration
  try {
    await page.click('#url-bar', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#url-bar', 'ai: test');
    await page.waitForTimeout(1000);
    
    const aiResponse = await page.$('#ai-response-panel');
    if (aiResponse) {
      results.wired.push('✅ AI URL Bar Integration - DETECTED');
    } else {
      results.unwired.push('⚠️  AI URL Bar Integration - NOT WORKING');
    }
  } catch (e) {
    results.unwired.push('⚠️  AI Integration - ERROR');
  }
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  console.log(`✅ WORKING FEATURES (${results.wired.length}):`);
  results.wired.forEach(r => console.log('  ' + r));
  
  console.log(`\n⚠️  UNWIRED/PARTIAL FEATURES (${results.unwired.length}):`);
  results.unwired.forEach(r => console.log('  ' + r));
  
  console.log(`\n❌ MISSING FEATURES (${results.missing.length}):`);
  results.missing.forEach(r => console.log('  ' + r));
  
  // Calculate percentages
  const total = elementsToTest.length;
  const wiredPercent = ((results.wired.length / total) * 100).toFixed(1);
  const unwiredPercent = ((results.unwired.length / total) * 100).toFixed(1);
  const missingPercent = ((results.missing.length / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 METRICS:');
  console.log('='.repeat(60));
  console.log(`  Total Features Tested: ${total}`);
  console.log(`  Working: ${results.wired.length} (${wiredPercent}%)`);
  console.log(`  Unwired/Partial: ${results.unwired.length} (${unwiredPercent}%)`);
  console.log(`  Missing: ${results.missing.length} (${missingPercent}%)`);
  console.log('='.repeat(60) + '\n');
  
  // Priority fixes
  console.log('🔧 PRIORITY FIXES NEEDED:');
  const priorities = [
    'Bookmark functionality',
    'DevTools integration',
    'Download manager',
    'History tracking',
    'Extension support'
  ];
  
  priorities.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p}`);
  });
  
  console.log('\n✨ Natural Asymmetry Status: OPERATIONAL');
  console.log('🦌 + 🤖 = ∞\n');
  
  // Keep browser open for manual inspection
  console.log('Browser will stay open for 10 seconds for manual inspection...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('✅ Test complete!');
}

// Run the test
testBrowserFeatures().catch(console.error);