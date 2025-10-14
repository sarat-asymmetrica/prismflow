// PrismFlow Browser - History Panel
// Quick access to browsing history with Natural Asymmetry organization

class HistoryPanel {
  constructor(browser) {
    this.browser = browser;
    this.visible = false;
    this.initializeUI();
  }

  initializeUI() {
    const panel = document.createElement("div");
    panel.id = "history-panel";
    panel.className = "history-panel";
    panel.innerHTML = `
            <div class="history-header">
                <h3>History</h3>
                <input type="text" id="history-search" placeholder="Search history..." />
                <button class="history-close">×</button>
            </div>
            <div class="history-list"></div>
            <div class="history-footer">
                <button class="clear-history">Clear History</button>
                <span class="history-count">0 items</span>
            </div>
        `;
    document.body.appendChild(panel);

    // Event handlers
    panel
      .querySelector(".history-close")
      .addEventListener("click", () => this.hide());
    panel
      .querySelector(".clear-history")
      .addEventListener("click", () => this.clearHistory());
    panel
      .querySelector("#history-search")
      .addEventListener("input", (e) => this.searchHistory(e.target.value));
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  show() {
    this.visible = true;
    document.getElementById("history-panel").classList.add("visible");
    this.updateList();
  }

  hide() {
    this.visible = false;
    document.getElementById("history-panel").classList.remove("visible");
  }

  updateList(searchQuery = "") {
    const list = document.querySelector(".history-list");
    const countEl = document.querySelector(".history-count");

    let history = this.browser.getHistory ? this.browser.getHistory(100) : [];

    if (searchQuery) {
      history = this.browser.searchHistory
        ? this.browser.searchHistory(searchQuery)
        : [];
    }

    list.innerHTML = "";

    // Group by date
    const grouped = this.groupByDate(history);

    Object.entries(grouped).forEach(([date, items]) => {
      const section = document.createElement("div");
      section.className = "history-section";
      section.innerHTML = `<div class="history-date">${date}</div>`;

      items.forEach((item) => {
        const entry = document.createElement("div");
        entry.className = "history-entry";
        entry.innerHTML = `
                    <div class="history-time">${new Date(item.timestamp).toLocaleTimeString()}</div>
                    <div class="history-content">
                        <div class="history-title">${item.title || item.url}</div>
                        <div class="history-url">${item.url}</div>
                    </div>
                    <div class="history-visits">${item.visitCount || 1}x</div>
                `;

        entry.addEventListener("click", () => {
          this.browser.navigate(item.url);
          this.hide();
        });

        section.appendChild(entry);
      });

      list.appendChild(section);
    });

    countEl.textContent = `${history.length} items`;
  }

  groupByDate(history) {
    const grouped = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    history.forEach((item) => {
      const date = new Date(item.timestamp).toDateString();
      let label = date;

      if (date === today) label = "Today";
      else if (date === yesterday) label = "Yesterday";

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });

    return grouped;
  }

  searchHistory(query) {
    this.updateList(query);
  }

  clearHistory() {
    if (confirm("Clear all browsing history?")) {
      this.browser.clearHistory();
      this.updateList();
    }
  }
}

// Add styles
const historyStyles = `
<style>
.history-panel {
    position: fixed;
    right: 20px;
    top: 100px;
    width: 450px;
    max-height: 600px;
    background: rgba(30, 30, 40, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    z-index: 9997;
    opacity: 0;
    visibility: hidden;
    transform: translateX(20px);
    transition: all 0.3s ease;
}

.history-panel.visible {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

.history-header {
    padding: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
}

.history-header h3 {
    margin: 0;
    color: #60a5fa;
}

#history-search {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 5px 15px;
    color: #fff;
}

.history-close {
    background: none;
    border: none;
    color: #999;
    font-size: 1.5em;
    cursor: pointer;
}

.history-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

.history-section {
    margin-bottom: 20px;
}

.history-date {
    font-size: 0.9em;
    color: #60a5fa;
    font-weight: bold;
    margin-bottom: 10px;
    padding: 5px 10px;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 5px;
}

.history-entry {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 5px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.history-entry:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(5px);
}

.history-time {
    font-size: 0.8em;
    color: #666;
    margin-right: 15px;
    min-width: 60px;
}

.history-content {
    flex: 1;
}

.history-title {
    color: #fff;
    margin-bottom: 2px;
}

.history-url {
    font-size: 0.85em;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.history-visits {
    font-size: 0.85em;
    color: #4ade80;
    margin-left: 10px;
}

.history-footer {
    padding: 10px 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.clear-history {
    padding: 6px 15px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    border-radius: 8px;
    cursor: pointer;
}

.clear-history:hover {
    background: rgba(239, 68, 68, 0.3);
}

.history-count {
    font-size: 0.85em;
    color: #666;
}
</style>
`;

document.head.insertAdjacentHTML("beforeend", historyStyles);
