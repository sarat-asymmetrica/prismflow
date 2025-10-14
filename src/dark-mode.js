// PrismFlow Browser - Dark Mode System
// Natural Asymmetry: 30% Theme Discovery, 20% Color Precision, 50% UI Support

class DarkModeSystem {
    constructor() {
        // Natural Asymmetry distribution
        this.THEME_DISCOVERY = 0.3;  // Detect user preference
        this.COLOR_PRECISION = 0.2;  // Precise color calculations  
        this.UI_SUPPORT = 0.5;       // Apply throughout UI
        
        this.currentTheme = 'dark'; // Default to dark (we're already dark!)
        this.init();
    }
    
    init() {
        // Check system preference
        this.detectSystemPreference();
        
        // Load saved preference
        this.loadSavedTheme();
        
        // Create toggle button
        this.createToggleButton();
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system changes
        this.watchSystemChanges();
    }
    
    detectSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.systemPreference = 'dark';
        } else {
            this.systemPreference = 'light';
        }
    }
    
    loadSavedTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            this.currentTheme = saved;
        } else {
            this.currentTheme = this.systemPreference || 'dark';
        }
    }
    
    createToggleButton() {
        // Add to toolbar
        const toolbar = document.querySelector('.browser-toolbar');
        if (!toolbar) return;
        
        const themeBtn = document.createElement('button');
        themeBtn.className = 'nav-btn';
        themeBtn.id = 'theme-toggle-btn';
        themeBtn.title = 'Toggle Dark/Light Mode';
        themeBtn.innerHTML = this.currentTheme === 'dark' ? 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>` :
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>`;
        
        themeBtn.addEventListener('click', () => this.toggleTheme());
        
        // Insert before downloads button
        const downloadsBtn = document.getElementById('downloads-btn');
        if (downloadsBtn) {
            toolbar.insertBefore(themeBtn, downloadsBtn);
        } else {
            toolbar.appendChild(themeBtn);
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Update button icon
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = this.currentTheme === 'dark' ? 
                `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>` :
                `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>`;
        }
        
        // Animate the transition
        this.animateTransition();
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            // Light theme colors
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f5f5f5');
            root.style.setProperty('--bg-tertiary', '#e0e0e0');
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#4a4a4a');
            root.style.setProperty('--text-tertiary', '#6a6a6a');
            root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--accent-color', '#2563eb');
            root.style.setProperty('--success-color', '#16a34a');
            root.style.setProperty('--warning-color', '#eab308');
            root.style.setProperty('--error-color', '#dc2626');
            
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            // Dark theme colors (original)
            root.style.setProperty('--bg-primary', '#1a1a2e');
            root.style.setProperty('--bg-secondary', '#16213e');
            root.style.setProperty('--bg-tertiary', '#0f3460');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#e0e0e0');
            root.style.setProperty('--text-tertiary', '#a0a0a0');
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
            root.style.setProperty('--accent-color', '#4ade80');
            root.style.setProperty('--success-color', '#22c55e');
            root.style.setProperty('--warning-color', '#fbbf24');
            root.style.setProperty('--error-color', '#ef4444');
            
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        }
        
        // Emit theme change event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }
    
    animateTransition() {
        // Create a smooth transition overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.currentTheme === 'dark' ? '#000' : '#fff'};
            opacity: 0;
            pointer-events: none;
            z-index: 99999;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            overlay.style.opacity = '0.5';
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }, 150);
        });
    }
    
    watchSystemChanges() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                this.systemPreference = e.matches ? 'dark' : 'light';
                
                // Only auto-switch if user hasn't manually set preference
                if (!localStorage.getItem('theme')) {
                    this.currentTheme = this.systemPreference;
                    this.applyTheme(this.currentTheme);
                }
            });
        }
    }
}

// Add CSS variables and transitions
const darkModeStyles = `
<style>
:root {
    /* Default dark theme */
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-tertiary: #0f3460;
    --text-primary: #ffffff;
    --text-secondary: #e0e0e0;
    --text-tertiary: #a0a0a0;
    --border-color: rgba(255, 255, 255, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.5);
    --accent-color: #4ade80;
    --success-color: #22c55e;
    --warning-color: #fbbf24;
    --error-color: #ef4444;
}

/* Smooth transitions for theme changes */
body, .browser-container, .tab-bar, .browser-toolbar, .nav-bar, .status-bar {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Update existing styles to use CSS variables */
body.light-theme {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

body.light-theme .browser-container {
    background: var(--bg-secondary);
    box-shadow: 0 20px 60px var(--shadow-color);
}

body.light-theme .tab-bar,
body.light-theme .browser-toolbar,
body.light-theme .nav-bar,
body.light-theme .status-bar {
    background: var(--bg-primary);
    border-color: var(--border-color);
}

body.light-theme .tab,
body.light-theme .nav-btn,
body.light-theme .toolbar-btn {
    color: var(--text-primary);
    background: var(--bg-tertiary);
}

body.light-theme .tab:hover,
body.light-theme .nav-btn:hover,
body.light-theme .toolbar-btn:hover {
    background: var(--accent-color);
    color: white;
}

body.light-theme #url-bar {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--border-color);
}

body.light-theme .tab.active {
    background: var(--accent-color);
    color: white;
}

/* Theme toggle button styles */
#theme-toggle-btn {
    color: var(--warning-color);
}

#theme-toggle-btn:hover {
    background: rgba(251, 191, 36, 0.1);
}
</style>
`;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add styles
    document.head.insertAdjacentHTML('beforeend', darkModeStyles);
    
    // Initialize dark mode system
    window.darkModeSystem = new DarkModeSystem();
    
    console.log('🌓 Dark Mode System initialized - Natural Asymmetry powered!');
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeSystem;
}