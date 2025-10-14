// PrismFlow Browser - Keyboard Shortcuts System
// Natural Asymmetry: 30% Discovery, 20% Precision, 50% Support

class KeyboardShortcuts {
  constructor() {
    // Natural Asymmetry distribution
    this.DISCOVERY_SHORTCUTS = 0.3; // Navigation & search
    this.PRECISION_SHORTCUTS = 0.2; // Specific actions
    this.SUPPORT_SHORTCUTS = 0.5; // UI & help

    this.shortcuts = this.defineShortcuts();
    this.isHelpVisible = false;

    this.init();
  }

  defineShortcuts() {
    return {
      // Discovery shortcuts (30%)
      navigation: [
        { keys: "Ctrl+T", action: "New Tab", category: "navigation" },
        { keys: "Ctrl+W", action: "Close Tab", category: "navigation" },
        { keys: "Ctrl+Tab", action: "Next Tab", category: "navigation" },
        {
          keys: "Ctrl+Shift+Tab",
          action: "Previous Tab",
          category: "navigation",
        },
        { keys: "Alt+Left", action: "Back", category: "navigation" },
        { keys: "Alt+Right", action: "Forward", category: "navigation" },
        { keys: "F5", action: "Reload", category: "navigation" },
        { keys: "Ctrl+F5", action: "Hard Reload", category: "navigation" },
        { keys: "Ctrl+L", action: "Focus Address Bar", category: "navigation" },
        { keys: "Ctrl+K", action: "Search", category: "navigation" },
      ],

      // Precision shortcuts (20%)
      actions: [
        { keys: "Ctrl+D", action: "Bookmark Page", category: "actions" },
        {
          keys: "Ctrl+Shift+D",
          action: "Bookmark All Tabs",
          category: "actions",
        },
        { keys: "Ctrl+H", action: "Open History", category: "actions" },
        { keys: "Ctrl+J", action: "Open Downloads", category: "actions" },
        {
          keys: "Ctrl+Shift+Delete",
          action: "Clear Browsing Data",
          category: "actions",
        },
        { keys: "F12", action: "Developer Tools", category: "actions" },
      ],

      // Support shortcuts (50%)
      interface: [
        { keys: "Ctrl+Plus", action: "Zoom In", category: "interface" },
        { keys: "Ctrl+Minus", action: "Zoom Out", category: "interface" },
        { keys: "Ctrl+0", action: "Reset Zoom", category: "interface" },
        { keys: "F11", action: "Fullscreen", category: "interface" },
        {
          keys: "Ctrl+Shift+B",
          action: "Toggle Bookmarks Bar",
          category: "interface",
        },
        { keys: "Ctrl+P", action: "Print", category: "interface" },
        { keys: "Ctrl+S", action: "Save Page", category: "interface" },
        { keys: "Ctrl+F", action: "Find in Page", category: "interface" },
        {
          keys: "Esc",
          action: "Stop Loading / Close Dialog",
          category: "interface",
        },
        { keys: "?", action: "Show This Help", category: "interface" },
      ],
    };
  }

  init() {
    this.createHelpPanel();
    this.bindShortcuts();
    this.addHelpButton();
    console.log("⌨️ Keyboard Shortcuts initialized");
  }

  createHelpPanel() {
    const panel = document.createElement("div");
    panel.id = "shortcuts-help-panel";
    panel.className = "shortcuts-panel hidden";

    const content = `
            <div class="shortcuts-header">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <button class="shortcuts-close">×</button>
            </div>
            
            <div class="shortcuts-content">
                <div class="shortcuts-section">
                    <h4>🧭 Navigation (30%)</h4>
                    <div class="shortcuts-list">
                        ${this.shortcuts.navigation
                          .map(
                            (s) =>
                              `<div class="shortcut-item">
                                <span class="shortcut-keys">${s.keys}</span>
                                <span class="shortcut-action">${s.action}</span>
                            </div>`,
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="shortcuts-section">
                    <h4>⚡ Actions (20%)</h4>
                    <div class="shortcuts-list">
                        ${this.shortcuts.actions
                          .map(
                            (s) =>
                              `<div class="shortcut-item">
                                <span class="shortcut-keys">${s.keys}</span>
                                <span class="shortcut-action">${s.action}</span>
                            </div>`,
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="shortcuts-section">
                    <h4>🎨 Interface (50%)</h4>
                    <div class="shortcuts-list">
                        ${this.shortcuts.interface
                          .map(
                            (s) =>
                              `<div class="shortcut-item">
                                <span class="shortcut-keys">${s.keys}</span>
                                <span class="shortcut-action">${s.action}</span>
                            </div>`,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
            
            <div class="shortcuts-footer">
                <div class="natural-asymmetry-note">
                    🌟 Organized by Natural Asymmetry (30/20/50)
                </div>
                <div class="shortcuts-tip">
                    Press <kbd>?</kbd> anytime to show this help
                </div>
            </div>
        `;

    panel.innerHTML = content;
    document.body.appendChild(panel);

    // Close button handler
    panel.querySelector(".shortcuts-close").addEventListener("click", () => {
      this.hideHelp();
    });

    // Click outside to close
    panel.addEventListener("click", (e) => {
      if (e.target === panel) {
        this.hideHelp();
      }
    });
  }

