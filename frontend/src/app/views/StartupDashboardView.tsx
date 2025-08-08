import React, { useState, useEffect } from 'react';
import {
  Building2, Upload, FileText, CheckCircle, AlertCircle, Info, Shield,
  TrendingUp, Users, DollarSign, BarChart3, Clock, FileCheck, Award,
  Sparkles, Zap, Target, Briefcase, ChevronRight, Plus, X, Download,
  Camera, Edit3, Lock, Unlock, Star, Activity, Globe, ArrowUpRight,
  Eye, Heart, ShoppingCart, GraduationCap, Truck, Leaf, Cpu
} from 'lucide-react';

interface Startup {
  id?: string;
  name?: string;
  logo?: string;
  sector?: string;
  country?: string;
  description?: string;
  sharePrice?: number;
  growth?: number;
  investors?: number;
  rating?: number;
  verified?: boolean;
  companyInfo?: {
    sector?: string;
    country?: string;
    city?: string;
  };
}

interface StartupDashboardViewProps {
  startup: Startup;
  setActiveView: (view: string) => void;
}

const StartupDashboardView: React.FC<StartupDashboardViewProps> = ({ startup, setActiveView }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [uploadProgress, setUploadProgress] = useState({});
  const [documents, setDocuments] = useState({
    administrative: [],
    financial: [],
    activity: [],
    other: []
  });
  const [profileCompletion, setProfileCompletion] = useState(65);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentUploadCategory, setCurrentUploadCategory] = useState<string | null>(null);
  const [showEmissionModal, setShowEmissionModal] = useState(false);
  const [shareData, setShareData] = useState({
    totalShares: '',
    pricePerShare: '',
    minInvestment: '',
    maxInvestment: '',
    description: ''
  });

  // Animation des badges - sans effet de cintillement
  interface AnimatedBadges {
    profile?: boolean;
    docs?: boolean;
    eligible?: boolean;
    published?: boolean;
  }

  const [animatedBadges, setAnimatedBadges] = useState<AnimatedBadges>({});

  useEffect(() => {
    const badges = ['profile', 'docs', 'eligible', 'published'];
    badges.forEach((badge, index) => {
      setTimeout(() => {
        setAnimatedBadges(prev => ({ ...prev, [badge]: true }));
      }, index * 200);
    });
  }, []);

  // Glass Card améliorée sans animations distrayantes
  interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'primary' | 'gold' | 'dark';
    hoverable?: boolean;
    onClick?: () => void;
  }

  const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', variant = 'default', hoverable = true, onClick }) => {
    const variants = {
      default: 'bg-gradient-to-br from-white/10 to-white/5',
      primary: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
      gold: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
      dark: 'bg-gradient-to-br from-slate-900/50 to-slate-800/30'
    };

    return (
      <div
        className={`relative ${className}`}
        onClick={onClick}
      >
        <div
          className={`
            relative h-full ${variants[variant]} 
            backdrop-blur-2xl rounded-2xl border border-white/10 
            overflow-hidden transition-all duration-300
            ${hoverable ? 'cursor-pointer hover:border-white/20 hover:shadow-2xl' : ''}
          `}
        >
          {/* Pas d'animation de lumière liquide - juste un hover subtil */}
          {hoverable && (
            <div className="absolute inset-0 opacity-0 hover:opacity-10 bg-gradient-to-br from-white to-transparent transition-opacity duration-300" />
          )}
          {children}
        </div>
      </div>
    );
  };

  // Header avec profil entreprise
  const StartupHeader = () => (
    <div className="mb-8">
      <GlassCard variant="dark" hoverable={false}>
        <div className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Logo entreprise */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center overflow-hidden">
                  {startup?.logo ? (
                    <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-12 h-12 text-emerald-400" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Infos entreprise avec meilleure lisibilité */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  {startup?.name || 'Ma Startup'}
                </h1>
                <p className="text-white/80 mb-3 font-medium">
                  {startup?.companyInfo?.sector || 'FinTech'} • {startup?.companyInfo?.country || 'Côte d\'Ivoire'} • {startup?.companyInfo?.city || 'Abidjan'}
                </p>

                {/* Badges de statut sans animation ping */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    icon={Shield}
                    label="Profil vérifié"
                    unlocked={animatedBadges.profile || false}
                    variant="success"
                  />
                  <Badge
                    icon={FileCheck}
                    label="Documents 80%"
                    unlocked={animatedBadges.docs || false}
                    variant="warning"
                  />
                  <Badge
                    icon={Award}
                    label="Éligible"
                    unlocked={animatedBadges.eligible || false}
                    variant="gold"
                  />
                  <Badge
                    icon={Globe}
                    label="En ligne"
                    unlocked={animatedBadges.published || false}
                    variant="primary"
                  />
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white hover:text-white transition-all flex items-center gap-2 font-medium">
                <Edit3 className="w-4 h-4" />
                Modifier
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-white font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                <Eye className="w-4 h-4" />
                Aperçu public
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white/80">Profil complété</span>
              <span className="text-sm font-bold text-emerald-400">{profileCompletion}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  // Badge amélioré sans animation ping
  interface BadgeProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    unlocked: boolean;
    variant?: 'default' | 'success' | 'warning' | 'gold' | 'primary';
  }

  const Badge: React.FC<BadgeProps> = ({ icon: Icon, label, unlocked, variant = 'default' }) => {
    const variants = {
      default: 'from-slate-500 to-slate-600',
      success: 'from-emerald-500 to-emerald-600',
      warning: 'from-amber-500 to-amber-600',
      gold: 'from-yellow-500 to-amber-500',
      primary: 'from-blue-500 to-blue-600'
    };

    return (
      <div className={`
        relative px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-500
        ${unlocked
          ? `bg-gradient-to-r ${variants[variant]} text-white shadow-lg`
          : 'bg-white/10 text-white/40 border border-white/10'
        }
      `}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold tracking-wide">{label}</span>
      </div>
    );
  };

  // Navigation tabs avec meilleure lisibilité
  const NavigationTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'emissions', label: 'Émissions d\'actions', icon: DollarSign },
      { id: 'investors', label: 'Investisseurs', icon: Users }
    ];

    return (
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`
              px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 whitespace-nowrap font-medium
              ${activeSection === tab.id
                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30 shadow-lg'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // Section Vue d'ensemble améliorée
  const OverviewSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistiques clés */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <GlassCard variant="primary">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs text-emerald-400 font-bold">+12% ce mois</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">247</h3>
              <p className="text-white/80 text-sm font-medium">Investisseurs intéressés</p>
            </div>
          </GlassCard>

          <GlassCard variant="gold">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-xs text-amber-400 font-bold">75% atteint</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">750K XOF</h3>
              <p className="text-white/80 text-sm font-medium">Sur 1M XOF objectif</p>
            </div>
          </GlassCard>
        </div>

        {/* Graphique de progression */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Progression de la levée</h3>
            <div className="h-64 flex items-center justify-center text-white/60 bg-white/5 rounded-lg">
              <Activity className="w-8 h-8 mr-2" />
              <span className="font-medium">Graphique de progression</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Actions rapides */}
      <div className="space-y-4">
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <ActionButton
                icon={Upload}
                label="Uploader un document"
                onClick={() => setShowUploadModal(true)}
              />
              <ActionButton
                icon={TrendingUp}
                label="Émettre des actions"
                onClick={() => setShowEmissionModal(true)}
                variant="primary"
              />
              <ActionButton
                icon={Users}
                label="Inviter des investisseurs"
                onClick={() => console.log('Inviter des investisseurs')}
                variant="secondary"
              />
              <ActionButton
                icon={FileText}
                label="Générer un rapport"
                onClick={() => console.log('Générer un rapport')}
                variant="secondary"
              />
            </div>
          </div>
        </GlassCard>

        {/* Conseils */}
        <GlassCard variant="gold">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Conseil du jour</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-medium">
              Complétez votre pitch deck pour augmenter vos chances de 40% d'attirer des investisseurs qualifiés.
            </p>
            <button className="mt-3 text-amber-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              En savoir plus <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // Section Émissions d'actions
  const EmissionsSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Nouvelle émission d'actions</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Nombre total d'actions
              </label>
              <input
                type="number"
                value={shareData.totalShares}
                onChange={(e) => setShareData({ ...shareData, totalShares: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
                placeholder="Ex: 10000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Prix par action (XOF)
              </label>
              <input
                type="number"
                value={shareData.pricePerShare}
                onChange={(e) => setShareData({ ...shareData, pricePerShare: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
                placeholder="Ex: 1000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Investissement minimum (XOF)
              </label>
              <input
                type="number"
                value={shareData.minInvestment}
                onChange={(e) => setShareData({ ...shareData, minInvestment: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
                placeholder="Ex: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Description de l'offre
              </label>
              <textarea
                value={shareData.description}
                onChange={(e) => setShareData({ ...shareData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium resize-none"
                rows={4}
                placeholder="Décrivez votre offre d'actions..."
              />
            </div>

            <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold shadow-lg">
              Soumettre pour validation
            </button>

            <p className="text-xs text-white/60 text-center font-medium">
              * Les actions seront publiées après validation par l'administrateur
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Émissions en cours</h3>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white">Série A - 2024</h4>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-bold">
                  Active
                </span>
              </div>
              <p className="text-white/70 text-sm mb-3">10,000 actions à 1,000 XOF</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Vendues: 7,500</span>
                <span className="text-emerald-400 font-bold">75%</span>
              </div>
            </div>

            <div className="text-center py-8 text-white/40">
              <p className="text-sm">Aucune autre émission en cours</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  // Section Documents améliorée
  const DocumentsSection = () => {
    const documentCategories = [
      {
        id: 'administrative',
        title: 'Documents administratifs',
        icon: Shield,
        color: 'emerald',
        required: ['Registre de commerce', 'Statuts', 'Pièce d\'identité', 'Numéro fiscal'],
        documents: documents.administrative
      },
      {
        id: 'financial',
        title: 'Documents financiers',
        icon: DollarSign,
        color: 'amber',
        required: ['Bilans (3 ans)', 'Comptes de résultats', 'Prévisions financières'],
        documents: documents.financial
      },
      {
        id: 'activity',
        title: 'Documents d\'activité',
        icon: Activity,
        color: 'blue',
        required: ['Pitch deck', 'Business plan', 'Rapport d\'activité'],
        documents: documents.activity
      },
      {
        id: 'other',
        title: 'Autres justificatifs',
        icon: FileText,
        color: 'purple',
        required: ['Cap table', 'Contrats clés', 'Lettre d\'intention'],
        documents: documents.other
      }
    ];

    return (
      <div className="space-y-6">
        {documentCategories.map(category => (
          <DocumentCategory
            key={category.id}
            category={category}
            onUpload={() => {
              setCurrentUploadCategory(category.id);
              setShowUploadModal(true);
            }}
          />
        ))}
      </div>
    );
  };

  // Catégorie de documents améliorée
  interface DocumentCategoryProps {
    category: {
      id: string;
      title: string;
      color: string;
      icon: React.ComponentType<{ className?: string }>;
      required: string[];
      documents: Array<{ name: string }>;
    };
    onUpload: () => void;
  }

  const DocumentCategory: React.FC<DocumentCategoryProps> = ({ category, onUpload }) => {
    const colorClasses: Record<string, string> = {
      emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
      amber: 'from-amber-500/20 to-amber-600/10 text-amber-400',
      blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
      purple: 'from-purple-500/20 to-purple-600/10 text-purple-400'
    };

    return (
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[category.color]} flex items-center justify-center`}>
                <category.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{category.title}</h3>
            </div>
            <button
              onClick={onUpload}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white hover:text-white transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          <div className="space-y-2">
            {category.required.map((doc, index) => {
              const isUploaded = category.documents.some(d => d.name === doc);
              return (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-3 rounded-lg transition-all
                    ${isUploaded ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/10'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {isUploaded ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-white/40" />
                    )}
                    <span className={`text-sm font-medium ${isUploaded ? 'text-white' : 'text-white/70'}`}>
                      {doc}
                    </span>
                  </div>
                  {isUploaded && (
                    <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    );
  };

  // Bouton d'action amélioré
  interface ActionButtonProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const variants = {
      primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg',
      secondary: 'bg-white/10 text-white hover:bg-white/20'
    };

    return (
      <button
        onClick={onClick}
        className={`
          w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-300 font-medium
          ${variants[variant]}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  };

  // Modal d'upload améliorée
  const UploadModal = () => {
    if (!showUploadModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <GlassCard className="max-w-lg w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Uploader un document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors bg-white/5">
              <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white/80 mb-2 font-medium">Glissez-déposez vos fichiers ici</p>
              <p className="text-white/60 text-sm mb-4">ou</p>
              <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold shadow-lg">
                Parcourir les fichiers
              </button>
              <p className="text-white/60 text-xs mt-4 font-medium">PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Background simple sans animations */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950" />

      <div className="relative z-10">
        <StartupHeader />
        <NavigationTabs />

        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'documents' && <DocumentsSection />}
        {activeSection === 'emissions' && <EmissionsSection />}
        {activeSection === 'investors' && (
          <div className="text-center py-20 text-white/60">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="font-medium">Section investisseurs en cours de développement</p>
          </div>
        )}
      </div>

      <UploadModal />
    </div>
  );
};

export default StartupDashboardView;