// Test Suite for New Natural Asymmetry Features
// Tests: Dark Mode, Keyboard Shortcuts, WebRTC Integration

const puppeteer = require('puppeteer');
const path = require('path');

console.log('🧪 Testing New Features Integration...\n');

async function testNewFeatures() {
    let browser, page;
    const results = {
        darkMode: { total: 0, passed: 0, failed: 0 },
        shortcuts: { total: 0, passed: 0, failed: 0 },
        webrtc: { total: 0, passed: 0, failed: 0 }
    };
    
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1280, height: 800 }
        });
        page = await browser.newPage();
        
        const filePath = 'file://' + path.resolve('src/browser.html');
        await page.goto(filePath);
        await page.waitForTimeout(1000);
        
        // Test 1: Dark Mode System
        console.log('🌓 Testing Dark Mode...');
        
        // Check if dark mode button exists
        results.darkMode.total++;
        const darkModeBtn = await page.$('#theme-toggle-btn');
        if (darkModeBtn) {
            console.log('  ✅ Dark mode button found');
            results.darkMode.passed++;
        } else {
            console.log('  ❌ Dark mode button not found');
            results.darkMode.failed++;
        }
        
        // Test toggle functionality
        results.darkMode.total++;
        try {
            await page.click('#theme-toggle-btn');
            await page.waitForTimeout(500);
            
            const hasLightTheme = await page.evaluate(() => {
                return document.body.classList.contains('light-theme');
            });
            
            if (hasLightTheme) {
                console.log('  ✅ Theme toggle working');
                results.darkMode.passed++;
            } else {
                console.log('  ❌ Theme toggle not working');
                results.darkMode.failed++;
            }
        } catch (e) {
            console.log('  ❌ Error toggling theme:', e.message);
            results.darkMode.failed++;
        }
        
        // Test 2: Keyboard Shortcuts
        console.log('\n⌨️ Testing Keyboard Shortcuts...');
        
        // Check if shortcuts button exists
        results.shortcuts.total++;
        const shortcutsBtn = await page.$('#shortcuts-help-btn');
        if (shortcutsBtn) {
            console.log('  ✅ Shortcuts button found');
            results.shortcuts.passed++;
        } else {
            console.log('  ❌ Shortcuts button not found');
            results.shortcuts.failed++;
        }
        
        // Test help panel toggle with ? key
        results.shortcuts.total++;
        try {
            await page.keyboard.press('Shift+/'); // ? key
            await page.waitForTimeout(500);
            
            const helpVisible = await page.evaluate(() => {
                const panel = document.getElementById('shortcuts-help-panel');
                return panel && !panel.classList.contains('hidden');
            });
            
            if (helpVisible) {
                console.log('  ✅ Help panel opens with ? key');
                results.shortcuts.passed++;
            } else {
                console.log('  ❌ Help panel not opening');
                results.shortcuts.failed++;
            }
            
            // Close help panel
            await page.keyboard.press('Escape');
        } catch (e) {
            console.log('  ❌ Error testing shortcuts:', e.message);
            results.shortcuts.failed++;
        }
        
        // Test shortcut execution
        results.shortcuts.total++;
        try {
            // Test Ctrl+L (focus address bar)
            await page.keyboard.down('Control');
            await page.keyboard.press('l');
            await page.keyboard.up('Control');
            await page.waitForTimeout(500);
            
            const urlBarFocused = await page.evaluate(() => {
                return document.activeElement?.id === 'url-bar';
            });
            
            if (urlBarFocused) {
                console.log('  ✅ Ctrl+L focuses address bar');
                results.shortcuts.passed++;
            } else {
                console.log('  ❌ Ctrl+L not working');
                results.shortcuts.failed++;
            }
        } catch (e) {
            console.log('  ❌ Error testing shortcut execution:', e.message);
            results.shortcuts.failed++;
        }
        
        // Test 3: WebRTC Integration
        console.log('\n🎥 Testing WebRTC...');
        
        // Check if WebRTC button exists
        results.webrtc.total++;
        const webrtcBtn = await page.$('#webrtc-btn');
        if (webrtcBtn) {
            console.log('  ✅ WebRTC button found');
            results.webrtc.passed++;
        } else {
            console.log('  ❌ WebRTC button not found');
            results.webrtc.failed++;
        }
        
        // Test panel toggle
        results.webrtc.total++;
        try {
            await page.click('#webrtc-btn');
            await page.waitForTimeout(500);
            
            const panelVisible = await page.evaluate(() => {
                const panel = document.getElementById('webrtc-panel');
                return panel && !panel.classList.contains('hidden');
            });
            
            if (panelVisible) {
                console.log('  ✅ WebRTC panel opens');
                results.webrtc.passed++;
            } else {
                console.log('  ❌ WebRTC panel not opening');
                results.webrtc.failed++;
            }
        } catch (e) {
            console.log('  ❌ Error testing WebRTC:', e.message);
            results.webrtc.failed++;
        }
        
        // Test WebRTC controls presence
        results.webrtc.total++;
        const controls = await page.evaluate(() => {
            return {
                camera: !!document.getElementById('start-camera'),
                audio: !!document.getElementById('start-audio'),
                screen: !!document.getElementById('share-screen'),
                end: !!document.getElementById('end-call')
            };
        });
        
        if (controls.camera && controls.audio && controls.screen && controls.end) {
            console.log('  ✅ All WebRTC controls present');
            results.webrtc.passed++;
        } else {
            console.log('  ❌ Some WebRTC controls missing');
            results.webrtc.failed++;
        }
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Print results summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY\n');
    
    const categories = ['darkMode', 'shortcuts', 'webrtc'];
    const categoryNames = {
        darkMode: '🌓 Dark Mode',
        shortcuts: '⌨️ Shortcuts',
        webrtc: '🎥 WebRTC'
    };
    
    let totalTests = 0;
    let totalPassed = 0;
    
    categories.forEach(cat => {
        const r = results[cat];
        const passRate = r.total > 0 ? ((r.passed / r.total) * 100).toFixed(0) : 0;
        console.log(`${categoryNames[cat]}: ${r.passed}/${r.total} (${passRate}%)`);
        totalTests += r.total;
        totalPassed += r.passed;
    });
    
    const overallRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(0) : 0;
    console.log('\n' + '='.repeat(50));
    console.log(`✨ OVERALL: ${totalPassed}/${totalTests} tests passed (${overallRate}%)`);
    
    if (overallRate >= 80) {
        console.log('🎉 EXCELLENT! New features are working great!');
    } else if (overallRate >= 60) {
        console.log('👍 Good progress, some fixes needed');
    } else {
        console.log('⚠️ Several issues need attention');
    }
    
    // Natural Asymmetry score
    const naScore = {
        discovery: results.shortcuts.passed, // Keyboard navigation
        precision: results.darkMode.passed,   // Theme precision
        support: results.webrtc.passed        // Communication support
    };
    
    const naTotal = naScore.discovery + naScore.precision + naScore.support;
    if (naTotal > 0) {
        console.log('\n🌟 Natural Asymmetry Distribution:');
        console.log(`  Discovery: ${((naScore.discovery/naTotal)*100).toFixed(0)}%`);
        console.log(`  Precision: ${((naScore.precision/naTotal)*100).toFixed(0)}%`);
        console.log(`  Support: ${((naScore.support/naTotal)*100).toFixed(0)}%`);
    }
}

// Run tests
testNewFeatures().catch(console.error);