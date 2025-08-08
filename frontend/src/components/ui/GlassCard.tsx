// src/components/ui/GlassCard.tsx
import React, { ReactNode, MouseEvent, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'emerald' | 'sunset' | 'purple';
  onClick?: () => void;
  hoverable?: boolean;
  animated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  onClick,
  hoverable = true,
  animated = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const glowColors = {
    blue: 'rgba(74, 144, 226, 0.6)',
    emerald: 'rgba(0, 217, 163, 0.6)',
    sunset: 'rgba(255, 107, 53, 0.6)',
    purple: 'rgba(123, 97, 255, 0.6)',
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!animated) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePos({ x, y });
  };

  return (
    <div
      className={cn('relative group', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Glow Effect */}
      {glowColor && isHovered && (
        <div
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${glowColors[glowColor]}, transparent 50%)`,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Glass Card */}
      <div
        className={cn(
          'relative h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl rounded-2xl border border-white/10 p-6',
          hoverable && 'cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-white/20',
        )}
      >
        {/* Glass Reflection */}
        {animated && (
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: isHovered
                ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.1), transparent 40%)`
                : 'none'
            }}
          />
        )}

        {children}
      </div>
    </div>
  );
};