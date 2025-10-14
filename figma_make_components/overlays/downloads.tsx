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

interface DownloadItem {
  filename: string;
  url: string;
  status: 'downloading' | 'completed' | 'failed';
  progress: number;
  size: string;
}

// Convert Download to DownloadItem
function convertDownload(download: Download): DownloadItem {
  const progress = download.totalBytes > 0 
    ? (download.receivedBytes / download.totalBytes) * 100 
    : 0;
    
  const status = download.state === 'completed' ? 'completed' 
    : download.state === 'progressing' ? 'downloading'
    : 'failed';
    
  const size = `${(download.totalBytes / 1024 / 1024).toFixed(2)} MB`;
  
  return {
    filename: download.filename,
    url: download.url,
    status,
    progress,
    size
  };
}

function DownloadsOverlay() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  useEffect(() => {
    // Load downloads from backend
    const loadDownloads = async () => {
      try {
        const data = await window.electronAPI?.getDownloads();
        if (data) {
          const converted = data.map(convertDownload);
          setDownloads(converted);
        }
      } catch (error) {
        console.error('Failed to load downloads:', error);
      }
    };
    loadDownloads();

    // Listen for download updates
    const interval = setInterval(loadDownloads, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="h-full w-screen bg-transparent dark overflow-hidden">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-white/5 to-transparent backdrop-blur-xl" />
      
      {/* Border glow */}
      <div className="absolute inset-0 border-t border-white/20 shadow-2xl" />
      
      {/* Content */}
      <div className="relative z-10 h-full p-4">
        <DownloadsPanel 
          downloads={downloads}
          onClose={handleClose}
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
