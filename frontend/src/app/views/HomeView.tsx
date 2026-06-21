import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Shield, Globe, Users, BarChart3, ChevronRight,
  Star, ArrowUpRight, Wallet, Briefcase, Activity, Sparkles
} from 'lucide-react';
import InvestmentFundCard from '../../components/InvestmentFundCard';

interface HomeViewProps {
  isAuthenticated: boolean;
  user: any;
  mounted: boolean;
  setActiveView: (view: string) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  setShowAuthModal: (show: boolean) => void;
  setShowAccountTypeSelection: (show: boolean) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  isAuthenticated,
  user,
  mounted,
  setActiveView,
  setAuthMode,
  setShowAuthModal,
  setShowAccountTypeSelection
}) => {
  const startups = [
    {
      id: 1,
      name: 'AgroTech Solutions',
      sector: 'Agriculture',
      country: 'Côte d\'Ivoire',
      description: 'Plateforme digitale connectant agriculteurs et acheteurs',
      sharePrice: 100,
      growth: 23.5,
      investors: 128,
      rating: 4.5,
      verified: true,
    },
    {
      id: 2,
      name: 'MediConnect Africa',
      sector: 'Santé',
      country: 'Kenya',
      description: 'Télémédecine pour zones rurales africaines',
      sharePrice: 250,
      growth: 45.2,
      investors: 256,
      rating: 4.8,
      verified: true,
    },
  ];

  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Récupérer les actualités depuis l'API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/v1/news?limit=3`);
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          setNews(data.data);
        } else {
          console.error('Format de données invalide:', data);
          setNews([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        setNews([]);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Il y a 1j';
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  // Fonction pour obtenir la couleur de catégorie
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'STARTUP_NEWS': return '🚀 Startup';
      case 'MARKET_UPDATE': return '📈 Marché';
      case 'INVESTMENT_NEWS': return '💰 Investissement';
      case 'REGULATORY_NEWS': return '📋 Réglementation';
      case 'TECH_NEWS': return '💻 Tech';
      default: return '📰 Actualité';
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Hero */}
      <div className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-600/10 to-emerald-600/20 animate-gradient"></div>

        {/* Content */}
        <div className="relative backdrop-blur-xl bg-white/[0.08] rounded-3xl p-8 md:p-12 border border-white/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 backdrop-blur-xl mb-6">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Plateforme d'investissement #1 en Afrique</span>
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
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/60">Solde disponible</p>
                  <Wallet className="w-5 h-5 text-blue-400 opacity-60" />
                </div>
                <p className="text-3xl font-bold text-white">{(user?.balance || 125000).toLocaleString()} XOF</p>
                <div className="mt-2 flex items-center text-sm text-emerald-400">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+2.5% ce mois</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/60">Valeur du portfolio</p>
                  <Briefcase className="w-5 h-5 text-emerald-400 opacity-60" />
                </div>
                <p className="text-3xl font-bold text-white">{(user?.portfolio || 85000).toLocaleString()} XOF</p>
                <div className="mt-2 flex items-center text-sm text-emerald-400">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+{user?.returns || 12.5}% total</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/60">Rendement annuel</p>
                  <Activity className="w-5 h-5 text-orange-400 opacity-60" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  +{user?.returns || 12.5}%
                </p>
                <div className="mt-2 text-sm text-white/60">
                  Performance excellente
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAccountTypeSelection(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Commencer à investir
            </button>
          )}
        </div>
      </div>

      {/* Dernières actualités */}
      <div className={`transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📰 Dernières actualités</h2>
          <button
            onClick={() => setActiveView('actualites')}
            className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center transition-colors"
          >
            Voir toutes les actualités
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Afficher les actualités récentes depuis l'API */}
        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl rounded-2xl border border-white/10 p-6 animate-pulse">
                <div className="w-full h-32 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-xl mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-3"></div>
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveView('actualites')}
                className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl rounded-2xl border border-white/10 p-6 cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-white/20"
              >
                {/* Image ou placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-xl mb-4 flex items-center justify-center">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-orange-400 text-2xl">📰</div>
                  )}
                </div>

                {/* Catégorie et date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {getCategoryColor(article.category)}
                  </span>
                  <span className="text-xs text-white/40">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                {/* Titre */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>

                {/* Extrait */}
                <p className="text-sm text-white/70 mb-4 line-clamp-3">
                  {article.summary || article.content?.substring(0, 120) + '...'}
                </p>

                {/* Métriques */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {article.importance && (
                      <div className="flex items-center text-xs text-white/60">
                        <span className={`w-2 h-2 rounded-full mr-1 ${article.importance === 'URGENT' ? 'bg-red-400' :
                          article.importance === 'HIGH' ? 'bg-orange-400' :
                            article.importance === 'NORMAL' ? 'bg-yellow-400' :
                              'bg-green-400'
                          }`}></span>
                        {article.importance === 'URGENT' ? 'Urgent' :
                          article.importance === 'HIGH' ? 'Important' :
                            article.importance === 'NORMAL' ? 'Normal' : 'Faible'}
                      </div>
                    )}
                    {article.viewCount && (
                      <div className="flex items-center text-xs text-white/60">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                        {article.viewCount} vues
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-white/40 text-lg">Aucune actualité disponible</div>
            <div className="text-white/20 text-sm mt-2">Les actualités apparaîtront ici</div>
          </div>
        )}
      </div>

      {/* Opportunité d'investissement - Carte du fonds */}
      <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🎯 Opportunité exclusive</h2>
        </div>
        <InvestmentFundCard onPress={() => setActiveView('investment-fund')} />
      </div>

      {/* Startups en vedette */}
      <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Startups en vedette</h2>
          <button
            onClick={() => setActiveView('startups')}
            className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center transition-colors"
          >
            Voir tout
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {startups.map((startup) => (
            <div
              key={startup.id}
              onClick={() => setActiveView('startup-detail')}
              className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl rounded-2xl border border-white/10 p-6 cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-white/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{startup.name}</h3>
                  <p className="text-sm text-white/60">{startup.sector} • {startup.country}</p>
                </div>
                {startup.verified && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full flex items-center backdrop-blur">
                    <Shield className="w-3 h-3 mr-1" />
                    Vérifié
                  </span>
                )}
              </div>

              <p className="text-sm text-white/70 mb-6 line-clamp-2">{startup.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/50 mb-1">Prix/action</p>
                  <p className="text-lg font-semibold text-white">{startup.sharePrice} XOF</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/50 mb-1">Croissance</p>
                  <p className="text-lg font-semibold text-emerald-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{startup.growth}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-white/60 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    {startup.investors}
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    {startup.rating}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total investi</p>
              <p className="text-2xl font-bold text-white">2.5M XOF</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Startups actives</p>
              <p className="text-2xl font-bold text-white">127</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Investisseurs</p>
              <p className="text-2xl font-bold text-white">3,456</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Rendement moyen</p>
              <p className="text-2xl font-bold text-emerald-400">+18.7%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Comment ça marche ?</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">1. Explorez</h3>
            <p className="text-white/70">Découvrez des startups africaines innovantes soigneusement sélectionnées</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">2. Analysez</h3>
            <p className="text-white/70">Étudiez les métriques, documents et performances de chaque startup</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">3. Investissez</h3>
            <p className="text-white/70">Investissez facilement et suivez vos rendements en temps réel</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          {!isAuthenticated ? (
            <button
              onClick={() => {
                setShowAccountTypeSelection(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Commencer maintenant
            </button>
          ) : (
            <button
              onClick={() => setActiveView('startups')}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Explorer les startups
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;