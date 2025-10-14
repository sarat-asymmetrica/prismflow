# 🧪 Option A Features - Manual Test Plan

**Test Date**: October 15, 2025  
**Browser Status**: Running  
**Backend**: 95% Complete

---

## ✅ Test 1: Settings Persistence

### Steps:
1. **Open browser** ✅ (Running now!)
2. **Open DevTools** - Press F12
3. **Run in console**:
   ```javascript
   // Save a setting
   await electronAPI.saveSettings({ darkMode: true, homepage: 'https://duckduckgo.com' });
   
   // Check it saved
   const settings = await electronAPI.getSettings();
   console.log('Settings:', settings);
   ```
4. **Close browser completely**
5. **Restart browser**
6. **Open DevTools again**
7. **Run in console**:
   ```javascript
   // Check if settings persisted
   const settings = await electronAPI.getSettings();
   console.log('Settings after restart:', settings);
   // Should show: darkMode: true, homepage: 'https://duckduckgo.com'
   ```

### Expected Results:
- ✅ Settings save immediately
- ✅ Settings persist after restart
- ✅ Console shows correct values
- ✅ File created: `C:\Users\[YourName]\AppData\Roaming\prismflow-browser\browser-data.json`

### Actual Results:
- [ ] Settings saved: ___________
- [ ] Settings persisted: ___________
- [ ] File exists: ___________

---

## ✅ Test 2: Download Management

### Steps:
1. **Navigate to a file** in the browser:
   ```
   https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
   ```
   OR
   ```
   https://speed.hetzner.de/100MB.bin
   ```
2. **Click the download link**
3. **Watch for console logs**:
   ```
   📥 Download started: dummy.pdf
   ✅ Download completed: dummy.pdf
   ```
4. **Check Downloads folder**:
   - Windows: `C:\Users\[YourName]\Downloads\`
   - File should appear: `dummy.pdf` or `100MB.bin`

### Testing Download Controls:
5. **Open DevTools** (F12)
6. **Run in console**:
   ```javascript
   // Get all downloads
   const downloads = await electronAPI.getDownloads();
   console.log('Downloads:', downloads);
   
   // Listen for download events
   electronAPI.onDownloadStarted((dl) => {
     console.log('Download started:', dl.filename);
   });
   
   electronAPI.onDownloadUpdated((dl) => {
     console.log(`Progress: ${dl.progress}% - ${dl.state}`);
   });
   ```
7. **Download another file**
8. **Watch console for progress updates**

### Testing Pause/Resume/Cancel:
9. **Start a large download** (100MB file)
10. **In console**:
    ```javascript
    const downloads = await electronAPI.getDownloads();
    const dlId = downloads[0].id; // Get first download ID
    
    // Pause
    await electronAPI.pauseDownload(dlId);
    
    // Resume
    await electronAPI.resumeDownload(dlId);
    
    // Cancel
    await electronAPI.cancelDownload(dlId);
    ```

### Expected Results:
- ✅ File downloads to Downloads folder
- ✅ Console shows progress logs
- ✅ Progress goes from 0% to 100%
- ✅ State changes: starting → progressing → completed
- ✅ Pause/resume/cancel work (if supported by server)
- ✅ Multiple downloads work simultaneously

### Actual Results:
- [ ] File downloaded: ___________
- [ ] Progress tracked: ___________
- [ ] Console logs correct: ___________
- [ ] Controls work: ___________

---

## ✅ Test 3: Find in Page

### Steps:
1. **Navigate to a content-rich page**:
   ```
   https://www.wikipedia.org
   ```
   OR
   ```
   https://news.ycombinator.com
   ```

2. **Open DevTools** (F12)

3. **Test basic search**:
   ```javascript
   // Search for a word
   await electronAPI.findInPage('the', { forward: true });
   
   // Listen for results
   electronAPI.onFindResult((data) => {
     console.log(`Found ${data.result.matches} matches`);
     console.log(`Currently at match ${data.result.activeMatchOrdinal}`);
   });
   ```

4. **Visual check**:
   - Text should be **highlighted in yellow** on page
   - Current match should be **highlighted in orange**

5. **Test navigation**:
   ```javascript
   // Next match
   await electronAPI.findInPage('the', { forward: true, findNext: true });
   
   // Previous match
   await electronAPI.findInPage('the', { forward: false, findNext: true });
   ```

6. **Test case sensitivity**:
   ```javascript
   // Case-sensitive search
   await electronAPI.findInPage('The', { forward: true, matchCase: true });
   ```

7. **Clear search**:
   ```javascript
   // Clear highlights
   await electronAPI.stopFindInPage('clearSelection');
   ```

### Expected Results:
- ✅ Matching text highlights on page (yellow)
- ✅ Active match highlighted differently (orange)
- ✅ Console shows correct match count
- ✅ Next/Previous navigation works
- ✅ Case-sensitive option works
- ✅ Clear removes all highlights
- ✅ Works on different pages/tabs

### Actual Results:
- [ ] Text highlighted: ___________
- [ ] Match count correct: ___________
- [ ] Navigation works: ___________
- [ ] Clear works: ___________

---

## 🎯 Quick Integration Test (All Features)

### Comprehensive Test Flow:
```javascript
// In DevTools console (F12):

