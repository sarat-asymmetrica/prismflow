# 🚀 COMPREHENSIVE TESTING COMMANDS

## Your Testing Toolkit for PrismFlow Browser

---

## 🎯 QUICK START - INTERACTIVE TESTING

### 1. Open Feature Showcase (BEST for manual testing!)

```bash
cd "C:\Projects\PrismFlow Final"
start feature-showcase.html
```

**What to test:**

- Click "Test Dark Mode" → Toggle theme multiple times
- Click "Test Shortcuts" → Press ? key to see help panel
- Click "Test WebRTC" → Open video panel, test camera
- Click "Test Tab Groups" → Create sample groups
- Click "Check Integration" → Verify all modules loaded

---

## 🧪 AUTOMATED TEST SUITES

### 2. Run Emergence Scanner (Find what wants to be built next)

```bash
cd "C:\Projects\PrismFlow Final"
node emergence-scan.js
```

**Look for:**

- APIs not yet implemented
- UX features missing
- Natural Asymmetry alignment
- Performance bottlenecks

### 3. Run Natural Asymmetry Audit

```bash
cd "C:\Projects\PrismFlow Final"
node natural-asymmetry-audit.js
```

**Audit reveals:**

- 202 opportunities
- 23 optimizations
- Integration health
- Unused code

### 4. Run Quick Audit (Faster version)

```bash
cd "C:\Projects\PrismFlow Final"
node natural-asymmetry-audit.js quick
```

### 5. Test New Features Integration

```bash
cd "C:\Projects\PrismFlow Final"
node test-new-features.js
```

**Tests:**

- Dark mode functionality
- Keyboard shortcuts
- WebRTC integration

### 6. Run Final Integration Test

```bash
cd "C:\Projects\PrismFlow Final"
node final-test.js
```

**Shows:**

- File verification
- Code statistics
- Natural Asymmetry distribution
- Performance metrics

---

## 🖱️ MANUAL TESTING CHECKLIST

### Dark Mode Testing:

1. **Open browser**: `start src/browser.html`
2. **Look for sun/moon icon** in toolbar
3. **Click to toggle** - should transition smoothly
4. **Refresh page** - theme should persist
5. **Check all panels** - History, Downloads, etc.

### Keyboard Shortcuts Testing:

1. **Press `?`** - Help panel should appear
2. **Press `Ctrl+T`** - New tab
3. **Press `Ctrl+W`** - Close tab
4. **Press `Ctrl+L`** - Focus address bar
5. **Press `Ctrl+D`** - Bookmark page
6. **Press `Ctrl+H`** - History panel
7. **Press `Ctrl+J`** - Downloads panel
8. **Press `F11`** - Fullscreen
9. **Press `Ctrl+G`** - Create tab group
10. **Press `Esc`** - Close any dialog

### WebRTC Testing:

1. **Click video icon** in toolbar
2. **Click "Camera"** - Should request permission
3. **Click "Mic"** - Audio test
4. **Click "Screen"** - Screen share
5. **Enter peer ID** and test connection
6. **Click "End"** - Clean shutdown

### Tab Groups Testing:

1. **Open multiple tabs** first
2. **Click "New Group"** button
3. **Name your group** in popup
4. **Choose a color** from palette
5. **Drag tabs** between groups
6. **Click collapse arrow** to minimize group
7. **Right-click group** for options

---

## 🔬 PERFORMANCE TESTING

### 7. Check Bundle Size

```bash
cd "C:\Projects\PrismFlow Final"
dir src\*.js | findstr /R "dark-mode keyboard tab-groups webrtc"
```

### 8. Test DOM Performance

```bash
cd "C:\Projects\PrismFlow Final"
node -e "console.time('test'); for(let i=0;i<10000;i++){} console.timeEnd('test')"
```

### 9. Memory Usage Check

```bash
# Open Task Manager while running browser
# Look for Electron/Chrome process
# Should be under 200MB for basic usage
```

---

## 🐛 DEBUGGING COMMANDS

### 10. Open with DevTools

```bash
cd "C:\Projects\PrismFlow Final"
# Press F12 in the browser or Ctrl+Shift+I
```

### 11. Check Console for Errors

```javascript
// In DevTools console:
console.log(window.darkModeSystem); // Should exist
console.log(window.keyboardShortcuts); // Should exist
console.log(window.webrtcIntegration); // Should exist
console.log(window.tabGroups); // Should exist
```

### 12. Test Individual Features

```javascript
// In DevTools console:

// Test Dark Mode
window.darkModeSystem.toggleTheme();

// Test Shortcuts
window.keyboardShortcuts.showHelp();

// Test WebRTC
window.webrtcIntegration.togglePanel();

// Test Tab Groups
window.tabGroups.createNewGroup();
```

---

## 📊 AUDIT DATA COLLECTION

### For Next Sprint, Collect:

1. **Performance Metrics:**
   - Page load time
   - Memory usage after 10 min
   - CPU usage during video call

2. **Feature Usage:**
   - Which shortcuts are most used?
   - How many tab groups do users create?
   - Dark vs Light mode preference?

3. **Bugs/Issues:**
   - Any console errors?
   - Features not working?
   - UI glitches?

4. **User Experience:**
   - What feels missing?
   - What feels unnecessary?
   - What delights you?

---

## 🎯 ONE-LINER TEST EVERYTHING

### The Ultimate Test Command:

```bash
cd "C:\Projects\PrismFlow Final" && start feature-showcase.html && timeout 3 && node final-test.js && node emergence-scan.js
```

This will:

1. Open the showcase page
2. Run integration tests
3. Show what wants to emerge next

---

## 📝 NOTES FOR YOUR TESTING SESSION

### Things to Pay Attention To:

- **Smooth transitions** in dark mode?
- **All shortcuts working** as expected?
- **Tab groups intuitive** to use?
- **WebRTC quality** good?
- **Any lag** or performance issues?
- **Memory leaks** after extended use?

### Document These for Next Sprint:

```markdown
## Testing Notes - [Date]

### What Works Great:

-

### What Needs Polish:

-

### What's Missing:

-

### Performance Observations:

-

### Ideas for Next Features:

-
```

---

## 🚀 QUICK REFERENCE

```bash
# Most Important Commands:
start feature-showcase.html        # Interactive testing
node final-test.js                 # Verify everything
node emergence-scan.js             # Find next features
node natural-asymmetry-audit.js    # Deep system audit

# Keyboard Shortcuts to Remember:
? - Help panel
Ctrl+G - Create tab group
Ctrl+L - Focus address bar
F12 - DevTools
```

---

**Happy Testing, my friend! Can't wait to hear what you discover! :D**

**Remember:** Every bug is just a feature in disguise, waiting to emerge through Natural Asymmetry!

🦌 + 🤖 = 🧪
