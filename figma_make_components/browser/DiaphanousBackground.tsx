import { useEffect, useRef } from 'react';
import { TESLA_PERIOD } from '../tesla-timing';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

interface DiaphanousBackgroundProps {
  particleCount?: number;
  isDark?: boolean;
}

export function DiaphanousBackground({ 
  particleCount = 75, 
  isDark = true 
}: DiaphanousBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with natural asymmetry (30/20/50 distribution)
    particlesRef.current = Array.from({ length: particleCount }, () => {
      const rand = Math.random();
      let x: number;
      
      // Apply 30/20/50 asymmetry ratio to horizontal distribution
      if (rand < 0.3) {
        x = Math.random() * (canvas.width * 0.3); // Left 30%
      } else if (rand < 0.5) {
        x = canvas.width * 0.3 + Math.random() * (canvas.width * 0.2); // Center 20%
      } else {
        x = canvas.width * 0.5 + Math.random() * (canvas.width * 0.5); // Right 50%
      }

      return {
        x,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, // Slow drift
        vy: (Math.random() - 0.5) * 0.5,
        opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7 opacity
        size: 2 + Math.random() * 2, // 2-4px size
      };
    });

    // Animation loop with Tesla timing
    const animate = (timestamp: number) => {
      // Update particles only every Tesla period (203.7ms)
      if (timestamp - lastUpdateRef.current >= TESLA_PERIOD) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particlesRef.current.forEach(particle => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Wrap around screen edges
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = isDark 
            ? `rgba(255, 255, 255, ${particle.opacity})`
            : `rgba(0, 0, 0, ${particle.opacity})`;
          ctx.fill();
        });

        lastUpdateRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}



