// src/components/home/HeroSection.tsx
import React from 'react';
import { Sparkles, ArrowUpRight, Wallet, Briefcase, Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface HeroSectionProps {
  isAuthenticated: boolean;
  user?: any;
  onShowAuth: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  user,
  onShowAuth
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden animate-fade-in">
      {/* Background avec gradient animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-600/10 to-emerald-600/20 animate-gradient" />

      {/* Content */}
      <div className="relative glass-heavy p-8 md:p-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 backdrop-blur-xl mb-6">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-300">
            Plateforme d'investissement #1 en Afrique
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            Bienvenue sur{' '}
          </span>
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent animate-gradient">
            AfriStocks
          </span>
        </h1>

        <p className="text-xl text-white/70 mb-8 max-w-2xl">
          Investissez dans l'avenir de l'Afrique en soutenant des startups innovantes
        </p>

        {isAuthenticated ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="group" hoverable={false}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/60">Solde disponible</p>
                <Wallet className="w-5 h-5 text-blue-400 opacity-60" />
              </div>
              <p className="text-3xl font-bold text-white">
                {user?.balance?.toLocaleString() || 0} XOF
              </p>
              <div className="mt-2 flex items-center text-sm text-emerald-400">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+2.5% ce mois</span>
              </div>
            </GlassCard>

            <GlassCard className="group" hoverable={false}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/60">Valeur du portfolio</p>
                <Briefcase className="w-5 h-5 text-emerald-400 opacity-60" />
              </div>
              <p className="text-3xl font-bold text-white">
                {user?.portfolio?.toLocaleString() || 0} XOF
              </p>
              <div className="mt-2 flex items-center text-sm text-emerald-400">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+{user?.returns || 0}% total</span>
              </div>
            </GlassCard>

            <GlassCard className="group" hoverable={false}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/60">Rendement annuel</p>
                <Activity className="w-5 h-5 text-orange-400 opacity-60" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                +{user?.returns || 0}%
              </p>
              <div className="mt-2 text-sm text-white/60">
                Performance excellente
              </div>
            </GlassCard>
          </div>
        ) : (
          <button
            onClick={onShowAuth}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Commencer à investir
          </button>
        )}
      </div>
    </div>
  );
};