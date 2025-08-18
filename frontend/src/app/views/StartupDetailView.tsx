import React, { useState } from 'react';
import { ChevronLeft, Star, CheckCircle, MapPin, Calendar, Users, TrendingUp, FileText, Play, Download, Share2, Heart, Shield, Award, Target, BarChart3, DollarSign, Globe, Mail, Phone, Linkedin, Twitter } from 'lucide-react';

interface StartupDetailViewProps {
  startup: any;
  setActiveView: (view: string) => void;
  isAuthenticated: boolean;
  setShowAuthModal: (show: boolean) => void;
  setAuthMode: (mode: string) => void;
  user?: any;
}

const StartupDetailView: React.FC<StartupDetailViewProps> = ({ startup, setActiveView, isAuthenticated, setShowAuthModal, setAuthMode, user }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Glass Card Component
  interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
  }

  const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
    <div className={`relative backdrop-blur-xl rounded-2xl border border-white/20 p-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}>
      {children}
    </div>
  );

  // Fonction de partage
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: startup.name,
          text: startup.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Erreur partage:', err);
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  // Modal d'investissement
  interface InvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    startup: any;
    investmentAmount: number;
    user: any;
  }

  const InvestModal: React.FC<InvestModalProps> = ({ isOpen, onClose, startup, investmentAmount, user }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleConfirmInvestment = async () => {
      setIsProcessing(true);
      // Simulation d'investissement
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Investissement de ${investmentAmount} XOF confirmé dans ${startup.name}`);
      setIsProcessing(false);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Confirmer l'investissement</h2>

          <div className="space-y-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/60">Startup</p>
              <p className="text-lg font-semibold text-white">{startup.name}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/60">Montant à investir</p>
              <p className="text-2xl font-bold text-white">{Number(investmentAmount).toLocaleString()} XOF</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/60">Nombre d'actions</p>
              <p className="text-lg font-semibold text-white">
                {Math.floor(Number(investmentAmount) / startup.sharePrice)} actions
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmInvestment}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? 'Traitement...' : 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Données supplémentaires de la startup
  const financialData = {
    revenue: [
      { year: '2021', amount: 250000 },
      { year: '2022', amount: 580000 },
      { year: '2023', amount: 920000 },
      { year: '2024', amount: 1500000 }
    ],
    expenses: {
      marketing: 30,
      operations: 40,
      rd: 20,
      other: 10
    }
  };

  const milestones = [
    { date: '2021-01', title: 'Création de l\'entreprise', description: 'Lancement officiel avec 3 co-fondateurs' },
    { date: '2021-06', title: 'Premier client', description: 'Signature du premier contrat commercial' },
    { date: '2022-03', title: 'Levée de fonds Seed', description: 'Levée de 200K€ auprès d\'investisseurs privés' },
    { date: '2023-01', title: 'Expansion régionale', description: 'Ouverture de bureaux dans 3 nouveaux pays' },
    { date: '2024-01', title: 'Série A', description: 'Objectif de lever 2M€ pour accélérer la croissance' }
  ];

  const teamMembers = [
    { name: 'Amadou Diallo', role: 'CEO & Co-fondateur', experience: '10 ans', linkedin: '#' },
    { name: 'Fatima Sy', role: 'CTO & Co-fondatrice', experience: '8 ans', linkedin: '#' },
    { name: 'Moussa Keita', role: 'COO & Co-fondateur', experience: '12 ans', linkedin: '#' },
    { name: 'Aïcha Touré', role: 'CFO', experience: '15 ans', linkedin: '#' }
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'financials', label: 'Finances' },
    { id: 'team', label: 'Équipe' },
    { id: 'documents', label: 'Documents' },
    { id: 'updates', label: 'Actualités' }
  ];

  const calculateInvestment = () => {
    const amount = parseFloat(investmentAmount) || 0;
    const shares = Math.floor(amount / startup.sharePrice);
    return {
      amount,
      shares,
      percentage: (shares / startup.totalShares * 100).toFixed(3)
    };
  };

  const investment = calculateInvestment();

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <button
        onClick={() => setActiveView('startups')}
        className="flex items-center text-white/60 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Retour aux startups
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Info principale */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                {startup.name}
                {startup.verified && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Vérifié
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-white/60">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {startup.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fondée en {startup.founded}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {startup.team} membres
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Partager"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${isFavorite
                  ? 'bg-red-500/20 hover:bg-red-500/30'
                  : 'bg-white/10 hover:bg-white/20'
                  }`}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-400 fill-red-400' : 'text-white'}`} />
              </button>
            </div>
          </div>

          <p className="text-white/70 mb-6">{startup.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {startup.tags?.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
                {tag}
              </span>
            ))}
          </div>

          {/* Métriques clés */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{startup.rating}</span>
              </div>
              <p className="text-sm text-white/60">Note moyenne</p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{startup.investors}</span>
              </div>
              <p className="text-sm text-white/60">Investisseurs</p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-bold text-emerald-400">+{startup.growth}%</span>
              </div>
              <p className="text-sm text-white/60">Croissance</p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">{startup.impactScore}%</span>
              </div>
              <p className="text-sm text-white/60">Score d'impact</p>
            </GlassCard>
          </div>
        </div>

        {/* Panneau d'investissement */}
        <div className="lg:w-96">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Investir dans {startup.name}</h2>

            <div className="space-y-4">
              {/* Infos de levée */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">Objectif de levée</span>
                  <span className="text-sm font-semibold text-white">{startup.valuation.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">Déjà levé</span>
                  <span className="text-sm font-semibold text-emerald-400">{startup.raised.toLocaleString()} XOF</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(startup.raised / startup.valuation * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-white/50">{(startup.raised / startup.valuation * 100).toFixed(1)}% complété</p>
              </div>

              {/* Prix et disponibilité */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/50 mb-1">Prix/action</p>
                  <p className="text-lg font-semibold text-white">{startup.sharePrice} XOF</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/50 mb-1">Disponible</p>
                  <p className="text-lg font-semibold text-white">{startup.availableShares.toLocaleString()}</p>
                </div>
              </div>

              {/* Montant d'investissement */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Montant à investir (XOF)
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={startup.minInvestment?.toString() || "5000"}
                  min={startup.minInvestment || 5000}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white placeholder-white/40 backdrop-blur"
                />
                <p className="text-xs text-white/50 mt-1">
                  Minimum: {(startup.minInvestment || 5000).toLocaleString()} XOF
                </p>
              </div>

              {/* Résultat */}
              {investment.amount > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Nombre d'actions</span>
                    <span className="text-white font-semibold">{investment.shares}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Part du capital</span>
                    <span className="text-white font-semibold">{investment.percentage}%</span>
                  </div>
                </div>
              )}

              {/* Bouton d'investissement */}
              {isAuthenticated ? (
                <button
                  onClick={() => setShowInvestModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Investir maintenant
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30"
                >
                  Se connecter pour investir
                </button>
              )}

              {/* Garanties */}
              <div className="flex items-center justify-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Sécurisé
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Vérifié
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Garanti
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 mb-6 p-1 bg-white/10 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-xl font-semibold text-white mb-4">À propos</h3>
              <p className="text-white/70 mb-4">{startup.description}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-orange-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Mission</p>
                    <p className="text-sm text-white/60">Révolutionner le secteur {startup.sector.toLowerCase()} en Afrique</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Marchés cibles</p>
                    <p className="text-sm text-white/60">Afrique de l'Ouest et Centrale</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Clients</p>
                    <p className="text-sm text-white/60">Plus de 10,000 utilisateurs actifs</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-semibold text-white mb-4">Jalons</h3>
              <div className="space-y-4">
                {milestones.slice(0, 4).map((milestone, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{milestone.title}</p>
                      <p className="text-xs text-white/50">{milestone.date}</p>
                      <p className="text-sm text-white/60 mt-1">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-xl font-semibold text-white mb-4">Évolution du chiffre d'affaires</h3>
              <div className="space-y-3">
                {financialData.revenue.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white/80">{item.year}</span>
                      <span className="text-sm font-semibold text-white">{item.amount.toLocaleString()} XOF</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.amount / Math.max(...financialData.revenue.map(r => r.amount))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-semibold text-white mb-4">Répartition des dépenses</h3>
              <div className="space-y-3">
                {Object.entries(financialData.expenses).map(([category, percentage]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white/80 capitalize">{category}</span>
                      <span className="text-sm font-semibold text-white">{percentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, i) => (
              <GlassCard key={i}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{member.name}</h4>
                    <p className="text-sm text-white/60">{member.role}</p>
                    <p className="text-xs text-white/50">{member.experience} d'expérience</p>
                  </div>
                  <a href={member.linkedin} className="text-blue-400 hover:text-blue-300">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startup.pitchDeck && (
              <GlassCard className="hover:border-white/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-8 h-8 text-orange-400" />
                  <Download className="w-5 h-5 text-white/60" />
                </div>
                <h4 className="font-semibold text-white mb-1">Pitch Deck</h4>
                <p className="text-sm text-white/60">Présentation complète de l'entreprise</p>
              </GlassCard>
            )}
            {startup.video && (
              <GlassCard className="hover:border-white/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <Play className="w-8 h-8 text-blue-400" />
                  <Play className="w-5 h-5 text-white/60" />
                </div>
                <h4 className="font-semibold text-white mb-1">Vidéo de présentation</h4>
                <p className="text-sm text-white/60">3 minutes pour découvrir notre vision</p>
              </GlassCard>
            )}
            <GlassCard className="hover:border-white/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="w-8 h-8 text-emerald-400" />
                <Download className="w-5 h-5 text-white/60" />
              </div>
              <h4 className="font-semibold text-white mb-1">Rapport financier</h4>
              <p className="text-sm text-white/60">Résultats des 12 derniers mois</p>
            </GlassCard>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-4">
            <GlassCard>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Nouveau partenariat stratégique</h4>
                  <p className="text-xs text-white/50 mb-2">Il y a 2 jours</p>
                  <p className="text-sm text-white/70">
                    Nous sommes ravis d'annoncer notre partenariat avec TechCorp pour étendre notre présence en Afrique de l'Est.
                  </p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Mise à jour produit v2.0</h4>
                  <p className="text-xs text-white/50 mb-2">Il y a 1 semaine</p>
                  <p className="text-sm text-white/70">
                    Lancement de nouvelles fonctionnalités basées sur l'IA pour améliorer l'expérience utilisateur.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupDetailView;