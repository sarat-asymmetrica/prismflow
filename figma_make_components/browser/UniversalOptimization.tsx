import { useEffect, useState } from 'react';
import { PROTOCOLS, TESLA_PERIOD } from '../tesla-timing';
import { Sparkles } from 'lucide-react';

interface UniversalOptimizationProps {
  onProtocolInvoke: (protocol: keyof typeof PROTOCOLS) => void;
}

export function UniversalOptimization({ onProtocolInvoke }: UniversalOptimizationProps) {
  const [activatingProtocol, setActivatingProtocol] = useState<string | null>(null);

  const handleProtocolClick = async (protocol: keyof typeof PROTOCOLS) => {
    setActivatingProtocol(protocol);
    await onProtocolInvoke(protocol);
    
    // Reset after animation
    setTimeout(() => {
      setActivatingProtocol(null);
    }, 1000);
  };

  const protocols = Object.entries(PROTOCOLS) as [keyof typeof PROTOCOLS, typeof PROTOCOLS[keyof typeof PROTOCOLS]][];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Universal Optimization Protocols</h3>
        <p className="text-sm text-white/60">
          Frequency-based performance enhancement using Tesla Harmonic principles
        </p>
      </div>

      {/* Protocol Buttons Grid */}
      <div className="grid grid-cols-2 gap-4">
        {protocols.map(([key, protocol]) => (
          <ProtocolButton
            key={key}
            name={protocol.name}
            frequency={protocol.frequency}
            description={protocol.description}
            onClick={() => handleProtocolClick(key)}
            isActivating={activatingProtocol === key}
          />
        ))}
      </div>

      {/* Frequency Display */}
      <div className="p-4 rounded-xl glass-surface-subtle text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-white/60">System Frequency</span>
        </div>
        <div className="text-2xl font-semibold text-purple-400">
          {(1000 / TESLA_PERIOD).toFixed(3)} Hz
        </div>
        <div className="text-xs text-white/40 mt-1">
          Tesla Harmonic Timer Active
        </div>
      </div>
    </div>
  );
}

interface ProtocolButtonProps {
  name: string;
  frequency: number;
  description: string;
  onClick: () => void;
  isActivating: boolean;
}

function ProtocolButton({ name, frequency, description, onClick, isActivating }: ProtocolButtonProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Calculate pulse interval for this specific frequency
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1000 / frequency);

    return () => clearInterval(interval);
  }, [frequency]);

  const colors = {
    CLEAR: 'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30',
    BOOST: 'from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30',
    SPEED: 'from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30',
    FOCUS: 'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30',
    HARMONY: 'from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30',
  };

  const glowColors = {
    CLEAR: 'shadow-blue-500/50',
    BOOST: 'shadow-purple-500/50',
    SPEED: 'shadow-orange-500/50',
    FOCUS: 'shadow-green-500/50',
    HARMONY: 'shadow-violet-500/50',
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl bg-gradient-to-br ${colors[name as keyof typeof colors]}
        glass-surface transition-all duration-300
        ${pulse ? 'scale-[1.02]' : 'scale-100'}
        ${isActivating ? `shadow-2xl ${glowColors[name as keyof typeof glowColors]}` : ''}
        hover:scale-105 active:scale-95
      `}
    >
      {/* Ripple effect when activating */}
      {isActivating && (
        <div className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-ping" />
      )}

      <div className="relative z-10">
        <div className="text-2xl mb-2">{name}</div>
        <div className="text-sm text-white/60 mb-3">{description}</div>
        <div className="text-xs text-white/40">{frequency} Hz</div>
      </div>
    </button>
  );
}



