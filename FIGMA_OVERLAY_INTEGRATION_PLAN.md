# 🎨 Figma UI Integration with Overlay Architecture
## Keeping the Beautiful UI, Proper Architecture

## 🎯 Goal
Integrate the gorgeous Figma Make components as floating overlay windows (Opera-style) instead of fighting with BrowserView in the DOM.

## 📋 Strategy

### Main Window (Minimal Chrome)
**Keep in main window:**
- ✅ TabBar (animated, with window controls)
- ✅ NavigationBar (address bar, back/forward)
- ✅ GreyBackground (subtle gradient)
- ✅ LoadingProgress (top progress bar)

**Remove from main window:**
- ❌ BookmarksPanel
- ❌ HistoryPanel
- ❌ DownloadsPanel
- ❌ SettingsPage
- ❌ CommandPalette
- ❌ SessionManager
- ❌ ReadingMode

### Overlay Windows (Floating Panels)
**Convert to separate BrowserWindows:**
- 🎭 BookmarksOverlay (left panel, 320px wide)
- 🎭 HistoryOverlay (left panel, 320px wide)
- 🎭 DownloadsOverlay (bottom panel, 200px tall)
- 🎭 SettingsOverlay (center modal, 800×600)
- 🎭 CommandPaletteOverlay (top-center, 600×400)
- 🎭 SessionManagerOverlay (center modal, 700×500)
- 🎭 ReadingModeOverlay (full screen overlay)

## 🏗️ Implementation Plan

### Phase 2A: Keep Main Window UI Beautiful ✅
**Update MinimalChrome to use Figma components:**

```tsx
// MinimalChrome.tsx
import { TabBar } from './TabBar';  // ✅ Keep this Figma component
import { NavigationBar } from './NavigationBar';  // ✅ Keep this Figma component
import { GreyBackground } from './GreyBackground';  // ✅ Keep this
import { LoadingProgress } from './LoadingProgress';  // ✅ Keep this

export function MinimalChrome() {
  return (
    <>
      <GreyBackground isDark={true} />
      <LoadingProgress isLoading={isLoading} />
      
      <div className="fixed top-0 left-0 right-0 z-50">
        <TabBar ... />
        <NavigationBar ... />
      </div>
    </>
  );
}
```

### Phase 2B: Create Overlay Entry Points
**Create separate HTML entry points for each overlay:**

```
figma_make_components/
├── index.html (main window)
├── overlays/
│   ├── bookmarks.html
│   ├── history.html
│   ├── downloads.html
│   ├── settings.html
│   ├── command-palette.html
│   ├── session-manager.html
│   └── reading-mode.html
```

### Phase 2C: Create Overlay Components
**Extract and adapt Figma components for overlays:**

```tsx
// overlays/BookmarksOverlay.tsx
import { BookmarksPanel } from '../browser/BookmarksPanel';
import { electronAPI } from '../electron-api';

export function BookmarksOverlay() {
  const [bookmarks, setBookmarks] = useState([]);
  
  useEffect(() => {
    electronAPI.getBookmarks().then(setBookmarks);
  }, []);
  
  return (
    <div className="h-screen overflow-hidden glass-overlay">
      <BookmarksPanel
        bookmarks={bookmarks}
        onAddBookmark={...}
        onRemoveBookmark={...}
        onClose={() => electronAPI.closeOverlay('bookmarks')}
      />
    </div>
  );
}
```

### Phase 2D: Update Vite Config
**Build multiple entry points:**

```javascript
// vite.config.mjs
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'figma_make_components/index.html'),
        bookmarks: resolve(__dirname, 'figma_make_components/overlays/bookmarks.html'),
        history: resolve(__dirname, 'figma_make_components/overlays/history.html'),
        downloads: resolve(__dirname, 'figma_make_components/overlays/downloads.html'),
        settings: resolve(__dirname, 'figma_make_components/overlays/settings.html'),
        commandPalette: resolve(__dirname, 'figma_make_components/overlays/command-palette.html'),
        sessionManager: resolve(__dirname, 'figma_make_components/overlays/session-manager.html'),
        readingMode: resolve(__dirname, 'figma_make_components/overlays/reading-mode.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
```

### Phase 2E: Create Overlay Manager
**Handle overlay lifecycle in browser-stable.js:**

