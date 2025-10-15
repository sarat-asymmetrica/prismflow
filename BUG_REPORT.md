# 🐛 Bug Report - Production Testing Session

**Date:** October 15, 2025  
**Session:** Pre-LEGENDARY Commit Testing  
**Goal:** Find and fix ALL bugs before final commit

---

## 🔴 Critical Issues (Breaks Core Functionality)

### BUG-001: Navigation Buttons API Mismatch
**Status:** ✅ FIXED  
**Severity:** High  
**Component:** MinimalChrome.tsx  

**Description:**  
Navigation bar was calling `electronAPI.goBack(tabId)`, `electronAPI.goForward(tabId)`, and `electronAPI.reloadTab(tabId)` but the backend handlers don't accept tabId parameters - they operate on the active tab.

**Steps to Reproduce:**
1. Load page with history
2. Click back button
3. TypeScript error in console (wrong parameters)

**Expected Behavior:**  
Back/Forward/Reload buttons work on active tab

**Actual Behavior:**  
Functions called with incorrect parameters

**Fix Applied:**
- Changed `goBack(tabId)` → `goBack()`
- Changed `goForward(tabId)` → `goForward()`
- Changed `reloadTab(tabId)` → `reload()`

**Files Modified:**
- `figma_make_components/browser/MinimalChrome.tsx`

---

### BUG-002: reloadTab Function Missing
**Status:** ⏳ NEEDS FIX  
**Severity:** Medium  
**Component:** TabBar context menu  

**Description:**  
TabBar context menu has "Refresh Tab" option that calls `onRefreshTab(tabId)`, but there's no backend handler for per-tab reload. The `handleRefreshTab` function in MinimalChrome calls `electronAPI.reloadTab(tabId)` which doesn't exist.

**Steps to Reproduce:**
1. Right-click on tab
2. Click "Refresh Tab"
3. Function not found error

**Expected Behavior:**  
Right-click context menu can reload specific tab

**Actual Behavior:**  
Function doesn't exist

**Proposed Fix:**
Either:
1. Remove per-tab reload from context menu (use main reload button)
2. Add backend handler for `reload-tab` that takes tabId
3. Make context menu switch to tab first, then call reload()

**Recommendation:** Option 3 - Keep UI simple, switch then reload

---

### BUG-003: Tab State Not Updating
**Status:** ⏳ NEEDS INVESTIGATION  
**Severity:** Medium  
**Component:** Tab management  

**Description:**  
When navigating in a tab, the tab's `canGoBack` and `canGoForward` states might not update in the UI. The backend sends `navigation-update` events but the frontend might not be listening.

**Steps to Reproduce:**
1. Navigate to page A
2. Navigate to page B
3. Check if back button becomes enabled
4. Back button might still be disabled

**Expected Behavior:**  
Back/Forward button states update immediately when navigation happens

**Actual Behavior:**  
Button states might be stale

**Needs Investigation:**
- Check if `navigation-update` event listener is set up
- Check if tab state is being updated in MinimalChrome
- Check if backend is correctly calculating canGoBack/canGoForward

---

## ⚠️ Medium Priority Issues (Works But Not Ideal)

### BUG-004: Bookmark Star Icon Not Updating
**Status:** ⏳ NEEDS FIX  
**Severity:** Low  
**Component:** NavigationBar  

**Description:**  
The bookmark star icon is always shown as un-bookmarked (`isBookmarked={false}` hardcoded in MinimalChrome).

**Steps to Reproduce:**
1. Add bookmark
2. Navigate to bookmarked page
3. Star icon doesn't fill

**Expected Behavior:**  
Star icon should be filled when current page is bookmarked

**Actual Behavior:**  
Star icon never fills (always empty)

**Fix Needed:**
- Check if current URL is in bookmarks list
- Update `isBookmarked` prop dynamically
- Listen for bookmark add/remove events

---

### BUG-005: Tab Title Not Updating
**Status:** ⏳ NEEDS INVESTIGATION  
**Severity:** Low  
**Component:** Tab management  

**Description:**  
Tab titles might not update when page loads. Backend sends `title-update` events but frontend might not be listening.

**Steps to Reproduce:**
1. Create new tab
2. Navigate to page
3. Tab still shows "Loading..." or old title

**Expected Behavior:**  
Tab title updates to page title

**Actual Behavior:**  
Tab title might be stale

**Needs Investigation:**
- Check if `title-update` event listener exists
- Check if tab state is being updated

---

### BUG-006: URL Bar Not Syncing
**Status:** ⏳ NEEDS INVESTIGATION  
**Severity:** Medium  
**Component:** NavigationBar  

**Description:**  
When navigating via links (not address bar), the URL bar might not update to show current URL.

**Steps to Reproduce:**
1. Navigate to Google
2. Click a link
3. URL bar might still show old URL

**Expected Behavior:**  
URL bar always shows current page URL

**Actual Behavior:**  
URL bar might be out of sync

**Fix Needed:**
- Listen for `navigation-update` events
- Update `currentUrl` state when navigation happens
- Update URL bar input value

---

## 💡 Feature Gaps (Not Implemented Yet)

### FEATURE-001: Bookmark Management
**Status:** ⏳ TODO  
**Priority:** High  

**Missing:**
- Add bookmark button doesn't actually add bookmarks
- Need to implement actual bookmark add/remove logic
- Need to check if page is bookmarked
- Need to show visual feedback when bookmark added

---

### FEATURE-002: Download Management
**Status:** ⏳ TODO  
**Priority:** Medium  

**Missing:**
- Download overlay shows mock data
- Need to hook up real download events
- Need to implement pause/resume/cancel
- Need to implement open file / show in folder

---

### FEATURE-003: Tab Favicon
**Status:** ⏳ TODO  
**Priority:** Low  

**Missing:**
- Tab favicon always empty
- Need to get favicon from page
- Need to update tab state with favicon URL

---

### FEATURE-004: Window Controls
**Status:** ⏳ NEEDS TESTING  
**Priority:** High  

**Missing:**
- Minimize/Maximize/Close buttons need testing
- Drag to move window needs testing (frameless window)

---

## 📋 Testing TODO List

### Must Test Before Commit:
- [ ] Tab creation (Ctrl+T)
- [ ] Tab closing (Ctrl+W, X button)
- [ ] Tab switching (click tabs)
- [ ] Back button (enabled/disabled states)
- [ ] Forward button (enabled/disabled states)
- [ ] Reload button
- [ ] URL bar navigation
- [ ] Bookmark toggle (once implemented)
- [ ] Overlays (Bookmarks, History, Downloads, Settings, Command Palette)
- [ ] Keyboard shortcuts (all of them)
- [ ] Window controls (min/max/close)
- [ ] Multiple tabs (3-5 tabs)
- [ ] Memory usage (no leaks)

---

## 🎯 Fix Priority Order

1. **HIGH:** Fix navigation button states (BUG-001) ✅ DONE
2. **HIGH:** Fix tab state updates (BUG-003)
3. **HIGH:** Fix URL bar syncing (BUG-006)
4. **MEDIUM:** Fix reloadTab context menu (BUG-002)
5. **MEDIUM:** Add bookmark functionality (FEATURE-001)
6. **LOW:** Fix bookmark star icon (BUG-004)
7. **LOW:** Fix tab title updates (BUG-005)

---

**Next Action:** Fix tab state updates and event listeners!
