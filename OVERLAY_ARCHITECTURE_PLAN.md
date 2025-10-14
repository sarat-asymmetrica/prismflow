# 🎭 PrismFlow Overlay Architecture Plan
## Based on GPT Opera-Style Browser Consultation

## 🎯 Problem Statement
BrowserView is a native Chromium component that exists outside the DOM. We can't use CSS z-index to position React UI above it reliably. Fighting with the compositor causes:
- UI cutoff issues
- Pointer event conflicts
- Layering inconsistencies
- Performance overhead

## ✨ Solution: Opera-Style Floating Overlays

### Core Architecture
```
MainWindow (frame: false, transparent: true)
├── Tab Bar (minimal React UI, 44px height)
├── Navigation Bar (minimal React UI, 80px height)
├── BrowserView (native Chromium, positioned at y: 124)
└── Child Overlay Windows (separate BrowserWindows):
    ├── BookmarksOverlay (parent: MainWindow)
    ├── HistoryOverlay (parent: MainWindow)
    ├── DownloadsOverlay (parent: MainWindow)
    ├── SettingsOverlay (parent: MainWindow)
    └── CommandPaletteOverlay (parent: MainWindow)
```

## 🏗️ Window Configuration

### MainWindow
```javascript
mainWindow = new BrowserWindow({
  width: 1400,
  height: 900,
  frame: false,
  transparent: true,
  backgroundColor: '#00000000',
  webPreferences: {
    preload: path.join(__dirname, 'src', 'preload-stable.js'),
    nodeIntegration: false,
    contextIsolation: true
  }
});
```

### Overlay Window Template
```javascript
overlayWindow = new BrowserWindow({
  parent: mainWindow,              // Child of main window
  frame: false,                    // No OS chrome
  transparent: true,               // Transparent background
  show: false,                     // Hidden by default
  resizable: false,                // Fixed size
  hasShadow: true,                 // Drop shadow
  alwaysOnTop: true,              // Above BrowserView
  focusable: true,                // Can receive focus
  skipTaskbar: true,              // Don't show in taskbar
  webPreferences: {
    preload: path.join(__dirname, 'src', 'preload-overlay.js'),
    nodeIntegration: false,
    contextIsolation: true
  }
});
```

## 📐 Overlay Specifications

### 1. Bookmarks Panel
**Type:** Side panel (left)
**Dimensions:** 320px × (window height - 124px)
**Position:** (0, 124) - docked to left edge below nav bar
**Trigger:** Click bookmarks icon OR Ctrl+B
**Animation:** Slide in from left with ease-out

```javascript
bookmarksOverlay.setBounds({
  x: mainBounds.x,
  y: mainBounds.y + 124,
  width: 320,
  height: mainBounds.height - 124
});
```

### 2. History Panel
**Type:** Side panel (left)
**Dimensions:** 320px × (window height - 124px)
**Position:** (0, 124) - same as bookmarks, mutually exclusive
**Trigger:** Click history icon OR Ctrl+H
**Animation:** Slide in from left with ease-out

### 3. Downloads Panel
**Type:** Bottom panel
**Dimensions:** (window width) × 200px
**Position:** (0, window height - 200)
**Trigger:** Click downloads icon OR Ctrl+J
**Animation:** Slide up from bottom with ease-out

```javascript
downloadsOverlay.setBounds({
  x: mainBounds.x,
  y: mainBounds.y + mainBounds.height - 200,
  width: mainBounds.width,
  height: 200
});
```

### 4. Settings Modal
**Type:** Center modal
**Dimensions:** 800px × 600px
**Position:** Centered in main window
**Trigger:** Click settings icon OR Ctrl+,
**Animation:** Fade in + scale with ease-out

```javascript
settingsOverlay.setBounds({
  x: mainBounds.x + (mainBounds.width - 800) / 2,
  y: mainBounds.y + (mainBounds.height - 600) / 2,
  width: 800,
  height: 600
});
```

### 5. Command Palette
**Type:** Center dropdown
**Dimensions:** 600px × 400px
**Position:** Top-center of main window
**Trigger:** Ctrl+K
**Animation:** Slide down from top with ease-out

```javascript
commandPaletteOverlay.setBounds({
  x: mainBounds.x + (mainBounds.width - 600) / 2,
  y: mainBounds.y + 150,
  width: 600,
  height: 400
});
```

## 🎨 Styling (Glass Morphism)

All overlays use consistent glass styling:

```css
body {
  background: rgba(25, 25, 25, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45);
  color: white;
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
  padding: 16px;
}
```

## 🔌 IPC Communication

### Toggle Overlay Pattern
```javascript
// In browser-stable.js
ipcMain.on('overlay:toggle', (event, { type, bounds }) => {
  const overlay = overlays[type]; // bookmarks, history, downloads, etc.
  
  if (overlay.isVisible()) {
    overlay.hide();
  } else {
    // Position based on trigger button location
    overlay.setBounds(calculateOverlayBounds(type, bounds));
    overlay.showInactive(); // Show without stealing focus
  }
});
```