  addHelpButton() {
    // Add help button to toolbar
    const toolbar = document.querySelector(".browser-toolbar");
    if (!toolbar) return;

    const helpBtn = document.createElement("button");
    helpBtn.className = "nav-btn";
    helpBtn.id = "shortcuts-help-btn";
    helpBtn.title = "Keyboard Shortcuts (?)";
    helpBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                <path d="M6 6h.01M6 12h.01M6 18h.01M10 6h8M10 12h8M10 18h8"/>
            </svg>
        `;

    helpBtn.addEventListener("click", () => this.toggleHelp());

    // Insert before settings
    const settingsBtn = document.getElementById("settings-btn");
    if (settingsBtn) {
      toolbar.insertBefore(helpBtn, settingsBtn);
    } else {
      toolbar.appendChild(helpBtn);
    }
  }

  bindShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Check for help shortcut (?)
      if (e.key === "?" && !this.isInputFocused()) {
        e.preventDefault();
        this.toggleHelp();
        return;
      }

      // Check for other shortcuts
      const shortcut = this.findShortcut(e);
      if (shortcut && !this.isInputFocused()) {
        e.preventDefault();
        this.executeShortcut(shortcut);
      }
    });
  }

  isInputFocused() {
    const activeElement = document.activeElement;
    return (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.contentEditable === "true")
    );
  }

  findShortcut(event) {
    const allShortcuts = [
      ...this.shortcuts.navigation,
      ...this.shortcuts.actions,
      ...this.shortcuts.interface,
    ];

    return allShortcuts.find((s) => {
      const keys = s.keys.toLowerCase();
      const hasCtrl = keys.includes("ctrl");
      const hasShift = keys.includes("shift");
      const hasAlt = keys.includes("alt");

      // Extract the main key
      let mainKey = keys.replace(/ctrl\+|shift\+|alt\+/gi, "").trim();

      // Handle special keys
      if (mainKey === "plus") mainKey = "+";
      if (mainKey === "minus") mainKey = "-";
      if (mainKey.startsWith("f")) {
        // Function key
        const fNum = parseInt(mainKey.substring(1));
        if (event.key === `F${fNum}`) {
          return (
            (!hasCtrl || event.ctrlKey) &&
            (!hasShift || event.shiftKey) &&
            (!hasAlt || event.altKey)
          );
        }
      }

      return (
        hasCtrl === event.ctrlKey &&
        hasShift === event.shiftKey &&
        hasAlt === event.altKey &&
        event.key.toLowerCase() === mainKey.toLowerCase()
      );
    });
  }

  executeShortcut(shortcut) {
    console.log(`⌨️ Executing: ${shortcut.action}`);

    // Send to main process for execution
    if (window.electronAPI && window.electronAPI.executeShortcut) {
      window.electronAPI.executeShortcut(shortcut.action);
    } else {
      // Fallback for browser-only shortcuts
      this.executeBrowserShortcut(shortcut.action);
    }

    // Show visual feedback
    this.showShortcutFeedback(shortcut);
  }

  executeBrowserShortcut(action) {
    switch (action) {
      case "New Tab":
        if (window.browserAPI) window.browserAPI.createTab();
        break;
      case "Close Tab":
        if (window.browserAPI) window.browserAPI.closeActiveTab();
        break;
      case "Back":
        window.history.back();
        break;
      case "Forward":
        window.history.forward();
        break;
      case "Reload":
        window.location.reload();
        break;
      case "Focus Address Bar":
        const urlBar = document.getElementById("url-bar");
        if (urlBar) urlBar.focus();
        break;
      case "Bookmark Page":
        if (window.bookmarksManager)
          window.bookmarksManager.bookmarkCurrentPage();
        break;
      case "Open History":
        const historyPanel = document.getElementById("history-panel");
        if (historyPanel) historyPanel.classList.toggle("hidden");
        break;
      case "Open Downloads":
        const downloadsPanel = document.getElementById("downloads-panel");
        if (downloadsPanel) downloadsPanel.classList.toggle("hidden");
        break;
      case "Developer Tools":
        if (window.electronAPI) window.electronAPI.toggleDevTools();
        break;
      case "Fullscreen":
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;
      case "Print":
        window.print();
        break;
      case "Find in Page":
        this.showFindInPage();
        break;
      case "Show This Help":
        this.toggleHelp();
        break;
    }
  }

  showShortcutFeedback(shortcut) {
    // Create feedback toast
    const toast = document.createElement("div");
    toast.className = "shortcut-feedback";
    toast.innerHTML = `
            <span class="feedback-icon">⌨️</span>
            <span class="feedback-text">${shortcut.action}</span>
        `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add("show"), 10);

    // Remove after animation
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  showFindInPage() {
    // Create find bar if it doesn't exist
    let findBar = document.getElementById("find-in-page");
    if (!findBar) {
      findBar = document.createElement("div");
      findBar.id = "find-in-page";
      findBar.className = "find-bar hidden";
      findBar.innerHTML = `
                <input type="text" id="find-input" placeholder="Find in page...">
                <span class="find-results">0 of 0</span>
                <button class="find-prev">↑</button>
                <button class="find-next">↓</button>
                <button class="find-close">×</button>
            `;
      document.body.appendChild(findBar);

      // Setup find functionality
      const input = findBar.querySelector("#find-input");
      input.addEventListener("input", () => this.performFind(input.value));

      findBar.querySelector(".find-close").addEventListener("click", () => {
        findBar.classList.add("hidden");
      });
    }

    findBar.classList.toggle("hidden");
    if (!findBar.classList.contains("hidden")) {
      findBar.querySelector("#find-input").focus();
    }
  }

  performFind(text) {
    if (!text) return;

    // Simple find implementation
    if (window.find) {
      window.find(text);
    }
  }

  toggleHelp() {
    const panel = document.getElementById("shortcuts-help-panel");
    if (panel) {
      if (this.isHelpVisible) {
        this.hideHelp();
      } else {
        this.showHelp();
      }
    }
  }

  showHelp() {
    const panel = document.getElementById("shortcuts-help-panel");
    panel.classList.remove("hidden");
    this.isHelpVisible = true;

    // Add backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "shortcuts-backdrop";
    backdrop.className = "shortcuts-backdrop";
    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", () => this.hideHelp());
  }

  hideHelp() {
    const panel = document.getElementById("shortcuts-help-panel");
    panel.classList.add("hidden");
    this.isHelpVisible = false;

    // Remove backdrop
    const backdrop = document.getElementById("shortcuts-backdrop");
    if (backdrop) backdrop.remove();
  }
}

// Add styles for keyboard shortcuts
const shortcutsStyles = `
<style>
.shortcuts-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    max-width: 90vw;
    max-height: 80vh;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    z-index: 10000;
    color: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.shortcuts-panel.hidden {
    display: none;
}

.shortcuts-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 9999;
}

.shortcuts-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(74, 222, 128, 0.1);
}