```javascript
// src/overlay-manager.js
const overlays = {};

function createOverlay(type, htmlPath) {
  if (overlays[type]) return overlays[type];
  
  const overlay = new BrowserWindow({
    parent: mainWindow,
    frame: false,
    transparent: true,
    show: false,
    resizable: type === 'settings' || type === 'reading-mode',
    hasShadow: true,
    alwaysOnTop: true,
    focusable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload-overlay.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  overlay.loadFile(htmlPath);
  overlays[type] = overlay;
  return overlay;
}

function toggleOverlay(type, bounds) {
  const overlay = getOverlay(type);
  
  if (overlay.isVisible()) {
    overlay.hide();
  } else {
    positionOverlay(type, overlay, bounds);
    overlay.showInactive(); // Show without stealing focus
  }
}

function positionOverlay(type, overlay, mainBounds) {
  const positions = {
    bookmarks: {
      x: mainBounds.x,
      y: mainBounds.y + 100, // Below chrome
      width: 320,
      height: mainBounds.height - 100
    },
    history: {
      x: mainBounds.x,
      y: mainBounds.y + 100,
      width: 320,
      height: mainBounds.height - 100
    },
    downloads: {
      x: mainBounds.x,
      y: mainBounds.y + mainBounds.height - 200,
      width: mainBounds.width,
      height: 200
    },
    settings: {
      x: mainBounds.x + (mainBounds.width - 800) / 2,
      y: mainBounds.y + (mainBounds.height - 600) / 2,
      width: 800,
      height: 600
    },
    'command-palette': {
      x: mainBounds.x + (mainBounds.width - 600) / 2,
      y: mainBounds.y + 150,
      width: 600,
      height: 400
    },
    'session-manager': {
      x: mainBounds.x + (mainBounds.width - 700) / 2,
      y: mainBounds.y + (mainBounds.height - 500) / 2,
      width: 700,
      height: 500
    },
    'reading-mode': {
      x: mainBounds.x,
      y: mainBounds.y + 100,
      width: mainBounds.width,
      height: mainBounds.height - 100
    }
  };
  
  overlay.setBounds(positions[type]);
}
```

### Phase 2F: Wire Up IPC
**Add overlay handlers:**

```javascript
// In browser-stable.js
ipcMain.on('overlay:toggle', (event, { type, bounds }) => {
  toggleOverlay(type, bounds);
});

ipcMain.on('overlay:hide', (event, type) => {
  if (overlays[type]) {
    overlays[type].hide();
  }
});

ipcMain.on('overlay:hideAll', () => {
  Object.values(overlays).forEach(o => o.hide());
});
```

### Phase 2G: Update MinimalChrome Triggers
**Wire overlay triggers in components:**

```tsx
// In MinimalChrome.tsx
<TabBar
  onSettingsClick={() => {
    const bounds = mainWindow.getBounds();
    electronAPI.toggleOverlay('settings', bounds);
  }}
/>

<NavigationBar
  onMenuClick={() => {
    const bounds = mainWindow.getBounds();
    electronAPI.toggleOverlay('bookmarks', bounds);
  }}
/>

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      electronAPI.toggleOverlay('command-palette', mainWindow.getBounds());
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      electronAPI.toggleOverlay('bookmarks', mainWindow.getBounds());
    }
    // ... more shortcuts
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## 🎨 Glass Morphism for Overlays

All overlays use consistent styling:

```css
/* overlays/overlay.css */
body {
  margin: 0;
  padding: 16px;
  background: rgba(25, 25, 25, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45);
  color: white;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

.glass-overlay {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## 📊 Benefits

### Technical
- ✅ **No z-index fighting** - Separate windows above BrowserView
- ✅ **GPU-accelerated blur** - True backdrop-filter support
- ✅ **Clean separation** - Each overlay independent
- ✅ **Hot reload friendly** - Reload overlay without restarting
- ✅ **Focus management** - showInactive() prevents flicker

### Visual
- ✅ **Beautiful Figma UI preserved** - All components work
- ✅ **Glass morphism** - True transparency effects
- ✅ **Smooth animations** - Native compositor quality
- ✅ **No cutoff** - Overlays float above everything

### Architecture
- ✅ **Scalable** - Easy to add new overlays
- ✅ **Maintainable** - Each overlay is separate app
- ✅ **Testable** - Isolated overlay logic
- ✅ **Flexible** - Can position/resize overlays dynamically

## 🚀 Implementation Order

1. ✅ **Fix Tesla timer** (DONE)
2. 🔄 **Update MinimalChrome** with Figma TabBar + NavigationBar
3. 🔄 **Create overlay infrastructure** (overlay-manager.js)
4. 🔄 **Build BookmarksOverlay** (first overlay to test)
5. 🔄 **Update Vite config** for multiple entry points
6. 🔄 **Test overlay system** (toggle, position, hide)
7. 🔄 **Convert remaining panels** to overlays
8. 🔄 **Add animations** to overlay show/hide
9. 🔄 **Polish & optimize** all overlays

## 🎯 Next Immediate Steps

**Step 1: Update MinimalChrome to use Figma components**
- Import GreyBackground, LoadingProgress
- Keep beautiful TabBar and NavigationBar
- Wire overlay triggers

**Step 2: Create overlay-manager.js**
- Implement overlay lifecycle
- Add positioning logic
- Wire up IPC handlers

**Ready to proceed?** 🚀
