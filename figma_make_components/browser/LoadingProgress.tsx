import { useEffect, useState } from 'react';

interface LoadingProgressProps {
  isLoading: boolean;
}

export function LoadingProgress({ isLoading }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress
      const intervals = [
        setTimeout(() => setProgress(30), 100),
        setTimeout(() => setProgress(60), 300),
        setTimeout(() => setProgress(80), 600),
        setTimeout(() => setProgress(95), 1000),
      ];

      return () => intervals.forEach(clearTimeout);
    } else {
      // Complete the progress
      setProgress(100);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 z-50 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}



