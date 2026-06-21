// Composant réutilisable BackButton.tsx
import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onBack, label = "Retour" }) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.altKey && e.key === 'ArrowLeft')) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  return (
    <button
      onClick={onBack}
      className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur border border-white/20 hover:border-white/30"
      aria-label={label}
    >
      <ChevronLeft className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
      <span className="text-white/70 group-hover:text-white transition-colors font-medium">
        {label}
      </span>
    </button>
  );
};