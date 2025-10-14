// PrismFlow Browser - Download Manager
// Manages downloads with Natural Asymmetry optimization

class DownloadManager {
    constructor() {
        this.downloads = new Map();
        this.downloadHistory = [];
        this.activeDownloads = 0;
        
        // Natural Asymmetry limits
        this.MAX_CONCURRENT = 3; // 30% active downloads
        this.QUEUE_SIZE = 2;     // 20% queued
        this.HISTORY_SIZE = 5;   // 50% in history
        
        // DOM cache for performance
        this.domCache = {
            panel: null,
            list: null,
            body: null
        };
        
        this.initializeUI();
        this.loadHistory();
    }
    
    getCachedElement(key, selector) {
        if (!this.domCache[key]) {
            this.domCache[key] = document.querySelector(selector);
        }
        return this.domCache[key];
    }
    
    initializeUI() {
        // Create download panel if it doesn't exist
        if (!document.getElementById('download-panel')) {
            const panel = document.createElement('div');
            panel.id = 'download-panel';
            panel.className = 'download-panel';
            panel.innerHTML = `
                <div class="download-header">
                    <h3>Downloads</h3>
                    <button class="download-close">×</button>
                </div>
                <div class="download-list"></div>
                <div class="download-footer">
                    <button class="clear-downloads">Clear All</button>
                    <button class="open-downloads-folder">Open Folder</button>
                </div>
            `;
            document.body.appendChild(panel);
            
            // Event handlers
            panel.querySelector('.download-close').addEventListener('click', () => {
                this.hidePanel();
            });
            
            panel.querySelector('.clear-downloads').addEventListener('click', () => {
                this.clearHistory();
            });
            
            panel.querySelector('.open-downloads-folder').addEventListener('click', () => {
                this.openDownloadsFolder();
            });
        }
    }
    
    showPanel() {
        const panel = document.getElementById('download-panel');
        panel.classList.add('visible');
        this.updateUI();
    }
    
    hidePanel() {
        const panel = document.getElementById('download-panel');
        panel.classList.remove('visible');
    }
    
    togglePanel() {
        const panel = document.getElementById('download-panel');
        if (panel.classList.contains('visible')) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }
    
    async startDownload(url, filename = null) {
        // Generate download ID
        const downloadId = `dl-${Date.now()}`;
        
        // Extract filename from URL if not provided
        if (!filename) {
            const urlParts = url.split('/');
            filename = urlParts[urlParts.length - 1] || 'download';
        }
        
        // Create download object
        const download = {
            id: downloadId,
            url: url,
            filename: filename,
            status: 'pending',
            progress: 0,
            size: 0,
            downloaded: 0,
            startTime: Date.now(),
            endTime: null,
            error: null
        };
        
        // Add to downloads map
        this.downloads.set(downloadId, download);
        
        // Check if we can start immediately or need to queue
        if (this.activeDownloads < this.MAX_CONCURRENT) {
            this.executeDownload(downloadId);
        } else {
            download.status = 'queued';
            console.log(`⏳ Download queued: ${filename}`);
        }
        
        this.updateUI();
        return downloadId;
    }
    
