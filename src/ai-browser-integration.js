// PrismFlow Browser - AI Integration Layer
// Connects Natural Asymmetry Orchestrator with browser functionality

class AIBrowserIntegration {
  constructor() {
    this.orchestrator = null;
    this.initialized = false;

    // DOM cache for performance optimization
    this.domCache = {
      toolbar: null,
      urlBar: null,
      body: null,
    };

    this.setupIntegration();
  }

  getCachedElement(key, selector) {
    if (!this.domCache[key]) {
      this.domCache[key] = document.querySelector(selector);
    }
    return this.domCache[key];
  }

  async setupIntegration() {
    // Wait for orchestrator to load
    if (typeof NaturalAsymmetryOrchestrator !== "undefined") {
      this.orchestrator = new NaturalAsymmetryOrchestrator();
      this.initialized = true;
      this.attachBrowserHooks();
    } else {
      // Retry in 100ms
      setTimeout(() => this.setupIntegration(), 100);
    }
  }

  attachBrowserHooks() {
    // Hook into URL bar for AI-powered search
    this.enhanceSearchBar();

    // Add AI button to toolbar
    this.addAIButton();

    // Enable voice commands
    this.setupVoiceCommands();

    // Smart page analysis
    this.enablePageAnalysis();
  }

  enhanceSearchBar() {
    const urlBar = this.getCachedElement("urlBar", "#url-bar");
    if (!urlBar) return;

    // Add AI suggestions on typing
    let aiTimeout;
    urlBar.addEventListener("input", (e) => {
      clearTimeout(aiTimeout);
      const query = e.target.value;

      // If query starts with "ai:", route to AI
      if (query.startsWith("ai:")) {
        aiTimeout = setTimeout(async () => {
          const aiQuery = query.substring(3).trim();
          const response = await this.askAI(aiQuery);
          this.showAIResponse(response);
        }, 500);
      }
    });
  }

