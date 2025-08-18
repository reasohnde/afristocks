import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Retour' }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
            <ArrowLeft className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
}; 