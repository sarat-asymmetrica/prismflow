import { useState, useEffect } from 'react';
import LiquidGlassShader from '../effects/LiquidGlassShader';

interface LiquidGlassBackgroundProps {
  isDark?: boolean;
}

export function LiquidGlassBackground({ isDark = true }: LiquidGlassBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: window.innerHeight - e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const uniforms = {
    time: 0,
    width: 800,
    height: 600,
    mouseX: mousePosition.x,
    mouseY: mousePosition.y,
    tintR: isDark ? 0.85 : 1.0,
    tintG: isDark ? 0.85 : 1.0,
    tintB: isDark ? 0.95 : 1.0,
    saturation: 1.3,
    distortion: 1.0,
    blur: 1.5,
    glassMode: isDark ? 'dark' as const : 'light' as const,
    shadowIntensity: 0.3,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 20,
    cornerRadius: 0,
    chromaticAberration: 0.5,
    shape: 'rectangle',
    donutThickness: 0.3,
    starPoints: 5,
    starInnerRadius: 0.5,
  };

  const backgroundMedia = {
    url: 'https://images.unsplash.com/photo-1673526759317-be71a1243e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdyYWRpZW50JTIwcHVycGxlJTIwYmx1ZXxlbnwxfHx8fDE3NjAzOTc2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'image' as const,
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      <LiquidGlassShader
        backgroundMedia={backgroundMedia}
        uniforms={uniforms}
        className="w-full h-full"
      />
      
      {/* Overlay gradient for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(10, 10, 20, 0.4) 100%)'
            : 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(255, 255, 255, 0.3) 100%)',
        }}
      />
    </div>
  );
}



