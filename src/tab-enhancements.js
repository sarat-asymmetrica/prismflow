/**
 * Tab Enhancement Module
 * Audio indicators, memory display, and performance visualization
 */

class TabEnhancements {
  constructor(browser) {
    this.browser = browser;
    this.audioTabs = new Set();
    this.memoryStats = new Map();

    this.initialize();
  }

  initialize() {
    // Listen for audio state changes
    if (window.audioAPI) {
      window.audioAPI.onAudioStateChange((data) => {
        this.updateAudioIndicator(data.tabId, data.hasAudio);
      });

      window.audioAPI.onMemoryStatsUpdate((data) => {
        this.updateMemoryDisplay(data.tabId, data.memory);
      });
    }

    // Listen for performance stats
    if (window.electronAPI && window.electronAPI.onPerformanceStats) {
      window.electronAPI.onPerformanceStats((stats) => {
        this.updatePerformanceDisplay(stats);
      });
    }

    // Enhance tab creation
    this.enhanceTabCreation();

    // Fix settings dialog persistence
    this.fixSettingsDialog();

    console.log("✅ Tab Enhancements initialized!");
  }

  enhanceTabCreation() {
    // Override the browser's addTabToUI method
    // const originalAddTab = this.browser.addTabToUI;

    this.browser.addTabToUI = (tabId, title) => {
      const tabBar = document.querySelector(".tab-bar");
      const newTabBtn = document.querySelector(".new-tab");

      // Create enhanced tab element
      const tab = document.createElement("div");
      tab.className = "tab";
      tab.dataset.tabId = tabId;
      tab.innerHTML = `
                <span class="tab-audio-indicator">🔊</span>
                <span class="tab-title">${title}</span>
                <span class="tab-memory">0 MB</span>
                <span class="tab-close">×</span>
            `;

      // Insert before new tab button
      tabBar.insertBefore(tab, newTabBtn);

      // Make it active
      this.browser.setActiveTabUI(tabId);

      // Add enhanced styling
      this.applyTabStyling(tab);
    };
  }

  applyTabStyling(tab) {
    // Add smooth transitions
    tab.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    // Audio indicator styling
    const audioIndicator = tab.querySelector(".tab-audio-indicator");
    if (audioIndicator) {
      audioIndicator.style.cssText = `
                width: 16px;
                height: 16px;
                display: none;
                animation: audioPulse 2s infinite;
                filter: drop-shadow(0 0 3px rgba(255, 200, 0, 0.5));
            `;
    }

    // Memory display styling
    const memoryDisplay = tab.querySelector(".tab-memory");
    if (memoryDisplay) {
      memoryDisplay.style.cssText = `
                font-size: 10px;
                opacity: 0.7;
                margin-left: auto;
                padding: 2px 6px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                font-family: monospace;
            `;
    }
  }