    async executeDownload(downloadId) {
        const download = this.downloads.get(downloadId);
        if (!download) return;
        
        download.status = 'downloading';
        this.activeDownloads++;
        
        try {
            if (window.electronAPI && window.electronAPI.downloadFile) {
                // Use Electron's download API
                // const result = await window.electronAPI.downloadFile({
                    url: download.url,
                    filename: download.filename,
                    onProgress: (progress) => {
                        download.progress = progress.percent;
                        download.downloaded = progress.transferred;
                        download.size = progress.total;
                        this.updateUI();
                    }
                });
                
                download.status = 'completed';
                download.progress = 100;
                download.endTime = Date.now();
                
                console.log(`✅ Download complete: ${download.filename}`);
            } else {
                // Fallback for web mode - simulate download
                await this.simulateDownload(download);
            }
        } catch (error) {
            download.status = 'failed';
            download.error = error.message;
            console.error(`❌ Download failed: ${download.filename}`, error);
        } finally {
            this.activeDownloads--;
            
            // Add to history
            this.addToHistory(download);
            
            // Check for queued downloads
            this.processQueue();
            
            this.updateUI();
        }
    }
    
    async simulateDownload(download) {
        // Simulate download progress for demo
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            download.progress = (i / steps) * 100;
            download.downloaded = download.progress * 1024; // Fake size
            download.size = 102400; // 100KB fake size
            
            this.updateUI();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        download.status = 'completed';
        download.endTime = Date.now();
    }
    
    pauseDownload(downloadId) {
        const download = this.downloads.get(downloadId);
        if (download && download.status === 'downloading') {
            download.status = 'paused';
            console.log(`⏸️ Download paused: ${download.filename}`);
            this.updateUI();
        }
    }
    
    resumeDownload(downloadId) {
        const download = this.downloads.get(downloadId);
        if (download && download.status === 'paused') {
            download.status = 'downloading';
            console.log(`▶️ Download resumed: ${download.filename}`);
            this.updateUI();
        }
    }
    
    cancelDownload(downloadId) {
        const download = this.downloads.get(downloadId);
        if (download) {
            download.status = 'cancelled';
            download.endTime = Date.now();
            
            if (download.status === 'downloading') {
                this.activeDownloads--;
                this.processQueue();
            }
            
            console.log(`🚫 Download cancelled: ${download.filename}`);
            this.updateUI();
        }
    }
    
    processQueue() {
        // Find next queued download
        for (const [id, download] of this.downloads) {
            if (download.status === 'queued' && this.activeDownloads < this.MAX_CONCURRENT) {
                this.executeDownload(id);
                break;
            }
        }
    }
    
    addToHistory(download) {
        this.downloadHistory.unshift(download);
        
        // Limit history size
        if (this.downloadHistory.length > 100) {
            this.downloadHistory = this.downloadHistory.slice(0, 100);
        }
        
        // Save to localStorage
        this.saveHistory();
    }
    
    loadHistory() {
        const saved = localStorage.getItem('downloadHistory');
        if (saved) {
            this.downloadHistory = JSON.parse(saved);
        }
    }
    
    saveHistory() {
        localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
    }
    
    clearHistory() {
        this.downloadHistory = [];
        this.downloads.clear();
        localStorage.removeItem('downloadHistory');
        this.updateUI();
        console.log('🗑️ Download history cleared');
    }
    
    async openDownloadsFolder() {
        if (window.electronAPI && window.electronAPI.openDownloadsFolder) {
            await window.electronAPI.openDownloadsFolder();
        } else {
            console.log('Downloads folder: ~/Downloads');
        }
    }
    
    updateUI() {
        const list = this.getCachedElement('list', '.download-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        // Show active downloads first
        const allDownloads = [...this.downloads.values(), ...this.downloadHistory];
        const uniqueDownloads = allDownloads.filter((d, i, arr) => 
            arr.findIndex(x => x.id === d.id) === i
        );
        
        uniqueDownloads.slice(0, 10).forEach(download => {
            const item = document.createElement('div');
            item.className = `download-item ${download.status}`;
            
            const icon = this.getStatusIcon(download.status);
            const speed = this.calculateSpeed(download);
            
            item.innerHTML = `
                <div class="download-icon">${icon}</div>
                <div class="download-info">
                    <div class="download-name">${download.filename}</div>
                    <div class="download-meta">
                        ${download.status === 'downloading' ? 
                            `${this.formatSize(download.downloaded)} / ${this.formatSize(download.size)} - ${speed}` :
                            this.getStatusText(download)}
                    </div>
                    ${download.status === 'downloading' ? 
                        `<div class="download-progress">
                            <div class="download-progress-bar" style="width: ${download.progress}%"></div>
                        </div>` : ''}
                </div>
                <div class="download-actions">
                    ${this.getActions(download)}
                </div>
            `;
            
            list.appendChild(item);
        });
    }
    
    getStatusIcon(status) {
        const icons = {
            pending: '⏳',
            queued: '📋',
            downloading: '⬇️',
            paused: '⏸️',
            completed: '✅',
            failed: '❌',
            cancelled: '🚫'
        };
        return icons[status] || '📄';
    }
    
    getStatusText(download) {
        if (download.status === 'completed') {
            return `Completed - ${this.formatSize(download.size || 0)}`;
        } else if (download.status === 'failed') {
            return `Failed: ${download.error || 'Unknown error'}`;
        } else {
            return download.status;
        }
    }
    
    getActions(download) {
        if (download.status === 'downloading') {
            return `<button onclick="downloadManager.pauseDownload('${download.id}')">⏸️</button>`;
        } else if (download.status === 'paused') {
            return `<button onclick="downloadManager.resumeDownload('${download.id}')">▶️</button>`;
        } else if (download.status === 'completed') {
            return `<button onclick="downloadManager.openFile('${download.id}')">📂</button>`;
        }
        return '';
    }
    
    calculateSpeed(download) {
        if (download.status !== 'downloading') return '';
        
        const elapsed = (Date.now() - download.startTime) / 1000;
        const speed = download.downloaded / elapsed;
        
        return `${this.formatSize(speed)}/s`;
    }
    
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
    
    async openFile(downloadId) {
        const download = this.downloads.get(downloadId) || 
                        this.downloadHistory.find(d => d.id === downloadId);
        
        if (download && window.electronAPI && window.electronAPI.openFile) {
            await window.electronAPI.openFile(download.filename);
        } else {
            console.log(`Opening: ${download.filename}`);
        }
    }
}

// Create global instance
window.downloadManager = new DownloadManager();

// Add styles
const downloadStyles = `
<style>
.download-panel {
    position: fixed;
    right: 20px;
    top: 100px;
    width: 400px;
    max-height: 500px;
    background: rgba(30, 30, 40, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    z-index: 9998;
    opacity: 0;
    visibility: hidden;
    transform: translateX(20px);
    transition: all 0.3s ease;
}

.download-panel.visible {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

.download-header {
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.download-header h3 {
    margin: 0;
    color: #4ade80;
}

.download-close {
    background: none;
    border: none;
    color: #999;
    font-size: 1.5em;
    cursor: pointer;
}

.download-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

.download-item {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.download-icon {
    font-size: 1.5em;
    margin-right: 10px;
}

.download-info {
    flex: 1;
}

.download-name {
    color: #fff;
    font-weight: bold;
    margin-bottom: 3px;
}

.download-meta {
    font-size: 0.85em;
    color: #999;
}

.download-progress {
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    margin-top: 5px;
    overflow: hidden;
}

.download-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #22c55e);
    transition: width 0.3s ease;
}

.download-actions button {
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
    padding: 5px;
}

.download-footer {
    padding: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 10px;
}

.download-footer button {
    flex: 1;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
}

.download-footer button:hover {
    background: rgba(255, 255, 255, 0.2);
}
</style>
`;

// Add styles to page
document.head.insertAdjacentHTML('beforeend', downloadStyles);