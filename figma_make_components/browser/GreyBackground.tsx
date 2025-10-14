import { useEffect, useState } from 'react';

interface GreyBackgroundProps {
  isDark?: boolean;
}

export function GreyBackground({ isDark = true }: GreyBackgroundProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      // Gentle breathing effect - very slow oscillation
      setOffset(Math.sin(frame * 0.005) * 5);
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Base gradient */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
            : 'linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)',
        }}
      />
      
      {/* Gentle animated overlay */}
      <div 
        className="absolute inset-0 opacity-20 transition-transform duration-1000 ease-in-out"
        style={{
          background: isDark
            ? `radial-gradient(circle at 50% ${50 + offset}%, rgba(40, 40, 40, 0.3) 0%, transparent 50%)`
            : `radial-gradient(circle at 50% ${50 + offset}%, rgba(255, 255, 255, 0.6) 0%, transparent 50%)`,
        }}
      />

      {/* Subtle noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}



