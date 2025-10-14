// Test Tab Switching Functionality
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

async function testTabSwitching() {
    console.log('🔬 Testing Tab Switching in PrismFlow Browser...\n');
    
    // Start Electron app
    console.log('Starting browser...');
    const electronProcess = spawn('npm', ['start'], {
        cwd: path.resolve(__dirname),
        shell: true,
        detached: false
    });
    
    // Give browser time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox'],
            defaultViewport: { width: 1280, height: 800 }
        });
        
        const page = await browser.newPage();
        await page.goto('file://' + path.resolve(__dirname, 'src/browser.html'));
        
        console.log('✅ Browser loaded\n');
        
        // Test 1: Create first tab
        console.log('Test 1: Creating first tab...');
        await page.click('.new-tab');
        await page.waitForTimeout(1000);
        
        const tabs1 = await page.$$('.tab');
        console.log(`  Tabs count: ${tabs1.length}`);
        
        // Test 2: Create second tab
        console.log('\nTest 2: Creating second tab...');
        await page.click('.new-tab');
        await page.waitForTimeout(1000);
        
        const tabs2 = await page.$$('.tab');
        console.log(`  Tabs count: ${tabs2.length}`);
        
        // Test 3: Switch to first tab
        console.log('\nTest 3: Switching to first tab...');
        if (tabs2.length >= 2) {
            // Get tab IDs
            const firstTabId = await page.$eval('.tab:first-child', el => el.dataset.tabId);
            const secondTabId = await page.$eval('.tab:nth-child(2)', el => el.dataset.tabId);
            
            console.log(`  First tab ID: ${firstTabId}`);
            console.log(`  Second tab ID: ${secondTabId}`);
            
            // Click first tab
            await page.click('.tab:first-child');
            await page.waitForTimeout(500);
            
            // Check active state
            const firstActive = await page.$eval('.tab:first-child', el => 
                el.classList.contains('active')
            );
            console.log(`  First tab active: ${firstActive}`);
            
            // Test 4: Switch to second tab
            console.log('\nTest 4: Switching to second tab...');
            await page.click('.tab:nth-child(2)');
            await page.waitForTimeout(500);
            
            const secondActive = await page.$eval('.tab:nth-child(2)', el => 
                el.classList.contains('active')
            );
            console.log(`  Second tab active: ${secondActive}`);
            
            // Test 5: Navigate in each tab
            console.log('\nTest 5: Testing navigation in tabs...');
            
            // Navigate in current tab
            await page.click('#url-bar', { clickCount: 3 });
            await page.type('#url-bar', 'https://www.example.com');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // Switch back to first tab
            await page.click('.tab:first-child');
            await page.waitForTimeout(500);
            
            // Check URL bar changed
            const urlBarValue = await page.$eval('#url-bar', el => el.value);
            console.log(`  URL bar after switch: ${urlBarValue}`);
            
            // Results
            console.log('\n' + '='.repeat(50));
            console.log('📊 TEST RESULTS:');
            console.log('='.repeat(50));
            
            if (tabs2.length >= 2 && firstActive && secondActive) {
                console.log('✅ Tab switching is WORKING!');
                console.log('  - Multiple tabs created');
                console.log('  - Tabs switch on click');
                console.log('  - Active state updates correctly');
            } else {
                console.log('❌ Tab switching needs fixes:');
                if (tabs2.length < 2) console.log('  - Tab creation not working');
                if (!firstActive) console.log('  - First tab not activating');
                if (!secondActive) console.log('  - Second tab not activating');
            }
        }
        
        console.log('\nKeeping browser open for 10 seconds for manual testing...');
        await page.waitForTimeout(10000);
        
        await browser.close();
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        // Kill Electron
        electronProcess.kill();
        console.log('\n✅ Test complete!');
    }
}

testTabSwitching().catch(console.error);