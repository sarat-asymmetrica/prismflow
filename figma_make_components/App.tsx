import { MinimalChrome } from './browser/MinimalChrome';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="h-screen w-screen bg-transparent dark">
      {/* Grey gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10" />
      
      {/* Minimal Chrome (80px) - Tab Bar + Address Bar */}
      <MinimalChrome />
      
      {/* BrowserView renders below chrome automatically via Electron */}
      {/* No DOM element needed here - BrowserView is native Chromium */}
      
      <Toaster 
        theme="dark" 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}



