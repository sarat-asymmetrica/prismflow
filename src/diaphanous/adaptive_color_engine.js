// PrismFlow Browser - Adaptive Color Engine
// The magic that makes the browser breathe with your content

class AdaptiveColorEngine {
    constructor() {
        // Natural Asymmetry ratios for sampling
        this.EMERGENCE_RATIO = 0.3;  // Top portion - headers, heroes
        this.PRECISION_RATIO = 0.2;  // Middle - key content
        this.SUPPORT_RATIO = 0.5;    // Bottom - body content
        
        // Current state
        this.currentPalette = {
            dominant: '#ffffff',
            secondary: '#f0f0f0',
            accent: '#007bff',
            glow: 'rgba(255, 255, 255, 0.1)',
            isDark: false
        };
        
        // Transition state
        this.isTransitioning = false;
        this.transitionDuration = 600; // ms
        
        // Performance optimization
        this.sampleInterval = 1000; // Sample every second
        this.lastSample = 0;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Start monitoring
        this.startColorExtraction();
        
        // Listen for page changes
        if (window.navigation) {
            window.navigation.addEventListener('navigate', () => {
                this.extractColors();
            });
        }
        
        // Listen for theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.extractColors();
        });
    }
    
    startColorExtraction() {
        // Use requestAnimationFrame for smooth updates
        const extract = () => {
            const now = Date.now();
            
            // Throttle extraction for performance
            if (now - this.lastSample > this.sampleInterval) {
                this.extractColors();
                this.lastSample = now;
            }
            
            requestAnimationFrame(extract);
        };
        
        extract();
    }
    
    async extractColors() {
        // Get viewport canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Sample at lower resolution for performance
        const sampleWidth = 128;
        const sampleHeight = 128;
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        
        // Capture viewport colors
        const colors = await this.captureViewport();
        if (!colors || colors.length === 0) return;
        
        // Create gradient from captured colors instead of drawImage
        const gradient = ctx.createLinearGradient(0, 0, sampleWidth, sampleHeight);
        colors.forEach((color, i) => {
            gradient.addColorStop(i / colors.length, color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, sampleWidth, sampleHeight);
        
        // Extract colors from different regions (Natural Asymmetry)
        const regions = {
            emergence: this.sampleRegion(ctx, 0, 0, sampleWidth, sampleHeight * this.EMERGENCE_RATIO),
            precision: this.sampleRegion(ctx, 0, sampleHeight * 0.3, sampleWidth, sampleHeight * this.PRECISION_RATIO),
            support: this.sampleRegion(ctx, 0, sampleHeight * 0.5, sampleWidth, sampleHeight * this.SUPPORT_RATIO)
        };
        
        // Process colors
        const palette = this.processColors(regions);
        
        // Apply smooth transition
        this.transitionToPalette(palette);
    }
    
    async captureViewport() {
        // In real implementation, this would capture the rendered page
        // For demo, we'll analyze visible elements
        try {
            // Get all visible elements
            const elements = document.querySelectorAll('*');
            const colors = new Map();
            
            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                const bgColor = style.backgroundColor;
                const color = style.color;
                
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                    const count = colors.get(bgColor) || 0;
                    colors.set(bgColor, count + 1);
                }
                
                if (color && color !== 'rgba(0, 0, 0, 0)') {
                    const count = colors.get(color) || 0;
                    colors.set(color, count + 1);
                }
            });
            
            // Sort by frequency
            const sortedColors = Array.from(colors.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([color]) => color);
            
            return sortedColors;
        } catch (e) {
            console.error('Error capturing viewport:', e);
            return null;
        }
    }
    
    sampleRegion(ctx, x, y, width, height) {
        const imageData = ctx.getImageData(x, y, width, height);
        const pixels = imageData.data;
        
        // Color frequency map
        const colorMap = new Map();
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < pixels.length; i += 16) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];
            
            if (a > 0) {  // Ignore transparent pixels
                const hex = this.rgbToHex(r, g, b);
                const count = colorMap.get(hex) || 0;
                colorMap.set(hex, count + 1);
            }
        }
        
        // Get top 3 colors
        return Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([color]) => color);
    }
    
    processColors(regions) {
        // Combine regional colors with Natural Asymmetry weights
        const allColors = [
            ...regions.emergence.map(c => ({ color: c, weight: 0.3 })),
            ...regions.precision.map(c => ({ color: c, weight: 0.2 })),
            ...regions.support.map(c => ({ color: c, weight: 0.5 }))
        ];
        
        // Pick dominant colors
        const dominant = allColors[0]?.color || this.currentPalette.dominant;
        const secondary = allColors[1]?.color || this.currentPalette.secondary;
        const accent = allColors[2]?.color || this.currentPalette.accent;
        
        // Detect if dark mode
        const isDark = this.isColorDark(dominant);
        
        // Generate ambient glow
        const glow = this.generateGlow(dominant, secondary, accent, isDark);
        
        return {
            dominant,
            secondary,
            accent,
            glow,
            isDark
        };
    }
    
    generateGlow(primary, secondary, accent, isDark) {
        const opacity = isDark ? 0.15 : 0.08;
        
        return `
            radial-gradient(
                circle at 30% 20%,
                ${primary}${Math.floor(opacity * 255).toString(16)} 0%,
                transparent 50%
            ),
            radial-gradient(
                circle at 70% 80%,
                ${secondary}${Math.floor(opacity * 0.8 * 255).toString(16)} 0%,
                transparent 50%
            ),
            linear-gradient(
                135deg,
                ${accent}${Math.floor(opacity * 0.5 * 255).toString(16)} 0%,
                transparent 100%
            )
        `;
    }
    
    transitionToPalette(newPalette) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const startPalette = { ...this.currentPalette };
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);
            
            // Natural Asymmetry easing curve
            const eased = this.naturalAsymmetryEasing(progress);
            
            // Interpolate colors
            this.currentPalette = {
                dominant: this.interpolateColor(startPalette.dominant, newPalette.dominant, eased),
                secondary: this.interpolateColor(startPalette.secondary, newPalette.secondary, eased),
                accent: this.interpolateColor(startPalette.accent, newPalette.accent, eased),
                glow: newPalette.glow, // Instant glow change
                isDark: newPalette.isDark
            };
            
            // Apply to UI
            this.applyPalette();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isTransitioning = false;
            }
        };
        
        animate();
    }
    
    naturalAsymmetryEasing(t) {
        // Custom easing based on Natural Asymmetry
        if (t < 0.3) {
            // Emergence phase - quick start
            return 4 * t * t * t;
        } else if (t < 0.5) {
            // Precision phase - accurate middle
            return 0.3 + (t - 0.3) * 3.5;
        } else {
            // Support phase - smooth finish
            return 1 - Math.pow(1 - t, 3) * 0.2;
        }
    }
    
    applyPalette() {
        const root = document.documentElement;
        
        // Set CSS variables
        root.style.setProperty('--dominant-color', this.currentPalette.dominant);
        root.style.setProperty('--secondary-color', this.currentPalette.secondary);
        root.style.setProperty('--accent-color', this.currentPalette.accent);
        root.style.setProperty('--ambient-glow', this.currentPalette.glow);
        
        // Set text color based on background
        const textColor = this.currentPalette.isDark ? 
            'rgba(255, 255, 255, 0.9)' : 
            'rgba(0, 0, 0, 0.8)';
        root.style.setProperty('--adaptive-text-color', textColor);
        
        // Notify Chrome process if in CEF/Electron
        if (window.cefQuery || window.electronAPI) {
            this.notifyBrowser(this.currentPalette);
        }
    }
    
    // Utility functions
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    isColorDark(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return false;
        
        // Calculate luminance
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance < 0.5;
    }
    
    interpolateColor(start, end, progress) {
        const startRgb = this.hexToRgb(start);
        const endRgb = this.hexToRgb(end);
        
        if (!startRgb || !endRgb) return end;
        
        const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * progress);
        const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * progress);
        const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * progress);
        
        return this.rgbToHex(r, g, b);
    }
    
    notifyBrowser(palette) {
        // Send palette to browser chrome for UI adaptation
        const message = {
            type: 'paletteUpdate',
            palette: palette
        };
        
        if (window.cefQuery) {
            // CEF communication
            window.cefQuery({
                request: JSON.stringify(message),
                persistent: false,
                onSuccess: () => {},
                onFailure: () => {}
            });
        } else if (window.electronAPI) {
            // Electron communication
            window.electronAPI.send('palette-update', message);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adaptiveColorEngine = new AdaptiveColorEngine();
    });
} else {
    window.adaptiveColorEngine = new AdaptiveColorEngine();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveColorEngine;
}