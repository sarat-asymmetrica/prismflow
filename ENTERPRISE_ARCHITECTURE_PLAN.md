# 🎯 PrismFlow Enterprise-Grade Architecture Plan
## Based on GPT ARC-GX Consultation

## 🎨 Vision: Minimal Chrome + Floating Overlays + Animated Tabs

### Current State (What We Have)
- ✅ Backend 95% complete
- ✅ React UI integrated but fighting with BrowserView
- ✅ Z-index positioning issues
- ❌ Panels rendered in main window DOM (wrong approach)
- ❌ No tab animations
- ❌ BrowserView bounds constantly adjusted

### Target State (Enterprise Grade)
- ✅ **Minimal chrome**: 80px top bar (tabs + address)
- ✅ **BrowserView**: Full space below chrome (no fighting)
- ✅ **Floating overlays**: Separate BrowserWindows for panels
- ✅ **Animated tabs**: Framer Motion 60fps tab strip
- ✅ **Hot-swap views**: Reuse BrowserViews, don't recreate
- ✅ **Persistent state**: Tabs saved to disk
- ✅ **MathAlive telemetry**: Auto (σ,ρ,γ,κ,λ) tuples

---

## 📋 Implementation Phases

### **Phase 1: Rollback + Minimal UI** ⚡ IMMEDIATE
**Goal:** Clean slate with minimal chrome, BrowserView takes full space

#### Tasks:
1. **Rollback BrowserWindow.tsx**
   - Remove all panel components from main window
   - Remove BookmarksPanel, HistoryPanel, DownloadsPanel
   - Keep ONLY: TabBar + NavigationBar
   - Remove z-50 wrapper, pointer-events hacks

2. **Simplify browser-stable.js BrowserView bounds**
   - Remove complex positioning logic
   - Simple bounds: `{ x: 0, y: 80, width: w, height: h - 80 }`
   - No more "155px" magic numbers

3. **Update dist-react structure**
   - Main window: Just chrome (tabs + address)
   - Prepare for overlay windows later

**Files to modify:**
- `figma_make_components/browser/BrowserWindow.tsx` - Strip down
- `browser-stable.js` - Simplify BrowserView bounds
- `figma_make_components/App.tsx` - Minimal container

**Expected outcome:**
- Clean 80px chrome at top
- BrowserView takes rest of space
- No UI cutoff issues
- Ready for overlay architecture

---

### **Phase 2: Animated Tab Strip** 🎬 NEXT
**Goal:** Replace static tabs with Framer Motion animated strip

#### Tasks:
1. **Install Framer Motion**
   ```bash
   npm install framer-motion
   ```

2. **Create TabStrip component** with animations
   - Tab create: slide in + fade in
   - Tab close: slide out + fade out + layout shift
   - Tab switch: highlight animation
   - Tab reorder: drag-and-drop (optional)

3. **Implement tab state management**
   - In-memory tab array in browser-stable.js
   - Each tab: `{ id, url, title, view }`
   - Persist to `tabs.state.json`

4. **Hot-swap BrowserView logic**
   - Don't destroy views on switch, just detach/attach
   - Cache 5 most recent views
   - Destroy only when exceeds cache limit

5. **IPC handlers for tabs**
   ```javascript
   ipcMain.handle('tabs:create', async (_e, url) => { ... });
   ipcMain.handle('tabs:activate', async (_e, id) => { ... });
   ipcMain.handle('tabs:close', async (_e, id) => { ... });
   ```

6. **Update preload bridge**
   ```javascript
   api.createTab(url)
   api.activateTab(id)
   api.closeTab(id)
   api.onTabsState(callback)
   ```

**Files to create:**
- `figma_make_components/browser/AnimatedTabStrip.tsx`
- `src/tab-manager.js` (backend tab state)
- `tabs.state.json` (persisted tabs)

**Expected outcome:**
- Buttery smooth 60fps tab animations
- Fast tab switching (no reload)
- State persists across restarts
- ARC browser vibes

---

### **Phase 3: Floating Overlay Architecture** 🎭 AFTER TABS
**Goal:** Convert all panels to separate floating BrowserWindows

#### Tasks:
1. **Create overlay-manager.js**
   - Manages lifecycle of all overlay windows
   - Creates overlays on demand (lazy)
   - Positions based on trigger button location
   - Handles show/hide with animations

2. **Create overlay windows:**

   **BookmarksOverlay:**
   - Size: 320px × (height - 80px)
   - Position: Left edge, slides in
   - Content: `dist-react/overlays/bookmarks.html`
   - Trigger: Bookmarks button OR Ctrl+B

   **HistoryOverlay:**
   - Size: 320px × (height - 80px)
   - Position: Left edge, slides in
   - Content: `dist-react/overlays/history.html`
   - Trigger: History button OR Ctrl+H
   - Mutually exclusive with bookmarks

   **DownloadsOverlay:**
   - Size: (width) × 200px
   - Position: Bottom, slides up
   - Content: `dist-react/overlays/downloads.html`
   - Trigger: Downloads button OR Ctrl+J

   **SettingsOverlay:**
   - Size: 800px × 600px
   - Position: Center, fade + scale
   - Content: `dist-react/overlays/settings.html`
   - Trigger: Settings button OR Ctrl+,

   **CommandPaletteOverlay:**
   - Size: 600px × 400px
   - Position: Top-center, slide down
   - Content: `dist-react/overlays/command-palette.html`
   - Trigger: Ctrl+K

