import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Plus, Download, Filter, Calendar, Eye, EyeOff, Activity } from 'lucide-react';
import { walletService } from '../../services/api';

interface PortfolioViewProps {
  isAuthenticated: boolean;
  user: any;
  setActiveView: (view: string) => void;
  setAuthMode: (mode: string) => void;
  setShowAuthModal: (show: boolean) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({
  isAuthenticated,
  user,
  setActiveView,
  setAuthMode,
  setShowAuthModal
}) => {
  const [timeRange, setTimeRange] = useState('1M');
  const [showBalances, setShowBalances] = useState(true);

  // Solde réel du portefeuille (GET /api/wallet/balance) — le token passe par le cookie auth_token
  const [wallet, setWallet] = useState<any>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    walletService
      .getBalance()
      .then((res) => { if (active) setWallet(res.data.data); })
      .catch(() => { if (active) setWallet(null); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const currency = wallet?.currency || 'XOF';
  const userBalance = wallet?.balance ?? 0;        // liquidités disponibles (réel)
  const userLocked = wallet?.lockedBalance ?? 0;   // fonds bloqués (retraits en cours)
  // Le portefeuille d'investissements réel sera branché en B5 (GET /investments/my-investments).
  const userPortfolio = user?.portfolio || 85000;
  const userReturns = user?.returns || 12.5;

  // Données du portfolio
  const portfolio = [
    {
      id: 1,
      startup: 'AgroTech Solutions',
      shares: 150,
      buyPrice: 90,
      currentPrice: 100,
      value: 15000,
      change: 12.5,
      changeValue: 1666,
      sector: 'Agriculture'
    },
    {
      id: 2,
      startup: 'MediConnect Africa',
      shares: 100,
      buyPrice: 200,
      currentPrice: 250,
      value: 25000,
      change: 23.8,
      changeValue: 4800,
      sector: 'Santé'
    },
    {
      id: 3,
      startup: 'EduSmart',
      shares: 200,
      buyPrice: 185,
      currentPrice: 175,
      value: 35000,
      change: -5.2,
      changeValue: -1920,
      sector: 'Education'
    },
    {
      id: 4,
      startup: 'SolarPower SA',
      shares: 25,
      buyPrice: 275,
      currentPrice: 400,
      value: 10000,
      change: 45.6,
      changeValue: 3125,
      sector: 'Energie'
    }
  ];

  // Dans PortfolioView.tsx, ajouter les handlers
  const handleExport = () => {
    const portfolioData = portfolio.map(item => ({
      Startup: item.startup,
      Actions: item.shares,
      'Prix achat': item.buyPrice,
      'Prix actuel': item.currentPrice,
      Valeur: item.value,
      'Variation %': item.change
    }));

    const csv = [
      Object.keys(portfolioData[0]).join(','),
      ...portfolioData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleDeposit = () => {
    setActiveView('deposit'); // Nouvelle vue à créer
  };

  const handleReinvest = () => {
    const gains = portfolio.filter(p => p.change > 0).reduce((sum, p) => sum + p.changeValue, 0);
    if (gains > 0) {
      alert(`Vous pouvez réinvestir ${gains.toLocaleString()} XOF de gains`);
      setActiveView('startups');
    } else {
      alert('Aucun gain à réinvestir pour le moment');
    }
  };

  const handleAnalysis = () => {
    setActiveView('portfolio-analysis'); // Nouvelle vue à créer
  };

  // Calculs du portfolio
  const totalValue = portfolio.reduce((sum, item) => sum + item.value, 0);
  const totalChange = portfolio.reduce((sum, item) => sum + item.changeValue, 0);
  const _denom = totalValue - totalChange;
  const totalChangePercent = _denom === 0 ? 0 : ((totalValue - _denom) / _denom) * 100;

  // Répartition par secteur
  const sectorDistribution = portfolio.reduce((acc, item) => {
    acc[item.sector] = (acc[item.sector] || 0) + item.value;
    return acc;
  }, {} as Record<string, number>);

  // Glass Card Component
  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative backdrop-blur-xl rounded-2xl border border-white/20 p-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}>
      {children}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="text-center max-w-md">
          <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connectez-vous pour voir votre portfolio</h2>
          <p className="text-white/60 mb-6">Suivez vos investissements et analysez vos performances</p>
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-medium"
          >
            Se connecter
          </button>
        </GlassCard>
      </div>
    );
  }

  const PerformanceChart = () => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      x: i,
      y: 50 + Math.random() * 30 + (i * 0.5)
    }));

    const maxY = Math.max(...points.map(p => p.y));
    const minY = Math.min(...points.map(p => p.y));

    return (
      <svg viewBox="0 0 300 100" className="w-full h-32">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${points.map(p => `${p.x * 10},${100 - ((p.y - minY) / (maxY - minY)) * 80}`).join(' L ')}`}
          fill="none"
          stroke="rgb(251, 146, 60)"
          strokeWidth="2"
        />
        <path
          d={`M ${points[0].x * 10},100 L ${points.map(p => `${p.x * 10},${100 - ((p.y - minY) / (maxY - minY)) * 80}`).join(' L ')} L ${points[points.length - 1].x * 10},100`}
          fill="url(#gradient)"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mon Portfolio</h1>
          <p className="text-white/60 text-lg">Gérez vos investissements et suivez leur performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {showBalances ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={() => setActiveView('startups')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Investir
          </button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60">Valeur totale du portfolio</p>
            <PieChart className="w-5 h-5 text-emerald-400 opacity-60" />
          </div>
          <p className="text-3xl font-bold text-white">
            {showBalances ? `${totalValue.toLocaleString()} XOF` : '•••••••'}
          </p>
          <div className={`mt-2 flex items-center text-sm ${totalChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalChange > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            <span>{totalChange > 0 ? '+' : ''}{totalChange.toLocaleString()} XOF ({totalChangePercent.toFixed(1)}%)</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60">Liquidités disponibles</p>
            <DollarSign className="w-5 h-5 text-blue-400 opacity-60" />
          </div>
          <p className="text-3xl font-bold text-white">
            {showBalances ? `${userBalance.toLocaleString()} XOF` : '•••••••'}
          </p>
          <div className="mt-2 text-sm text-white/60">
            Prêt à investir
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60">Performance totale</p>
            <Activity className="w-5 h-5 text-orange-400 opacity-60" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">+{userReturns}%</p>
          <div className="mt-2 text-sm text-white/60">
            Depuis le début
          </div>
        </GlassCard>
      </div>

      {/* Graphique de performance */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Performance du portfolio</h2>
          <div className="flex gap-2">
            {['1J', '1S', '1M', '3M', '1A', 'Tout'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${timeRange === range
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-32">
          <PerformanceChart />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs text-white/50">Valeur initiale</p>
            <p className="text-sm font-semibold text-white">{(totalValue - totalChange).toLocaleString()} XOF</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Valeur actuelle</p>
            <p className="text-sm font-semibold text-white">{totalValue.toLocaleString()} XOF</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Gain/Perte</p>
            <p className={`text-sm font-semibold ${totalChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalChange > 0 ? '+' : ''}{totalChange.toLocaleString()} XOF
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">Rendement</p>
            <p className={`text-sm font-semibold ${totalChangePercent > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalChangePercent > 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Liste des investissements */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Mes investissements</h2>
        <div className="space-y-4">
          {portfolio.map((item) => (
            <GlassCard key={item.id} className="hover:border-white/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{item.startup}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                    <span>{item.shares} actions</span>
                    <span>•</span>
                    <span>Prix d'achat: {item.buyPrice} XOF</span>
                    <span>•</span>
                    <span>Prix actuel: {item.currentPrice} XOF</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">
                    {showBalances ? `${item.value.toLocaleString()} XOF` : '•••••••'}
                  </p>
                  <p className={`text-sm font-medium flex items-center justify-end gap-1 ${item.change > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {item.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(item.change)}% ({item.changeValue > 0 ? '+' : ''}{item.changeValue.toLocaleString()} XOF)
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Répartition par secteur */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-6">Répartition par secteur</h2>
        <div className="space-y-4">
          {Object.entries(sectorDistribution).map(([sector, value]) => {
            const percentage = (value / totalValue) * 100;
            return (
              <div key={sector}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/80">{sector}</span>
                  <span className="text-sm font-semibold text-white">
                    {percentage.toFixed(1)}% ({value.toLocaleString()} XOF)
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={handleDeposit}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-white flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Déposer des fonds
        </button>
        <button
          onClick={() => setActiveView('withdraw')}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-white flex items-center justify-center gap-2"
        >
          <ArrowDownRight className="w-5 h-5" />
          Retirer des fonds
        </button>
        <button
          onClick={handleReinvest}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-white flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          Réinvestir les gains
        </button>
        <button
          onClick={handleAnalysis}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-white flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-5 h-5" />
          Analyse détaillée
        </button>
      </div>
    </div>
  );
};

export default PortfolioView;