import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Shield, Globe, Users, BarChart3, Menu, X, ChevronRight, Star, Play, FileText, ArrowUpRight, ArrowDownRight, Bell, Briefcase, LineChart, CheckCircle, AlertCircle, Sparkles, Zap, Activity, DollarSign, Wallet } from 'lucide-react';

import { Building2, UserCircle, Heart, ShoppingCart, GraduationCap, Truck, Leaf, Cpu, Edit3, Camera, FileCheck, Globe as GlobeIcon, Eye, Plus, Upload, Download } from 'lucide-react';

import StartupDashboardView from '../../app/views/StartupDashboardView';

const API_URL = 'http://localhost:8000';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  balance?: number;
  portfolio?: number;
  returns?: number;
  verified?: boolean;
}

const AfriStocksApp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const [showAccountTypeSelection, setShowAccountTypeSelection] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<'investor' | 'startup' | null>(null);

  // Gestion de l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Animation effects
  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Fonction de connexion
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          ...data.user,
          balance: data.user.balance || 125000,
          portfolio: data.user.portfolio || 85000,
          returns: data.user.returns || 12.5,
          verified: data.user.verified || false
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        if (userData.role === 'STARTUP') {
          setActiveView('startup-dashboard');
        }
      } else {
        alert(data.message || 'Erreur de connexion');
      }
    } catch (error) {
      alert('Erreur de connexion au serveur');
    }
  };

  // Fonction d'inscription
  const handleRegister = async (name: string, email: string, password: string, phoneNumber?: string, accountType?: string, sector?: string, country?: string, city?: string) => {
    try {
      const payload = {
        name,
        email,
        password,
        phoneNumber,
        role: accountType === 'startup' ? 'STARTUP' : 'USER',
        sector,
        country,
        city
      };

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = {
          ...data.data.user,
          balance: data.data.user.balance || 125000,
          portfolio: data.data.user.portfolio || 85000,
          returns: data.data.user.returns || 12.5,
          verified: data.data.user.verified || false,
          role: data.data.user.role // Important !
        };

        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        setShowAuthModal(false);

        // Redirection automatique si startup
        if (userData.role === 'STARTUP') {
          setActiveView('startup-dashboard');
        }
      } else {
        alert(data.message || 'Erreur d\'inscription');
      }
    } catch (error) {
      alert('Erreur d\'inscription au serveur');
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setActiveView('home');
  };

  // Données par défaut pour un utilisateur connecté
  const userBalance = user?.balance || 0;
  const userPortfolio = user?.portfolio || 0;
  const userReturns = user?.returns || 0;

  // Données simulées pour les startups
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
      team: 12
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
      team: 24
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
      team: 18
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
      team: 35
    }
  ];

  const portfolio = [
    { startup: 'AgroTech Solutions', shares: 150, value: 15000, change: 12.5 },
    { startup: 'MediConnect Africa', shares: 100, value: 25000, change: 23.8 },
    { startup: 'EduSmart', shares: 200, value: 35000, change: -5.2 },
    { startup: 'SolarPower SA', shares: 25, value: 10000, change: 45.6 }
  ];

  const notifications = [
    { id: 1, type: 'success', message: 'Ordre d\'achat exécuté: 50 actions AgroTech', time: 'Il y a 2h' },
    { id: 2, type: 'info', message: 'Nouvelle startup vérifiée: TechFinance Rwanda', time: 'Il y a 5h' },
    { id: 3, type: 'warning', message: 'Documents KYC expirent dans 30 jours', time: 'Il y a 1j' }
  ];

  // Glass Card Component
  interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: 'blue' | 'emerald' | 'sunset' | 'purple';
    hoverable?: boolean;
    onClick?: (() => void) | undefined;
  }

  const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glowColor = 'blue', hoverable = true, onClick = undefined }) => {
    const [isHovered, setIsHovered] = useState(false);

    const glowColors = {
      blue: 'rgba(74, 144, 226, 0.6)',
      emerald: 'rgba(0, 217, 163, 0.6)',
      sunset: 'rgba(255, 107, 53, 0.6)',
      purple: 'rgba(123, 97, 255, 0.6)',
    };

    return (
      <div
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Glow Effect */}
        {isHovered && (
          <div
            className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${glowColors[glowColor]}, transparent 50%)`,
              filter: 'blur(20px)',
            }}
          />
        )}

        {/* Glass Card */}
        <div
          className={`relative h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl rounded-2xl border border-white/10 p-6 ${hoverable ? 'cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-white/20' : ''
            }`}
        >
          {/* Glass Reflection */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {children}
        </div>
      </div>
    );
  };

  // Composant Modal d'authentification avec nouveau design
  const AuthModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      sector: '',
      country: 'Côte d\'Ivoire',
      city: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const sectors = [
      { id: 'fintech', name: 'FinTech', icon: Building2 },
      { id: 'healthtech', name: 'HealthTech', icon: Heart },
      { id: 'energy', name: 'Énergie', icon: Zap },
      { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
      { id: 'edtech', name: 'EdTech', icon: GraduationCap },
      { id: 'logistics', name: 'Logistique', icon: Truck },
      { id: 'agritech', name: 'AgriTech', icon: Leaf },
      { id: 'tech', name: 'Tech', icon: Cpu }
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      if (authMode === 'login') {
        await handleLogin(formData.email, formData.password);
      } else {
        await handleRegister(
          formData.name,
          formData.email,
          formData.password,
          formData.phoneNumber,
          selectedAccountType || undefined,
          formData.sector,
          formData.country,
          formData.city
        );
      }
      setIsLoading(false);
    };

    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.08] backdrop-blur-2xl rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {authMode === 'login' ? 'Se connecter' : 'Créer votre compte'}
            </h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur"
                    placeholder="+225 0123456789"
                  />
                </div>

                {selectedAccountType === 'startup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Secteur d'activité
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {sectors.map(sector => (
                          <button
                            key={sector.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, sector: sector.id })}
                            className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center ${formData.sector === sector.id
                              ? 'bg-white/20 border-white/40 text-white'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                              }`}
                          >
                            <sector.icon className="w-5 h-5 mb-1" />
                            <span className="text-xs">{sector.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Pays
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur"
                      >
                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 backdrop-blur"
                        placeholder="Abidjan"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : 'S\'inscrire')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            {authMode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  S'inscrire
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    );
  };

  // AccountTypeSelection component
  interface AccountTypeSelectionProps {
    onSelectType: (type: 'investor' | 'startup') => void;
  }

  const AccountTypeSelection: React.FC<AccountTypeSelectionProps> = ({ onSelectType }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      setIsVisible(true);
    }, []);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`max-w-4xl w-full transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Comment souhaitez-vous utiliser AfriStocks ?
              </h2>
              <p className="text-lg text-white/60">
                Sélectionnez le type de compte qui correspond à vos besoins
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Option Investisseur */}
              <div
                onClick={() => onSelectType('investor')}
                className="group relative cursor-pointer"
              >
                <div className="relative h-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 transition-all duration-300 hover:border-white/30 hover:bg-white/15">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-6">
                    <UserCircle className="w-8 h-8 text-emerald-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">Investisseur</h3>
                  <p className="text-white/70 mb-6">
                    Investissez dans des startups africaines prometteuses
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Pour investir</span>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Option Startup/PME */}
              <div
                onClick={() => onSelectType('startup')}
                className="group relative cursor-pointer"
              >
                <div className="relative h-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 transition-all duration-300 hover:border-white/30 hover:bg-white/15">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mb-6">
                    <Building2 className="w-8 h-8 text-orange-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">Startup / PME</h3>
                  <p className="text-white/70 mb-6">
                    Levez des fonds pour développer votre entreprise
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Pour lever des fonds</span>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Header avec nouveau design
  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-950/95 to-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-white/80 hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="relative">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div className="absolute inset-0 w-8 h-8 text-orange-500 blur-xl opacity-60" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                AfriStocks
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            <nav className="flex space-x-6">
              {['home', 'startups', 'portfolio', 'trading'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`relative text-sm font-medium transition-all duration-300 ${activeView === view
                    ? 'text-orange-400'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  {view === 'home' && 'Accueil'}
                  {view === 'startups' && 'Startups'}
                  {view === 'portfolio' && 'Portfolio'}
                  {view === 'trading' && 'Trading'}
                  {activeView === view && (
                    <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Bouton Dashboard pour les startups */}
            {isAuthenticated && user?.role === 'STARTUP' && (
              <button
                onClick={() => setActiveView('startup-dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeView === 'startup-dashboard'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
              >
                Mon Dashboard
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
              >
                <Bell className="w-5 h-5" />
                {isAuthenticated && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifications && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${notif.type === 'success' ? 'bg-emerald-400' :
                            notif.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                            }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-white/90">{notif.message}</p>
                            <p className="text-xs text-white/50 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section Authentification */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.name || 'Utilisateur'}</p>
                  <p className="text-xs text-white/60">
                    {user?.verified ? (
                      <span className="flex items-center text-emerald-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vérifié
                      </span>
                    ) : 'Non vérifié'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200"
                >
                  Déconnexion
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    setShowAccountTypeSelection(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
          <nav className="px-4 py-2 space-y-1">
            {['home', 'startups', 'portfolio', 'trading'].map((view) => (
              <button
                key={view}
                onClick={() => { setActiveView(view); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                {view === 'home' && 'Accueil'}
                {view === 'startups' && 'Startups'}
                {view === 'portfolio' && 'Portfolio'}
                {view === 'trading' && 'Trading'}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );

  // Vue Accueil avec nouveau design
  const HomeView = () => (
    <div className="space-y-8">
      {/* Section Hero */}
      <div className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-600/10 to-emerald-600/20 animate-gradient"></div>

        {/* Content */}
        <div className="relative glass-heavy p-8 md:p-12">
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
              <GlassCard className="group" hoverable={false}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/60">Solde disponible</p>
                  <Wallet className="w-5 h-5 text-blue-400 opacity-60" />
                </div>
                <p className="text-3xl font-bold text-white">{userBalance.toLocaleString()} XOF</p>
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
                <p className="text-3xl font-bold text-white">{userPortfolio.toLocaleString()} XOF</p>
                <div className="mt-2 flex items-center text-sm text-emerald-400">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+{userReturns}% total</span>
                </div>
              </GlassCard>

              <GlassCard className="group" hoverable={false}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/60">Rendement annuel</p>
                  <Activity className="w-5 h-5 text-orange-400 opacity-60" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  +{userReturns}%
                </p>
                <div className="mt-2 text-sm text-white/60">
                  Performance excellente
                </div>
              </GlassCard>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Commencer à investir
            </button>
          )}
        </div>
      </div>

      {/* Startups en vedette */}
      <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
          {startups.slice(0, 2).map((startup, index) => (
            <GlassCard
              key={startup.id}
              glowColor={index === 0 ? 'emerald' : 'blue'}
              onClick={() => { setSelectedStartup(startup); setActiveView('startup-detail'); }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{startup.name}</h3>
                  <p className="text-sm text-white/60">{startup.sector} • {startup.country}</p>
                </div>
                {startup.verified && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full flex items-center backdrop-blur">
                    <CheckCircle className="w-3 h-3 mr-1" />
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
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <GlassCard hoverable={false} className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total investi</p>
              <p className="text-2xl font-bold text-white">2.5M XOF</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Startups actives</p>
              <p className="text-2xl font-bold text-white">127</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Investisseurs</p>
              <p className="text-2xl font-bold text-white">3,456</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Rendement moyen</p>
              <p className="text-2xl font-bold text-emerald-400">+18.7%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // Vue Liste des Startups avec nouveau design
  const StartupsView = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explorer les Startups</h1>
        <p className="text-white/60">Découvrez les entreprises innovantes qui façonnent l'avenir de l'Afrique</p>
      </div>

      {/* Filtres avec glass effect */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une startup..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur"
          />
        </div>
        <select className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white backdrop-blur">
          <option>Tous les secteurs</option>
          <option>Agriculture</option>
          <option>Santé</option>
          <option>Education</option>
          <option>Energie</option>
          <option>FinTech</option>
        </select>
        <select className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white backdrop-blur">
          <option>Tous les pays</option>
          <option>Côte d'Ivoire</option>
          <option>Kenya</option>
          <option>Nigeria</option>
          <option>Afrique du Sud</option>
        </select>
      </div>

      {/* Liste des startups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.map((startup, index) => (
          <GlassCard
            key={startup.id}
            glowColor={(['emerald', 'blue', 'sunset', 'purple'] as const)[index % 4]}
            onClick={() => { setSelectedStartup(startup); setActiveView('startup-detail'); }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{startup.name}</h3>
                <p className="text-sm text-white/60">{startup.sector} • {startup.country}</p>
              </div>
              <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-white">{startup.rating}</span>
              </div>
            </div>

            <p className="text-sm text-white/70 mb-4 line-clamp-2">{startup.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Valorisation</span>
                <span className="text-sm font-semibold text-white">
                  {(startup.valuation / 1000000).toFixed(1)}M XOF
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Prix/action</span>
                <span className="text-sm font-semibold text-white">{startup.sharePrice} XOF</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Disponible</span>
                <span className="text-sm font-semibold text-white">
                  {startup.availableShares.toLocaleString()} actions
                </span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {startup.verified && (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Vérifié
                </span>
              )}
              {startup.pitchDeck && (
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  Pitch
                </span>
              )}
              {startup.video && (
                <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full flex items-center">
                  <Play className="w-3 h-3 mr-1" />
                  Vidéo
                </span>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex items-center text-emerald-400">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">+{startup.growth}%</span>
              </div>
              <span className="text-sm text-white/60">
                {startup.investors} investisseurs
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
            filter: 'blur(100px)',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: '-20%',
            right: '-10%',
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,217,163,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`,
            bottom: '-20%',
            left: '-10%',
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Mesh Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <Header />
      <AuthModal />
      {showAccountTypeSelection && (
        <AccountTypeSelection
          onSelectType={(type) => {
            setSelectedAccountType(type);
            setShowAccountTypeSelection(false);
            setAuthMode('register');
            setShowAuthModal(true);
          }}
        />
      )}

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {activeView === 'home' && <HomeView />}
        {activeView === 'startups' && <StartupsView />}
        {activeView === 'startup-dashboard' && user?.role === 'STARTUP' && (
          <StartupDashboardView startup={user} setActiveView={setActiveView} />
        )}
      </main>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .glass-heavy {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }
      `}</style>
    </div>
  );
};

export default AfriStocksApp;