// 1. Test Settings
console.log('=== SETTINGS TEST ===');
await electronAPI.saveSettings({ darkMode: true });
const settings = await electronAPI.getSettings();
console.log('Settings saved:', settings.darkMode === true ? '✅' : '❌');

// 2. Test Downloads
console.log('\n=== DOWNLOADS TEST ===');
electronAPI.onDownloadStarted((dl) => {
  console.log('✅ Download started:', dl.filename);
});
electronAPI.onDownloadUpdated((dl) => {
  console.log(`Progress: ${dl.progress}%`);
});
// Now manually click a download link

// 3. Test Find in Page
console.log('\n=== FIND IN PAGE TEST ===');
await electronAPI.findInPage('test', { forward: true });
electronAPI.onFindResult((data) => {
  console.log(`✅ Found ${data.result.matches} matches`);
});
setTimeout(() => {
  electronAPI.stopFindInPage('clearSelection');
  console.log('✅ Cleared search');
}, 3000);
```

---

## 📊 Test Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Settings Persistence | ⬜ | |
| Download Management | ⬜ | |
| Find in Page | ⬜ | |
| All Features Together | ⬜ | |

---

## 🐛 Common Issues & Solutions

### Issue 1: "electronAPI is not defined"
**Solution**: Make sure you're testing in the browser window, not the BrowserView. Open DevTools on the main window (F12).

### Issue 2: Downloads not working
**Solution**: 
1. Check console for "📥 Download started" message
2. Check Downloads folder path is correct
3. Try a different download URL

### Issue 3: Find in page not highlighting
**Solution**:
1. Make sure you're on the correct tab
2. Try a different search term
3. Check console for "found-in-page" events

### Issue 4: Settings not persisting
**Solution**:
1. Check `browser-data.json` file exists in AppData
2. Make sure browser has write permissions
3. Check console for "💾 Data saved successfully"

---

## 💡 Advanced Testing (Optional)

### Test Settings Edge Cases:
```javascript
// Test partial settings update
await electronAPI.saveSettings({ darkMode: true });
await electronAPI.saveSettings({ homepage: 'https://google.com' });
const s = await electronAPI.getSettings();
// Both should persist: darkMode AND homepage
console.log('Partial update test:', s.darkMode && s.homepage ? '✅' : '❌');
```

### Test Download Edge Cases:
```javascript
// Test multiple simultaneous downloads
// Navigate to:
// https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
// Then in new tab:
// https://speed.hetzner.de/1MB.bin
// Both should download simultaneously
```

### Test Find Edge Cases:
```javascript
// Test no matches
await electronAPI.findInPage('qwertyzxcvbnm123456789', { forward: true });
// Should return 0 matches

// Test special characters
await electronAPI.findInPage('hello@example.com', { forward: true });

// Test across tabs
// Create new tab, search in each tab - should work independently
```

---

## ✅ Test Completion Checklist

- [ ] Settings save and load correctly
- [ ] Settings persist after restart
- [ ] Files download to Downloads folder
- [ ] Download progress shows in console
- [ ] Download controls work (pause/resume/cancel)
- [ ] Find in page highlights text correctly
- [ ] Find navigation works (next/previous)
- [ ] Find clear removes highlights
- [ ] All features work together without conflicts
- [ ] No console errors (except harmless autofill warnings)

---

## 🎉 When All Tests Pass

**You're ready to integrate with the Figma-generated UI! 🚀**

The backend is solid, all critical features work, and you have a professional-grade browser foundation.

---

*Test Plan for Option A Implementation*  
*Williams √t × log₂(t) | Tesla 4.909 Hz | Natural Asymmetry 30/20/50*
