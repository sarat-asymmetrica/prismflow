/**
 * Overlay Manager - Opera-style Floating Panel System
 * 
 * Manages lifecycle of overlay BrowserWindows that float above main content.
 * Uses separate BrowserWindows (not DOM z-index) for GPU-accelerated glass effects.
 * 
 * Architecture Pattern:
 * - Each overlay is a separate BrowserWindow
 * - Parent-child relationship with main window
 * - showInactive() prevents focus stealing
 * - GPU compositor handles transparency + backdrop blur
 * 
 * Overlay Types:
 * - bookmarks: Left panel (320x full height)
 * - history: Left panel (320x full height) 
 * - downloads: Bottom panel (full width x 200)
 * - settings: Center modal (800x600)
 * - command-palette: Top-center (600x400)
 */

const { BrowserWindow } = require('electron');
const path = require('path');

class OverlayManager {
  constructor() {
    this.overlays = new Map();
    this.mainWindow = null;
  }

  /**
   * Initialize overlay manager with main window reference
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    console.log('✅ Overlay Manager initialized');
  }

  /**
   * Get overlay bounds based on type and main window dimensions
   */
  getOverlayBounds(type) {
    if (!this.mainWindow) return null;

    const mainBounds = this.mainWindow.getBounds();
    const [mainWidth, mainHeight] = this.mainWindow.getSize();
    
    const bounds = {
      x: mainBounds.x,
      y: mainBounds.y,
      width: 0,
      height: 0
    };

    switch (type) {
      case 'bookmarks':
      case 'history':
        // Left panel - slides in from left
        bounds.width = 320;
        bounds.height = mainHeight;
        break;

      case 'downloads':
        // Bottom panel - slides up from bottom
        bounds.x = mainBounds.x;
        bounds.y = mainBounds.y + mainHeight - 200;
        bounds.width = mainWidth;
        bounds.height = 200;
        break;

      case 'settings':
        // Center modal - fades in center
        bounds.x = mainBounds.x + (mainWidth - 800) / 2;
        bounds.y = mainBounds.y + (mainHeight - 600) / 2;
        bounds.width = 800;
        bounds.height = 600;
        break;

      case 'command-palette':
        // Top-center - slides down from top
        bounds.x = mainBounds.x + (mainWidth - 600) / 2;
        bounds.y = mainBounds.y + 60; // Below chrome
        bounds.width = 600;
        bounds.height = 400;
        break;

      default:
        console.warn(`⚠️ Unknown overlay type: ${type}`);
        return null;
    }

    return bounds;
  }

  /**
   * Create overlay window with glass morphism styling
   */
  createOverlay(type, htmlPath) {
    const bounds = this.getOverlayBounds(type);
    if (!bounds) return null;

    const overlay = new BrowserWindow({
      parent: this.mainWindow,
      modal: false,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: true,
      roundedCorners: true,
      vibrancy: 'sidebar', // macOS glass effect
      backgroundMaterial: 'acrylic', // Windows glass effect
      ...bounds,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Load overlay HTML
    const overlayPath = path.join(__dirname, '..', 'dist-react', htmlPath);
    overlay.loadFile(overlayPath);

    // Prevent focus stealing - critical for Opera-style behavior
    overlay.on('ready-to-show', () => {
      overlay.showInactive(); // Show without stealing focus
      console.log(`✅ Overlay "${type}" shown (inactive)`);
    });

    // Clean up on close
    overlay.on('closed', () => {
      this.overlays.delete(type);
      console.log(`🗑️ Overlay "${type}" closed`);
    });

    // Update position when main window moves/resizes
    this.mainWindow.on('move', () => this.updateOverlayPosition(type));
    this.mainWindow.on('resize', () => this.updateOverlayPosition(type));

    return overlay;
  }

  /**
   * Toggle overlay visibility
   */
  toggleOverlay(type, htmlPath = `overlays/${type}.html`) {
    const existing = this.overlays.get(type);

    if (existing && !existing.isDestroyed()) {
      // Hide existing overlay
      existing.hide();
      existing.destroy();
      this.overlays.delete(type);
      console.log(`👻 Overlay "${type}" hidden`);
      return false;
    } else {
      // Create and show new overlay
      const overlay = this.createOverlay(type, htmlPath);
      if (overlay) {
        this.overlays.set(type, overlay);
        console.log(`🎨 Overlay "${type}" created`);
        return true;
      }
      return false;
    }
  }

  /**
   * Update overlay position when main window moves/resizes
   */
  updateOverlayPosition(type) {
    const overlay = this.overlays.get(type);
    if (!overlay || overlay.isDestroyed()) return;

    const bounds = this.getOverlayBounds(type);
    if (bounds) {
      overlay.setBounds(bounds);
    }
  }

  /**
   * Hide specific overlay
   */
  hideOverlay(type) {
    const overlay = this.overlays.get(type);
    if (overlay && !overlay.isDestroyed()) {
      overlay.hide();
      overlay.destroy();
      this.overlays.delete(type);
      console.log(`👻 Overlay "${type}" hidden`);
      return true;
    }
    return false;
  }

  /**
   * Hide all overlays
   */
  hideAllOverlays() {
    let count = 0;
    for (const [type, overlay] of this.overlays.entries()) {
      if (!overlay.isDestroyed()) {
        overlay.hide();
        overlay.destroy();
        count++;
      }
    }
    this.overlays.clear();
    console.log(`👻 All overlays hidden (${count} total)`);
    return count;
  }

  /**
   * Check if overlay is visible
   */
  isOverlayVisible(type) {
    const overlay = this.overlays.get(type);
    return overlay && !overlay.isDestroyed() && overlay.isVisible();
  }

  /**
   * Get all visible overlays
   */
  getVisibleOverlays() {
    const visible = [];
    for (const [type, overlay] of this.overlays.entries()) {
      if (!overlay.isDestroyed() && overlay.isVisible()) {
        visible.push(type);
      }
    }
    return visible;
  }

  /**
   * Cleanup all overlays
   */
  destroy() {
    this.hideAllOverlays();
    this.mainWindow = null;
    console.log('🗑️ Overlay Manager destroyed');
  }
}

// Singleton instance
const overlayManager = new OverlayManager();

module.exports = overlayManager;
