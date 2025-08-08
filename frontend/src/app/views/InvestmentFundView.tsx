// frontend/src/app/views/InvestmentFundView.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, Users, Clock, Target, Shield, Award, 
  ChevronRight, Mail, Phone, MessageCircle, AlertCircle,
  CheckCircle, ArrowUpRight, BarChart3, DollarSign
} from 'lucide-react';

interface Props {
  setActiveView: (view: string) => void;
  setCheckoutData: (data: any) => void;
  isAuthenticated: boolean;
  user: any;
}

const InvestmentFundView: React.FC<Props> = ({ 
  setActiveView, 
  setCheckoutData, 
  isAuthenticated, 
  user 
}) => {
  const [investmentAmount, setInvestmentAmount] = useState('');

  const fundData = {
    name: "Fonds de Croissance AfriStocks",
    tagline: "Investir dans l'innovation africaine",
    description: "Un fonds diversifié investissant dans les startups technologiques les plus prometteuses d'Afrique. Notre équipe d'experts sélectionne rigoureusement les meilleures opportunités pour maximiser vos rendements.",
    targetAmount: 50000,
    raisedAmount: 15000,
    minInvestment: 50,
    expectedReturn: "15-25%",
    duration: "3-5 ans",
    investors: 124,
    features: [
      { icon: Shield, title: "Sécurisé", description: "Vos investissements sont protégés" },
      { icon: Award, title: "Rendement élevé", description: "15-25% de retour annuel estimé" },
      { icon: Users, title: "Diversifié", description: "Portfolio de 20+ startups" },
      { icon: Clock, title: "Flexible", description: "Sortie possible après 3 ans" }
    ],
    sectors: [
      { name: "FinTech", percentage: 35 },
      { name: "HealthTech", percentage: 25 },
      { name: "AgriTech", percentage: 20 },
      { name: "EdTech", percentage: 15 },
      { name: "Autres", percentage: 5 }
    ]
  };

  const handleInvestment = () => {
    if (!isAuthenticated) {
      // Rediriger vers la connexion
      return;
    }
    
    const amount = parseFloat(investmentAmount);
    if (amount >= fundData.minInvestment) {
      setCheckoutData({
        fundData,
        amount
      });
      setActiveView('investment-checkout');
    }
  };

  const progressPercentage = (fundData.raisedAmount / fundData.targetAmount) * 100;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent"></div>
        <div className="relative p-8 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl mb-6">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Opportunité d'investissement</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {fundData.name}
            </h1>
            <p className="text-xl text-white/80 mb-8">
              {fundData.tagline}
            </p>
            
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-white/80">{fundData.investors} investisseurs</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                <span className="text-white/80">{fundData.expectedReturn} de rendement</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-white/80">{fundData.duration}</span>
              </div>
            </div>

            <button
              onClick={() => document.getElementById('invest-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center gap-2"
            >
              Investir maintenant
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-white/60 mb-1">Montant levé</p>
            <p className="text-3xl font-bold text-white">
              {fundData.raisedAmount.toLocaleString()}€
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 mb-1">Objectif</p>
            <p className="text-2xl font-semibold text-white/80">
              {fundData.targetAmount.toLocaleString()}€
            </p>
          </div>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <p className="text-sm text-white/60 mt-2">
          {progressPercentage.toFixed(1)}% de l'objectif atteint
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fundData.features.map((feature, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
            <feature.icon className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-white/60 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* About Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">À propos du fonds</h2>
          <p className="text-white/80 mb-6 leading-relaxed">
            {fundData.description}
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Gestion professionnelle</p>
                <p className="text-white/60 text-sm">Notre équipe d'experts sélectionne les meilleures opportunités</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Diversification optimale</p>
                <p className="text-white/60 text-sm">Répartition du risque sur plusieurs secteurs porteurs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Transparence totale</p>
                <p className="text-white/60 text-sm">Rapports mensuels sur la performance du fonds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Répartition sectorielle</h2>
          <div className="space-y-4">
            {fundData.sectors.map((sector, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80">{sector.name}</span>
                  <span className="text-white font-medium">{sector.percentage}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    style={{ width: `${sector.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investment Section */}
      <div id="invest-section" className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Investir dans le fonds</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-white/80 mb-2">Montant de l'investissement</label>
            <div className="relative">
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder={`Minimum ${fundData.minInvestment}€`}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">€</span>
            </div>
            
            <div className="flex gap-2 mt-4">
              {[100, 500, 1000, 5000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setInvestmentAmount(amount.toString())}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                >
                  {amount}€
                </button>
              ))}
            </div>
            
            {investmentAmount && parseFloat(investmentAmount) >= fundData.minInvestment && (
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-300 text-sm mb-2">Estimation de rendement annuel</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {(parseFloat(investmentAmount) * 0.15).toFixed(0)}€ - {(parseFloat(investmentAmount) * 0.25).toFixed(0)}€
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium mb-1">Avertissement</p>
                  <p className="text-amber-200/80 text-sm">
                    L'investissement comporte des risques. Les performances passées ne garantissent pas les résultats futurs.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleInvestment}
              disabled={!investmentAmount || parseFloat(investmentAmount) < fundData.minInvestment}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer vers le paiement
            </button>
            
            <div className="flex justify-center gap-4 text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                WhatsApp
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Phone className="w-4 h-4 inline mr-1" />
                Appeler
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentFundView;