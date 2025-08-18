import React from 'react';
import { TrendingUp, Shield, Users, Clock, ArrowRight, Star } from 'lucide-react';

interface InvestmentFundCardProps {
  onPress: () => void;
}

const InvestmentFundCard: React.FC<InvestmentFundCardProps> = ({ onPress }) => {
  return (
    <div
      onClick={onPress}
      className="group relative bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-emerald-500/10 backdrop-blur-2xl rounded-3xl border border-orange-500/20 p-8 cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-orange-500/40 hover:shadow-2xl"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/3 to-emerald-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 mb-3">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Fonds exclusif</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AfriStocks Capital Fund</h3>
            <p className="text-white/70 text-lg">
              Investissez dans l&apos;avenir de l&apos;Afrique avec notre fonds diversifié
            </p>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <p className="text-sm text-white/60 mb-1">Montant cible</p>
            <p className="text-xl font-bold text-white">50M XOF</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <p className="text-sm text-white/60 mb-1">Levé</p>
            <p className="text-xl font-bold text-emerald-400">15M XOF</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <p className="text-sm text-white/60 mb-1">Investisseurs</p>
            <p className="text-xl font-bold text-white">124</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <p className="text-sm text-white/60 mb-1">Rendement</p>
            <p className="text-xl font-bold text-emerald-400">15-25%</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Sécurisé</p>
              <p className="text-xs text-white/60">Fonds protégés</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Diversifié</p>
              <p className="text-xs text-white/60">20+ startups</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Flexible</p>
              <p className="text-xs text-white/60">Sortie 3-5 ans</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Progression</span>
            <span className="text-sm font-medium text-white">30%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300"
              style={{ width: '30%' }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          <span>Investir maintenant</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-white/50 text-center mt-4">
          Investissement minimum : 50 000 XOF • Durée : 3-5 ans
        </p>
      </div>
    </div>
  );
};

export default InvestmentFundCard;