3. **Build overlay React components**
   - Extract current panel components
   - Build as standalone apps
   - Each overlay has own entry point

4. **Update Vite config**
   ```javascript
   build: {
     rollupOptions: {
       input: {
         main: 'figma_make_components/index.html',
         bookmarks: 'figma_make_components/overlays/bookmarks.html',
         history: 'figma_make_components/overlays/history.html',
         downloads: 'figma_make_components/overlays/downloads.html',
         settings: 'figma_make_components/overlays/settings.html',
         commandPalette: 'figma_make_components/overlays/command-palette.html'
       }
     }
   }
   ```

5. **IPC handlers for overlays**
   ```javascript
   ipcMain.on('overlay:toggle', (_e, { type, bounds }) => { ... });
   ipcMain.on('overlay:hide', (_e, type) => { ... });
   ```

**Files to create:**
- `src/overlay-manager.js`
- `figma_make_components/overlays/bookmarks.html`
- `figma_make_components/overlays/BookmarksOverlay.tsx`
- (same for history, downloads, settings, command-palette)

**Expected outcome:**
- True floating panels above BrowserView
- GPU-accelerated backdrop blur
- No z-index fighting
- Opera-grade UX

---

### **Phase 4: Advanced Features** 🚀 POLISH
**Goal:** Picture-in-Picture, permissions, telemetry

#### 4A: Picture-in-Picture Thumbnails
- Offscreen WebContents for each tab
- Capture small screenshots (5fps)
- Display in tab hover preview
- Emit telemetry on paint

#### 4B: Permissions Overlay
- Intercept permission requests (mic, cam, location)
- Show floating permission prompt
- User allows/denies
- Emit telemetry on response

#### 4C: ABNP Telemetry Hooks
- Global click listener
- Read `data-protocol` attributes
- Auto-emit (σ,ρ,γ,κ,λ) tuples
- No manual telemetry calls needed

#### 4D: Browser Feature Checklist 2025
- [ ] Tabbed browsing ✅ (Phase 2)
- [ ] Address bar + omnibox ✅ (Have it)
- [ ] Overlay UI layer ✅ (Phase 3)
- [ ] Speed Dial / Home page (Add to Phase 3)
- [ ] Permissions UI ✅ (Phase 4B)
- [ ] Picture-in-Picture ✅ (Phase 4A)
- [ ] Security / sandboxing ✅ (Have it)
- [ ] Performance telemetry ✅ (Phase 4C)
- [ ] Spell-check (Chromium native)
- [ ] DevTools ✅ (Have it)
- [ ] Session restore ✅ (Phase 2)
- [ ] URL protocol handlers (Add later)
- [ ] Extensions (Future)
- [ ] Localization (Future)
- [ ] Theming ✅ (Have dark mode)
- [ ] Accessibility (Need to add)
- [ ] Offline caching (Chromium native)
- [ ] Auto update (Add later)
- [ ] User profiles (Future)

---

## 🎯 Immediate Next Steps (Phase 1)

### Step 1: Rollback UI Changes
Remove all the z-index positioning we added today.

**Files to revert:**
1. `figma_make_components/browser/BrowserWindow.tsx`
   - Remove `<div className="relative z-50 pointer-events-auto">`
   - Remove all panel components (BookmarksPanel, HistoryPanel, etc.)
   - Keep ONLY TabBar and NavigationBar
   - Remove demo toggle buttons at bottom

2. `browser-stable.js`
   - Simplify BrowserView bounds to:
     ```javascript
     tab.setBounds({
       x: 0,
       y: 80,  // Simple: just below chrome
       width: bounds.width,
       height: bounds.height - 80
     });
     ```

### Step 2: Create Minimal Chrome Component
```tsx
// figma_make_components/browser/MinimalChrome.tsx
import { AnimatedTabStrip } from './AnimatedTabStrip';
import { AddressBar } from './AddressBar';

export function MinimalChrome() {
  return (
    <div className="fixed top-0 left-0 right-0 h-20 glass-surface z-50">
      <AnimatedTabStrip />
      <AddressBar />
    </div>
  );
}
```

### Step 3: Prepare for Framer Motion
Install dependency and prepare tab state management.

---

## 📊 Success Metrics

### Phase 1 Complete When:
- ✅ UI is minimal (80px chrome only)
- ✅ BrowserView takes full space below
- ✅ No z-index issues
- ✅ No pointer-event hacks
- ✅ Clean architecture ready for overlays

### Phase 2 Complete When:
- ✅ Tab animations at 60fps
- ✅ Tab create/close/switch works smoothly
- ✅ Tabs persist across restarts
- ✅ BrowserViews hot-swap (no reload)
- ✅ Feels like ARC browser

### Phase 3 Complete When:
- ✅ All panels converted to overlays
- ✅ Overlays float above BrowserView
- ✅ Backdrop blur works perfectly
- ✅ No focus stealing
- ✅ Feels like Opera browser

### Phase 4 Complete When:
- ✅ PiP thumbnails show in tab hovers
- ✅ Permission prompts work
- ✅ Telemetry auto-emits
- ✅ 80%+ feature checklist complete

---

## 🚀 Ready to Execute

**Shall we start with Phase 1: Rollback + Minimal UI?**

This will:
1. Clean up our current mess
2. Give BrowserView full space (no more cutoff)
3. Prepare clean slate for animated tabs
4. Set foundation for overlay architecture

Then Phase 2 (animated tabs) will be a joy to implement on this clean base!

**Your call, maestro! Let's cook! 🔥**
