/**
 * Downloads Overlay - Bottom Panel
 * 
 * Beautiful glass morphism panel for download management
 * Slides up from bottom, 200px tall
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../globals.css';
import { DownloadsPanel } from '../browser/DownloadsPanel';
import { Download } from '../electron-api';

function DownloadsOverlay() {
  const [downloads, setDownloads] = useState<Download[]>([]);

  const handleClose = () => {
    window.electronAPI?.hideOverlay('downloads');
  };

  const handleShowInFolder = async (id: string) => {
    try {
      await window.electronAPI?.showInFolder(id);
    } catch (error) {
      console.error('Failed to show in folder:', error);
    }
  };

  useEffect(() => {
    // Load downloads from backend
    const loadDownloads = async () => {
      try {
        const data = await window.electronAPI?.getDownloads();
        if (data) {
          setDownloads(data);
        }
      } catch (error) {
        console.error('Failed to load downloads:', error);
      }
    };
    loadDownloads();

    // Listen for download updates
    const interval = setInterval(loadDownloads, 1000);

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="h-full w-screen bg-transparent dark overflow-hidden">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-white/5 to-transparent backdrop-blur-xl" />
      
      {/* Border glow - top edge */}
      <div className="absolute inset-0 border-t-2 border-white/30 shadow-2xl" />
      
      {/* Content - Full height, no padding */}
      <div className="relative z-10 h-full">
        <DownloadsPanel 
          downloads={downloads}
          onClose={handleClose}
          onShowInFolder={handleShowInFolder}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DownloadsOverlay />
  </React.StrictMode>
);
