// src/components/effects/BackgroundOrbs.tsx
import React from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';

export const BackgroundOrbs: React.FC = () => {
  const mousePosition = useMousePosition();

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Sunset Orb */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          top: '-20%',
          right: '-10%',
          transition: 'transform 0.3s ease-out'
        }}
      />
      
      {/* Emerald Orb */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,217,163,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`,
          bottom: '-20%',
          left: '-10%',
          transition: 'transform 0.3s ease-out'
        }}
      />
      
      {/* Purple Orb */}
      <div 
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(123,97,255,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};