  updateAudioIndicator(tabId, hasAudio) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const indicator = tab.querySelector(".tab-audio-indicator");
      if (indicator) {
        if (hasAudio) {
          indicator.style.display = "inline-block";
          tab.classList.add("has-audio");

          // Animate the indicator
          indicator.animate(
            [
              { transform: "scale(1)", opacity: 0.6 },
              { transform: "scale(1.2)", opacity: 1 },
              { transform: "scale(1)", opacity: 0.6 },
            ],
            {
              duration: 2000,
              iterations: Infinity,
            },
          );

          this.audioTabs.add(tabId);
        } else {
          indicator.style.display = "none";
          tab.classList.remove("has-audio");
          this.audioTabs.delete(tabId);
        }
      }
    }

    // Update status bar
    this.updateAudioStatus();
  }

  updateMemoryDisplay(tabId, memory) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const memDisplay = tab.querySelector(".tab-memory");
      if (memDisplay) {
        const memMB = memory.private || 0;
        memDisplay.textContent = `${memMB} MB`;

        // Color code based on memory usage
        if (memMB > 500) {
          memDisplay.style.background = "rgba(255, 0, 0, 0.2)";
          memDisplay.style.color = "#ff3333";
        } else if (memMB > 300) {
          memDisplay.style.background = "rgba(255, 200, 0, 0.2)";
          memDisplay.style.color = "#ffaa00";
        } else {
          memDisplay.style.background = "rgba(0, 255, 100, 0.1)";
          memDisplay.style.color = "#00aa66";
        }
      }
    }

    this.memoryStats.set(tabId, memory.private);
    this.updateMemoryStatus();
  }

  updateAudioStatus() {
    const statusEl = document.getElementById("audio-status");
    if (!statusEl) {
      // Create audio status element
      const statusBar = document.querySelector(".status-bar");
      if (statusBar) {
        const audioStatus = document.createElement("div");
        audioStatus.id = "audio-status";
        audioStatus.className = "status-item";
        audioStatus.innerHTML = `
                    <span>🔊 Audio: ${this.audioTabs.size} tabs</span>
                `;
        statusBar.appendChild(audioStatus);
      }
    } else {
      statusEl.innerHTML = `<span>🔊 Audio: ${this.audioTabs.size} tabs</span>`;
    }
  }

  updateMemoryStatus() {
    let totalMemory = 0;
    for (const mem of this.memoryStats.values()) {
      totalMemory += mem;
    }

    const memoryEl = document.getElementById("memory-usage");
    if (memoryEl) {
      memoryEl.textContent = `Memory: ${totalMemory} MB (${this.memoryStats.size} tabs)`;
    }
  }

  updatePerformanceDisplay(stats) {
    // Create or update performance overlay
    let perfOverlay = document.getElementById("performance-overlay");
    if (!perfOverlay && stats.tabCount > 5) {
      perfOverlay = document.createElement("div");
      perfOverlay.id = "performance-overlay";
      perfOverlay.style.cssText = `
                position: fixed;
                top: 160px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 10px;
                font-family: monospace;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0.7;
                transition: opacity 0.3s;
            `;
      document.body.appendChild(perfOverlay);
    }

    if (perfOverlay) {
      perfOverlay.innerHTML = `
                <div>Tabs: ${stats.tabCount}</div>
                <div>Audio: ${stats.audioTabCount}</div>
                <div>Memory: ${stats.totalMemory} MB</div>
                <div>Per Tab: ${Math.round(stats.totalMemory / stats.tabCount)} MB avg</div>
            `;

      // Auto-hide if low tab count
      if (stats.tabCount <= 3) {
        perfOverlay.style.display = "none";
      } else {
        perfOverlay.style.display = "block";
      }
    }
  }

  fixSettingsDialog() {
    // Ensure settings dialog doesn't persist
    const originalToggle = this.browser.toggleSettingsPanel;
    if (originalToggle) {
      this.browser.toggleSettingsPanel = function () {
        const panel = document.getElementById("settings-panel");
        if (panel) {
          // Force hide all other panels first
          document
            .querySelectorAll(".settings-panel, .side-panel")
            .forEach((p) => {
              if (p !== panel) {
                p.classList.remove("visible");
              }
            });

          // Toggle with proper z-index management
          if (panel.classList.contains("visible")) {
            panel.classList.remove("visible");
            setTimeout(() => {
              panel.style.display = "none";
            }, 300);
          } else {
            panel.style.display = "flex";
            setTimeout(() => {
              panel.classList.add("visible");
            }, 10);
          }

          // Load settings if opening
          if (panel.classList.contains("visible") && this.loadCurrentSettings) {
            this.loadCurrentSettings();
          }
        }
      }.bind(this.browser);
    }

    // Ensure clicking outside closes settings
    document.addEventListener("click", (e) => {
      const settingsPanel = document.getElementById("settings-panel");
      if (settingsPanel && settingsPanel.classList.contains("visible")) {
        if (
          !settingsPanel.contains(e.target) &&
          !e.target.closest("#menu-btn")
        ) {
          settingsPanel.classList.remove("visible");
        }
      }
    });
  }
}

// Add animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes audioPulse {
        0% { 
            transform: scale(1);
            opacity: 0.6;
        }
        50% { 
            transform: scale(1.2);
            opacity: 1;
        }
        100% { 
            transform: scale(1);
            opacity: 0.6;
        }
    }
    
    .tab.has-audio {
        background: linear-gradient(90deg, 
            rgba(255, 200, 0, 0.1) 0%, 
            rgba(255, 255, 255, 0.5) 100%);
    }
    
    body.dark-mode .tab.has-audio {
        background: linear-gradient(90deg, 
            rgba(255, 200, 0, 0.2) 0%, 
            rgba(255, 255, 255, 0.05) 100%);
    }
    
    .tab-memory {
        transition: all 0.3s ease;
    }
    
    /* Fix for settings dialog */
    .settings-panel {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(0.9) !important;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .settings-panel.visible {
        transform: translate(-50%, -50%) scale(1) !important;
        opacity: 1;
        pointer-events: auto;
    }
    
    /* Dark mode fixes */
    body.dark-mode .settings-panel {
        background: rgba(30, 30, 30, 0.98) !important;
    }
    
    body.dark-mode .settings-panel * {
        color: rgba(255, 255, 255, 0.9);
    }
    
    body.dark-mode input,
    body.dark-mode select {
        background: rgba(50, 50, 50, 0.8) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
    }
    
    /* Performance overlay */
    #performance-overlay:hover {
        opacity: 1 !important;
    }
`;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.tabEnhancements = new TabEnhancements(window.prismFlowBrowser);
  });
} else {
  window.tabEnhancements = new TabEnhancements(window.prismFlowBrowser);
}

console.log("🎵 Tab Enhancements: Audio indicators and memory tracking ready!");
