/**
 * Settings Overlay - Center Modal
 * 
 * Beautiful glass morphism modal for browser settings
 * Fades in center, 800x600
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../globals.css';
import { Settings as SettingsIcon, X, Home, Search, Moon, Shield, Download as DownloadIcon } from 'lucide-react';
import { Settings } from '../electron-api';

function SettingsOverlay() {
  const [settings, setSettings] = useState<Settings>({
    homepage: 'https://www.google.com',
    searchEngine: 'google',
    darkMode: true,
    autoSaveSession: true,
    blockPopups: true,
    enableJavaScript: true,
    enableImages: true,
    enableNotifications: true,
    clearOnExit: false,
    downloadPath: ''
  });

  useEffect(() => {
    // Load settings from backend
    const loadSettings = async () => {
      try {
        const data = await window.electronAPI?.getSettings();
        if (data) setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = async (key: keyof Settings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    
    try {
      await window.electronAPI?.updateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleClose = () => {
    window.electronAPI?.hideOverlay('settings');
  };

  return (
    <div className="h-screen w-screen bg-transparent dark overflow-hidden flex items-center justify-center">
      {/* Backdrop - click to close */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal Card */}
      <div className="relative z-10 w-full h-full max-w-4xl max-h-[600px] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl" />
        
        {/* Border glow */}
        <div className="absolute inset-0 border border-white/20 rounded-2xl" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-semibold text-white">Settings</h1>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-300"
              aria-label="Close settings"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* General Section */}
            <section>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">General</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Homepage</div>
                      <div className="text-sm text-gray-400">URL to open on new tabs</div>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={settings.homepage}
                    onChange={(e) => handleChange('homepage', e.target.value)}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm outline-none focus:border-blue-400 w-64"
                    aria-label="Homepage URL"
                    placeholder="https://www.google.com"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Search Engine</div>
                      <div className="text-sm text-gray-400">Default search provider</div>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={settings.searchEngine}
                    onChange={(e) => handleChange('searchEngine', e.target.value)}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm outline-none focus:border-blue-400 w-64"
                    aria-label="Search Engine URL"
                    placeholder="https://www.google.com/search?q="
                  />
                </div>
              </div>
            </section>

            {/* Appearance Section */}
            <section>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Appearance</h2>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Dark Mode</div>
                    <div className="text-sm text-gray-400">Use dark theme</div>
                  </div>
                </div>
                <button
                  onClick={() => handleChange('darkMode', !settings.darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-500' : 'bg-gray-600'}`}
                  aria-label={`Dark mode ${settings.darkMode ? 'enabled' : 'disabled'}`}
                  title={`Toggle dark mode (currently ${settings.darkMode ? 'on' : 'off'})`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </section>

            {/* Privacy Section */}
            <section>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Privacy & Security</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Block Popups</div>
                      <div className="text-sm text-gray-400">Prevent unwanted popups</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('blockPopups', !settings.blockPopups)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.blockPopups ? 'bg-blue-500' : 'bg-gray-600'}`}
                    aria-label={`Block popups ${settings.blockPopups ? 'enabled' : 'disabled'}`}
                    title={`Toggle popup blocking (currently ${settings.blockPopups ? 'on' : 'off'})`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.blockPopups ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Clear Data on Exit</div>
                      <div className="text-sm text-gray-400">Delete history and cookies when closing</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('clearOnExit', !settings.clearOnExit)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.clearOnExit ? 'bg-blue-500' : 'bg-gray-600'}`}
                    aria-label={`Clear data on exit ${settings.clearOnExit ? 'enabled' : 'disabled'}`}
                    title={`Toggle clear on exit (currently ${settings.clearOnExit ? 'on' : 'off'})`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.clearOnExit ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Downloads Section */}
            <section>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Downloads</h2>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <DownloadIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Download Location</div>
                    <div className="text-sm text-gray-400">Where files are saved</div>
                  </div>
                </div>
                <input
                  type="text"
                  value={settings.downloadPath || 'Default'}
                  onChange={(e) => handleChange('downloadPath', e.target.value)}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm outline-none focus:border-blue-400 w-64"
                  aria-label="Download Location"
                  placeholder="C:\Users\Downloads"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsOverlay />
  </React.StrictMode>
);