.shortcuts-header h3 {
    margin: 0;
    color: #4ade80;
    font-size: 1.3em;
}

.shortcuts-close {
    background: none;
    border: none;
    color: #999;
    font-size: 1.5em;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.shortcuts-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.shortcuts-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.shortcuts-section {
    margin-bottom: 25px;
}

.shortcuts-section h4 {
    color: #4ade80;
    margin: 0 0 15px 0;
    font-size: 1.1em;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-list {
    display: grid;
    gap: 8px;
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.2s ease;
}

.shortcut-item:hover {
    background: rgba(74, 222, 128, 0.1);
    transform: translateX(5px);
}

.shortcut-keys {
    font-family: monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    min-width: 120px;
    text-align: center;
}

.shortcut-action {
    color: #e0e0e0;
    flex: 1;
    text-align: right;
}

.shortcuts-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 52, 96, 0.3);
}

.natural-asymmetry-note {
    text-align: center;
    color: #4ade80;
    margin-bottom: 10px;
    font-size: 0.9em;
}

.shortcuts-tip {
    text-align: center;
    color: #999;
    font-size: 0.85em;
}

.shortcuts-tip kbd {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    color: #4ade80;
}

#shortcuts-help-btn {
    color: #fbbf24;
}

#shortcuts-help-btn:hover {
    background: rgba(251, 191, 36, 0.1);
}

/* Shortcut feedback toast */
.shortcut-feedback {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: linear-gradient(135deg, #4ade80, #22c55e);
    color: white;
    padding: 12px 20px;
    border-radius: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10001;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(74, 222, 128, 0.4);
}

.shortcut-feedback.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}

.feedback-icon {
    font-size: 1.2em;
}

.feedback-text {
    font-weight: 500;
}

/* Find in page bar */
.find-bar {
    position: fixed;
    top: 60px;
    right: 20px;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 9998;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.find-bar.hidden {
    display: none;
}

#find-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    padding: 6px 12px;
    color: white;
    width: 200px;
}

.find-results {
    color: #999;
    font-size: 0.9em;
}

.find-prev, .find-next, .find-close {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
}

.find-prev:hover, .find-next:hover, .find-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Scrollbar styling for shortcuts panel */
.shortcuts-content::-webkit-scrollbar {
    width: 8px;
}

.shortcuts-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.shortcuts-content::-webkit-scrollbar-thumb {
    background: rgba(74, 222, 128, 0.3);
    border-radius: 4px;
}

.shortcuts-content::-webkit-scrollbar-thumb:hover {
    background: rgba(74, 222, 128, 0.5);
}
</style>
`;

// Initialize keyboard shortcuts
document.addEventListener("DOMContentLoaded", () => {
  // Add styles
  document.head.insertAdjacentHTML("beforeend", shortcutsStyles);

  // Initialize shortcuts system
  window.keyboardShortcuts = new KeyboardShortcuts();

  console.log("⌨️ Keyboard Shortcuts ready - Natural Asymmetry powered!");
});

// Export for Node.js if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = KeyboardShortcuts;
}