  addAIButton() {
    const toolbar = this.getCachedElement("toolbar", ".browser-toolbar");
    if (!toolbar) return;

    // Create AI button
    const aiButton = document.createElement("button");
    aiButton.className = "toolbar-btn ai-btn";
    aiButton.id = "ai-assistant-btn";
    aiButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                <circle cx="12" cy="12" r="4"/>
            </svg>
        `;
    aiButton.title = "AI Assistant (Ctrl+Shift+A)";

    // Insert before settings button
    const settingsBtn = document.getElementById("menu-btn");
    toolbar.insertBefore(aiButton, settingsBtn);

    // Add click handler
    aiButton.addEventListener("click", () => {
      this.toggleAIPanel();
    });
  }

  setupVoiceCommands() {
    // Check if browser supports speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;
        console.log("Voice command:", command);

        // Process with AI
        const response = await this.askAI(command, { mode: "voice" });
        this.executeAICommand(response);
      };
    }
  }

  enablePageAnalysis() {
    // Add context menu option for AI analysis
    document.addEventListener("contextmenu", (e) => {
      if (
        e.target.tagName === "IMG" ||
        e.target.tagName === "P" ||
        e.target.tagName === "DIV"
      ) {
        // Can add custom context menu for AI analysis
        // "Explain this with AI", "Summarize", etc.
      }
    });
  }

  async askAI(query, options = {}) {
    if (!this.orchestrator) {
      return { error: "AI not initialized" };
    }

    // Add browser context
    const context = {
      currentURL: window.location.href,
      pageTitle: document.title,
      ...options,
    };

    try {
      const response = await this.orchestrator.process(query, context);
      return response;
    } catch (error) {
      console.error("AI error:", error);
      return { error: error.message };
    }
  }

  showAIResponse(response) {
    // Create or update AI response panel
    let panel = document.getElementById("ai-response-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "ai-response-panel";
      panel.className = "ai-response-panel";
      panel.innerHTML = `
                <div class="ai-response-header">
                    <span class="ai-response-title">AI Assistant</span>
                    <button class="ai-response-close">×</button>
                </div>
                <div class="ai-response-content"></div>
                <div class="ai-response-footer">
                    <span class="ai-response-model"></span>
                    <span class="ai-response-time"></span>
                </div>
            `;
      document.body.appendChild(panel);

      // Add close handler
      panel
        .querySelector(".ai-response-close")
        .addEventListener("click", () => {
          panel.classList.remove("visible");
        });
    }

    // Update content
    const content = panel.querySelector(".ai-response-content");
    const model = panel.querySelector(".ai-response-model");
    const time = panel.querySelector(".ai-response-time");

    if (response.error) {
      content.innerHTML = `<div class="error">${response.error}</div>`;
    } else {
      content.innerHTML = `<div class="response">${response.text || "No response"}</div>`;
      model.textContent = response.model || "Unknown";
      time.textContent = response.responseTime
        ? `${response.responseTime}ms`
        : "";
    }

    // Show panel
    panel.classList.add("visible");
  }

  executeAICommand(response) {
    // Parse AI response for browser commands
    if (response.text) {
      const text = response.text.toLowerCase();

      // Navigation commands
      if (text.includes("go to") || text.includes("navigate to")) {
        const urlMatch = text.match(/(?:go to|navigate to)\s+(\S+)/);
        if (urlMatch) {
          window.location.href = urlMatch[1];
        }
      }

      // Tab commands
      if (text.includes("new tab")) {
        if (window.electronAPI) {
          window.electronAPI.createTab();
        }
      }

      // Search commands
      if (text.includes("search for")) {
        const searchMatch = text.match(/search for\s+(.+)/);
        if (searchMatch) {
          const query = searchMatch[1];
          window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
      }
    }
  }

  toggleAIPanel() {
    // Create AI chat panel
    let chatPanel = document.getElementById("ai-chat-panel");
    if (!chatPanel) {
      chatPanel = document.createElement("div");
      chatPanel.id = "ai-chat-panel";
      chatPanel.className = "ai-chat-panel";
      chatPanel.innerHTML = `
                <div class="ai-chat-header">
                    <h3>AI Assistant</h3>
                    <button class="ai-chat-close">×</button>
                </div>
                <div class="ai-chat-messages"></div>
                <div class="ai-chat-input-container">
                    <input type="text" class="ai-chat-input" placeholder="Ask me anything...">
                    <button class="ai-chat-send">Send</button>
                </div>
                <div class="ai-chat-status">
                    <span class="distribution-indicator">
                        30% Creative | 20% Precise | 50% Local
                    </span>
                </div>
            `;
      document.body.appendChild(chatPanel);

      // Event handlers
      const closeBtn = chatPanel.querySelector(".ai-chat-close");
      const input = chatPanel.querySelector(".ai-chat-input");
      const sendBtn = chatPanel.querySelector(".ai-chat-send");
      const messages = chatPanel.querySelector(".ai-chat-messages");

      closeBtn.addEventListener("click", () => {
        chatPanel.classList.remove("visible");
      });

      const sendMessage = async () => {
        const query = input.value.trim();
        if (!query) return;

        // Add user message
        messages.innerHTML += `
                    <div class="chat-message user">
                        <div class="message-content">${query}</div>
                    </div>
                `;

        input.value = "";

        // Get AI response
        const response = await this.askAI(query);

        // Add AI message
        messages.innerHTML += `
                    <div class="chat-message ai">
                        <div class="message-content">${response.text || response.error || "No response"}</div>
                        <div class="message-meta">${response.model || "System"} - ${response.responseTime || 0}ms</div>
                    </div>
                `;

        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
      };

      sendBtn.addEventListener("click", sendMessage);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
      });
    }

    chatPanel.classList.toggle("visible");

    // Focus input when opened
    if (chatPanel.classList.contains("visible")) {
      chatPanel.querySelector(".ai-chat-input").focus();
    }
  }
}

// Add styles for AI integration
const aiStyles = `
<style>
.ai-btn {
    color: #4ade80;
}

.ai-btn:hover {
    background: rgba(74, 222, 128, 0.1);
}

.ai-response-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    max-width: 90%;
    background: rgba(30, 30, 40, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.ai-response-panel.visible {
    opacity: 1;
    visibility: visible;
}

.ai-response-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-response-title {
    font-size: 1.2em;
    font-weight: bold;
    color: #4ade80;
}

.ai-response-close {
    background: none;
    border: none;
    color: #999;
    font-size: 1.5em;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
}

.ai-response-content {
    min-height: 100px;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 15px;
    color: #e0e0e0;
    line-height: 1.6;
}

.ai-response-footer {
    display: flex;
    justify-content: space-between;
    font-size: 0.85em;
    color: #666;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-chat-panel {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 400px;
    height: 600px;
    background: rgba(30, 30, 40, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: all 0.3s ease;
}

.ai-chat-panel.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.ai-chat-header {
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ai-chat-header h3 {
    margin: 0;
    color: #4ade80;
}

.ai-chat-close {
    background: none;
    border: none;
    color: #999;
    font-size: 1.5em;
    cursor: pointer;
}

.ai-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.chat-message {
    margin-bottom: 15px;
}

.chat-message.user .message-content {
    background: rgba(74, 222, 128, 0.2);
    color: #fff;
    padding: 10px 15px;
    border-radius: 15px 15px 5px 15px;
    margin-left: 50px;
}

.chat-message.ai .message-content {
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    padding: 10px 15px;
    border-radius: 15px 15px 15px 5px;
    margin-right: 50px;
}

.message-meta {
    font-size: 0.75em;
    color: #666;
    margin-top: 5px;
    margin-left: 15px;
}

.ai-chat-input-container {
    display: flex;
    padding: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-chat-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 25px;
    padding: 10px 20px;
    color: #fff;
    margin-right: 10px;
}

.ai-chat-send {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    border: none;
    border-radius: 25px;
    padding: 10px 25px;
    color: white;
    cursor: pointer;
    font-weight: bold;
}

.ai-chat-status {
    padding: 10px;
    text-align: center;
    font-size: 0.85em;
    color: #666;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.distribution-indicator {
    color: #4ade80;
}
</style>
`;

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Add styles
    document.head.insertAdjacentHTML("beforeend", aiStyles);

    // Initialize integration
    window.aiBrowserIntegration = new AIBrowserIntegration();
  });
} else {
  // Add styles
  document.head.insertAdjacentHTML("beforeend", aiStyles);

  // Initialize integration
  window.aiBrowserIntegration = new AIBrowserIntegration();
}
