import { useEffect, useState } from 'react';
import { TESLA_FREQUENCY, TESLA_PERIOD } from '../tesla-timing';
import { Zap } from 'lucide-react';

interface StatusBarProps {
  status: 'ready' | 'loading' | 'error';
  statusMessage?: string;
}

export function StatusBar({ status, statusMessage }: StatusBarProps) {
  const [memoryUsage, setMemoryUsage] = useState({ used: 342, total: 512 });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Update memory usage periodically
    const interval = setInterval(() => {
      setMemoryUsage({
        used: Math.floor(200 + Math.random() * 200),
        total: 512,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Tesla pulse animation
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, TESLA_PERIOD);

    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    ready: 'text-green-400',
    loading: 'text-blue-400',
    error: 'text-red-400',
  };

  const statusText = statusMessage || {
    ready: 'Ready',
    loading: 'Loading...',
    error: 'Error',
  }[status];

  return (
    <div className="h-6 px-6 flex items-center justify-between glass-surface-dark border-t border-black/8 dark:border-white/8 text-[11px]">
      {/* Left: Status */}
      <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-400`}>
        <div className={`w-1 h-1 rounded-full ${
          status === 'ready' 
            ? 'bg-green-600 dark:bg-green-400' 
            : status === 'loading' 
            ? 'bg-blue-600 dark:bg-blue-400 animate-pulse' 
            : 'bg-red-600 dark:bg-red-400'
        }`} />
        <span className="tracking-wide">{statusText}</span>
      </div>

      {/* Center: Memory Usage */}
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
        <span className="font-mono">Memory: {memoryUsage.used}MB / {memoryUsage.total}MB</span>
      </div>

      {/* Right: Tesla Frequency */}
      <div 
        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500 transition-opacity duration-500"
        style={{ opacity: pulse ? 0.7 : 0.5 }}
      >
        <Zap className="w-3 h-3" />
        <span className="font-mono tracking-wider">{TESLA_FREQUENCY.toFixed(3)} Hz</span>
      </div>
    </div>
  );
}