### Preload Bridge
```javascript
// In preload-stable.js
contextBridge.exposeInMainWorld('overlayAPI', {
  toggle: (type, bounds) => ipcRenderer.send('overlay:toggle', { type, bounds }),
  hide: (type) => ipcRenderer.send('overlay:hide', type),
  send: (type, channel, data) => ipcRenderer.send(`overlay:${type}:${channel}`, data)
});
```

## 🎯 Benefits

### Technical
1. **No z-index fighting** - True compositor layers
2. **GPU-accelerated** - Smooth 60fps animations
3. **Clean separation** - Each overlay is independent
4. **Focus management** - showInactive() prevents flicker
5. **Scalable** - Easy to add new overlays

### User Experience
1. **Buttery smooth** - Native-quality animations
2. **Non-intrusive** - Overlays don't steal focus
3. **Beautiful glass effects** - True backdrop blur
4. **Responsive** - Resize-safe layout
5. **Familiar** - Opera-like behavior

### Developer Experience
1. **Clean architecture** - No DOM/BrowserView conflicts
2. **Easier debugging** - Each overlay is separate window
3. **Hot reload friendly** - Reload overlay without restarting
4. **Component reuse** - Same React components in overlays
5. **Testable** - Isolated overlay logic

## 📋 Migration Checklist

### Phase 1: Setup Overlay Infrastructure
- [ ] Create `src/overlay-manager.js` to handle overlay lifecycle
- [ ] Create `src/preload-overlay.js` for overlay-specific bridge
- [ ] Update `browser-stable.js` to create overlay windows
- [ ] Add overlay IPC handlers (toggle, hide, position)

### Phase 2: Convert Panels to Overlays
- [ ] **Bookmarks Panel** → BookmarksOverlay window
  - Load `dist-react/overlays/bookmarks.html`
  - Position at left edge (320px wide)
  - Slide in animation
  
- [ ] **History Panel** → HistoryOverlay window
  - Load `dist-react/overlays/history.html`
  - Position at left edge (320px wide)
  - Mutually exclusive with bookmarks

- [ ] **Downloads Panel** → DownloadsOverlay window
  - Load `dist-react/overlays/downloads.html`
  - Position at bottom (200px tall)
  - Slide up animation

### Phase 3: Convert Modals to Overlays
- [ ] **Settings Page** → SettingsOverlay window
  - Load `dist-react/overlays/settings.html`
  - Center modal (800×600)
  - Fade + scale animation

- [ ] **Command Palette** → CommandPaletteOverlay window
  - Load `dist-react/overlays/command-palette.html`
  - Top-center dropdown (600×400)
  - Slide down animation

### Phase 4: Update React UI
- [ ] Simplify BrowserWindow.tsx to minimal UI
- [ ] Create separate overlay components:
  - `overlays/BookmarksOverlay.tsx`
  - `overlays/HistoryOverlay.tsx`
  - `overlays/DownloadsOverlay.tsx`
  - `overlays/SettingsOverlay.tsx`
  - `overlays/CommandPaletteOverlay.tsx`

- [ ] Update Vite config to build multiple entry points
- [ ] Add overlay-specific styles with glass morphism

### Phase 5: Polish & Optimization
- [ ] Add keyboard shortcuts (Esc to close, etc.)
- [ ] Add resize handlers for all overlays
- [ ] Add animation timing (180ms ease-out)
- [ ] Test focus management
- [ ] Test on all platforms (Windows, macOS, Linux)

## 🚀 Expected Outcomes

### Before (Current State)
❌ UI cutoff by BrowserView
❌ Z-index fighting
❌ Pointer event conflicts
❌ Performance overhead from React rendering

### After (Overlay Architecture)
✅ Clean separation of layers
✅ Buttery smooth 60fps animations
✅ True glass morphism effects
✅ No focus stealing
✅ Opera-grade UX quality
✅ Scalable architecture

## 🎓 Learning from Opera

Opera's browser uses this exact pattern:
1. **Flow/Sync Panel** - Side overlay (exactly like our bookmarks)
2. **Speed Dial** - Center overlay (like our command palette)
3. **Downloads** - Bottom overlay (exactly like ours)
4. **Settings** - Full overlay (modal like ours)

They don't fight with Chromium's compositor - they work *with* it by using separate overlay windows. This is the **correct** way to build a modern browser UI.

## 🔮 Future Enhancements

Once overlays are working:
1. **Tab strip overlay** - Thumbnail previews on hover
2. **Site permissions overlay** - Mic/cam/location per origin
3. **Extensions panel overlay** - Manage installed extensions
4. **Telemetry overlay** - Real-time performance metrics
5. **Reading mode overlay** - Distraction-free article view

## 📖 Reference

Based on GPT consultation document: `GPT_BROWSERVIEW_CONSULT.md`
- Opera-style architecture
- Transparent overlay windows
- GPU compositor harmony
- showInactive() focus management
- Backdrop blur effects

---

**Next Step:** Create `overlay-manager.js` and start converting panels to overlays!
