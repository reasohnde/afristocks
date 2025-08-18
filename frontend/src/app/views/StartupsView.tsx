import React, { useState } from 'react';
import { Search, TrendingUp, Users, Star, CheckCircle, FileText, Play, ChevronRight, Filter, MapPin, DollarSign, Award, Target } from 'lucide-react';

interface StartupsViewProps {
  setSelectedStartup: (startup: any) => void;
  setActiveView: (view: string) => void;
}

const StartupsView: React.FC<StartupsViewProps> = ({ setSelectedStartup, setActiveView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Données des startups
  const startups = [
    {
      id: 1,
      name: 'AgroTech Solutions',
      sector: 'Agriculture',
      country: 'Côte d\'Ivoire',
      description: 'Plateforme digitale connectant agriculteurs et acheteurs',
      valuation: 2500000,
      sharePrice: 100,
      availableShares: 10000,
      totalShares: 25000,
      growth: 23.5,
      rating: 4.5,
      verified: true,
      pitchDeck: true,
      video: true,
      raised: 650000,
      investors: 128,
      founded: '2021',
      team: 12,
      tags: ['AgriTech', 'B2B', 'Marketplace'],
      impactScore: 85,
      minInvestment: 5000
    },
    {
      id: 2,
      name: 'MediConnect Africa',
      sector: 'Santé',
      country: 'Kenya',
      description: 'Télémédecine pour zones rurales africaines',
      valuation: 5000000,
      sharePrice: 250,
      availableShares: 8000,
      totalShares: 20000,
      growth: 45.2,
      rating: 4.8,
      verified: true,
      pitchDeck: true,
      video: true,
      raised: 1200000,
      investors: 256,
      founded: '2020',
      team: 24,
      tags: ['HealthTech', 'B2C', 'Impact'],
      impactScore: 92,
      minInvestment: 10000
    },
    {
      id: 3,
      name: 'EduSmart',
      sector: 'Education',
      country: 'Nigeria',
      description: 'E-learning adapté au contexte africain',
      valuation: 3500000,
      sharePrice: 175,
      availableShares: 12000,
      totalShares: 20000,
      growth: 31.7,
      rating: 4.6,
      verified: true,
      pitchDeck: true,
      video: false,
      raised: 890000,
      investors: 189,
      founded: '2022',
      team: 18,
      tags: ['EdTech', 'B2C', 'SaaS'],
      impactScore: 78,
      minInvestment: 7500
    },
    {
      id: 4,
      name: 'SolarPower SA',
      sector: 'Energie',
      country: 'Afrique du Sud',
      description: 'Solutions solaires pour entreprises',
      valuation: 8000000,
      sharePrice: 400,
      availableShares: 5000,
      totalShares: 20000,
      growth: 67.3,
      rating: 4.9,
      verified: true,
      pitchDeck: true,
      video: true,
      raised: 3200000,
      investors: 412,
      founded: '2019',
      team: 35,
      tags: ['CleanTech', 'B2B', 'Hardware'],
      impactScore: 95,
      minInvestment: 20000
    },
    {
      id: 5,
      name: 'FinTech Pro',
      sector: 'Finance',
      country: 'Ghana',
      description: 'Solutions de paiement mobile pour l\'Afrique',
      valuation: 6000000,
      sharePrice: 300,
      availableShares: 6000,
      totalShares: 20000,
      growth: 52.8,
      rating: 4.7,
      verified: true,
      pitchDeck: true,
      video: true,
      raised: 1800000,
      investors: 324,
      founded: '2020',
      team: 28,
      tags: ['FinTech', 'B2C', 'Mobile'],
      impactScore: 88,
      minInvestment: 15000
    },
    {
      id: 6,
      name: 'LogiTrack',
      sector: 'Logistique',
      country: 'Sénégal',
      description: 'Tracking en temps réel pour le transport de marchandises',
      valuation: 4000000,
      sharePrice: 200,
      availableShares: 10000,
      totalShares: 20000,
      growth: 38.9,
      rating: 4.4,
      verified: true,
      pitchDeck: true,
      video: false,
      raised: 1000000,
      investors: 167,
      founded: '2021',
      team: 20,
      tags: ['LogTech', 'B2B', 'IoT'],
      impactScore: 75,
      minInvestment: 8000
    }
  ];

  // Filtrer et trier les startups
  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || startup.sector === selectedSector;
    const matchesCountry = selectedCountry === 'all' || startup.country === selectedCountry;
    return matchesSearch && matchesSector && matchesCountry;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating;
      case 'growth': return b.growth - a.growth;
      case 'valuation': return b.valuation - a.valuation;
      case 'impact': return b.impactScore - a.impactScore;
      default: return 0;
    }
  });

  const sectors = ['all', 'Agriculture', 'Santé', 'Education', 'Energie', 'Finance', 'Logistique'];
  const countries = ['all', 'Côte d\'Ivoire', 'Kenya', 'Nigeria', 'Afrique du Sud', 'Ghana', 'Sénégal'];

  // Glass Card Component
  interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (() => void) | undefined;
  }

  const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick = undefined }) => (
    <div
      onClick={onClick}
      className={`relative backdrop-blur-xl rounded-2xl border border-white/20 p-6 cursor-pointer transition-all duration-300 hover:border-white/30 hover:transform hover:scale-[1.02] ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Explorer les Startups</h1>
        <p className="text-white/60 text-lg">Découvrez les entreprises innovantes qui façonnent l'avenir de l'Afrique</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' }}>
          <p className="text-2xl font-bold text-white">{startups.length}</p>
          <p className="text-sm text-white/60">Startups actives</p>
        </div>
        <div className="backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' }}>
          <p className="text-2xl font-bold text-emerald-400">€5.2M</p>
          <p className="text-sm text-white/60">Fonds levés</p>
        </div>
        <div className="backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' }}>
          <p className="text-2xl font-bold text-orange-400">45.3%</p>
          <p className="text-sm text-white/60">Croissance moy.</p>
        </div>
        <div className="backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' }}>
          <p className="text-2xl font-bold text-white">1,542</p>
          <p className="text-sm text-white/60">Investisseurs</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une startup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur"
            />
          </div>

          {/* Secteur */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white backdrop-blur appearance-none cursor-pointer"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector} className="bg-slate-900">
                {sector === 'all' ? 'Tous les secteurs' : sector}
              </option>
            ))}
          </select>

          {/* Pays */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white backdrop-blur appearance-none cursor-pointer"
          >
            {countries.map(country => (
              <option key={country} value={country} className="bg-slate-900">
                {country === 'all' ? 'Tous les pays' : country}
              </option>
            ))}
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white backdrop-blur appearance-none cursor-pointer"
          >
            <option value="rating" className="bg-slate-900">Note la plus élevée</option>
            <option value="growth" className="bg-slate-900">Croissance la plus forte</option>
            <option value="valuation" className="bg-slate-900">Valorisation la plus haute</option>
            <option value="impact" className="bg-slate-900">Impact le plus élevé</option>
          </select>
        </div>
      </div>

      {/* Liste des startups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map((startup) => (
          <GlassCard
            key={startup.id}
            onClick={() => {
              setSelectedStartup(startup);
              setActiveView('startup-detail');
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {startup.name}
                  {startup.verified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </h3>
                <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {startup.sector} • {startup.country}
                </p>
              </div>
              <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-white">{startup.rating}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/70 mb-4 line-clamp-2">{startup.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {startup.tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/70">
                  {tag}
                </span>
              ))}
            </div>

            {/* Métriques */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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

            {/* Infos supplémentaires */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 text-white/60">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {startup.investors}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {startup.impactScore}%
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>

            {/* Investment minimum */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-white/50">Investissement minimum</p>
              <p className="text-sm font-semibold text-orange-400">{startup.minInvestment.toLocaleString()} XOF</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredStartups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">Aucune startup ne correspond à vos critères</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSector('all');
              setSelectedCountry('all');
            }}
            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};

export default StartupsView;