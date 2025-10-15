/**
 * History Overlay - Left Panel
 * 
 * Beautiful glass morphism panel for browsing history
 * Slides in from left, 320px wide
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../globals.css';
import { HistoryPanel } from '../browser/HistoryPanel';
import { HistoryEntry } from '../electron-api';

function HistoryOverlay() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handleClose = () => {
    window.electronAPI?.hideOverlay('history');
  };

  const handleNavigate = async (url: string) => {
    await window.electronAPI?.navigate(url);
    // Close overlay after navigation
    handleClose();
  };

  useEffect(() => {
    // Load history from backend
    const loadHistory = async () => {
      try {
        const data = await window.electronAPI?.getHistory();
        if (data) setHistory(data);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };
    loadHistory();

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-full bg-transparent dark overflow-hidden">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl" />
      
      {/* Border glow - right edge */}
      <div className="absolute inset-0 border-r-2 border-white/30 shadow-2xl" />
      
      {/* Content - Full height, no padding */}
      <div className="relative z-10 h-full">
        <HistoryPanel 
          history={history}
          onNavigate={handleNavigate}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HistoryOverlay />
  </React.StrictMode>
);
