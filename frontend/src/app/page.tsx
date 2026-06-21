"use client";

import React, { useState, useEffect } from 'react';
import {
  Search, TrendingUp, Shield, Globe, Users, BarChart3, Menu, X, ChevronRight,
  Star, Play, FileText, ArrowUpRight, ArrowDownRight, Bell, Briefcase, LineChart,
  CheckCircle, AlertCircle, Sparkles, Zap, Activity, DollarSign, Wallet, Building2,
  UserCircle, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube,
  Heart, BookOpen, HeadphonesIcon, CreditCard, Award,
  Edit3, Camera, FileCheck, Eye, Plus, Upload, Download, GlobeIcon,
  Cpu, Leaf, Truck, GraduationCap, ShoppingCart, Construction, ArrowLeft
} from 'lucide-react';

// Import du contexte Fund
import { FundProvider } from '../contexts/FundContext';

// Import des vues Investment
import InvestmentFundView from './views/InvestmentFundView';
import InvestmentCheckoutView from './views/InvestmentCheckoutView';

// Import des vues
import HomeView from './views/HomeView';
import StartupsView from './views/StartupsView';
import PortfolioView from './views/PortfolioView';
import TradingView from './views/TradingView';
import StartupDetailView from './views/StartupDetailView';
import StartupDashboardView from './views/StartupDashboardView';
import AdminDashboardView from './views/AdminDashboardView';
import AdminStartupsView from './views/AdminStartupsView';
import AdminUsersView from './views/AdminUsersView';
import AdminVerificationView from './views/AdminVerificationView';
import AdminNewsView from './views/AdminNewsView';
import UnderConstructionView from './views/UnderConstructionView';

// Import des vues Learn
import FAQView from './views/learn/FAQView';
import FormationsView from './views/learn/FormationsView';
import FormationDetailView from './views/learn/FormationDetailView';
import InvestmentGuideView from './views/learn/InvestmentGuideView';
import LearnTradingView from './views/learn/LearnTradingView';

// Import du composant NewsSection
import NewsSection from '../components/NewsSection';

// Import du composant Toast
import { Toast } from './components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

// Interface pour NewsletterModal
interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Composant Modal Newsletter
const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation d'inscription
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubscribed(true);
    setIsLoading(false);

    // Fermer après 2 secondes
    setTimeout(() => {
      onClose();
      setIsSubscribed(false);
      setEmail('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/20">
        {!isSubscribed ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Newsletter AfriStocks</h2>
            <p className="text-white/60 mb-6">
              Recevez les dernières opportunités d'investissement directement dans votre boîte mail
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Inscription...' : "S'inscrire"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Inscription réussie !</h3>
            <p className="text-white/60">Merci de votre inscription à notre newsletter</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AfriStocksApp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [activeView, setActiveView] = useState('home');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // État pour la newsletter
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  // État pour la section en construction
  const [currentSection, setCurrentSection] = useState<{ section: string; item?: string } | undefined>(undefined);

  // 2. ÉTATS - Ajoutez cet état après vos autres useState
  const [selectedFormation, setSelectedFormation] = useState(null);

  // État pour les toasts
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // État pour le compteur de nouvelles non lues
  const [unreadNewsCount, setUnreadNewsCount] = useState(0);

  // Fonction pour afficher un toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  // Gestion de l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showAccountTypeSelection, setShowAccountTypeSelection] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<'investor' | 'startup' | null>(null);

  // Animation effects
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Erreur parsing user data:', e);
        }
      }
    }
  }, []);

  // Fonction de connexion MODIFIÉE (sans alert)
  const handleLogin = async (email: string, password: string) => {
    console.log('Tentative de connexion:', { email });
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('📥 Réponse login:', data);

      if (response.ok && data.token) {
        const userData = {
          ...data.user,
          balance: data.user.balance || 125000,
          portfolio: data.user.portfolio || 85000,
          returns: data.user.returns || 12.5,
          verified: data.user.verified || false
        };

        // Stocker toutes les informations nécessaires
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userInfo', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role
        }));
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        setShowAuthModal(false);

        console.log('✅ Login réussi:', {
          email: data.user.email,
          role: data.user.role
        });

        // Toast de succès
        showToast('Connexion réussie ! Bienvenue sur AfriStocks', 'success');

        // Redirection selon le rôle
        if (data.user.role === 'ADMIN') {
          setActiveView('admin-dashboard');
        } else if (data.user.role === 'STARTUP') {
          setActiveView('startup-dashboard');
        } else {
          setActiveView('dashboard');
        }
      } else {
        showToast(data.error || data.message || 'Erreur de connexion', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur login:', error);
      showToast('Erreur de connexion au serveur. Vérifiez que le backend est démarré.', 'error');
    }
  };

  // Fonction d'inscription MODIFIÉE (sans alert)
  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    accountType: 'investor' | 'startup',
    sector?: string,
    country?: string,
    city?: string
  ) => {
    console.log('=== DÉBUT INSCRIPTION ===');
    console.log('Données reçues:', { name, email, phoneNumber, accountType, sector, country, city });

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

      console.log('URL API:', `${API_URL}/api/auth/register`);
      console.log('Payload envoyé:', JSON.stringify(payload));

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Status de la réponse:', response.status);
      const data = await response.json();
      console.log('Données reçues:', data);

      if (response.ok) {
        console.log('Inscription réussie !');

        const token = data.token;
        const userData = data.user;

        const userInfo = {
          ...userData,
          balance: userData.balance || 125000,
          portfolio: userData.portfolio || 85000,
          returns: userData.returns || 12.5,
          verified: userData.verified || false
        };

        if (token) {
          localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(userInfo));

        setUser(userInfo);
        setIsAuthenticated(true);
        setShowAuthModal(false);

        // Toast de succès
        showToast('Inscription réussie ! Bienvenue sur AfriStocks', 'success');

        // Redirection startup après inscription
        if (userInfo.role === 'STARTUP') {
          setActiveView('startup-dashboard');
        }
      } else {
        console.error('Erreur inscription:', data);
        showToast(data.error || data.message || 'Erreur d\'inscription', 'error');
      }
    } catch (error: any) {
      console.error('=== ERREUR INSCRIPTION ===');
      console.error('Type d\'erreur:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      showToast('Erreur de connexion au serveur. Vérifiez que le backend est démarré sur le port 5001.', 'error');
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setActiveView('home');
    showToast('Déconnexion réussie', 'info');
  };

  // Glass Card Component
  // Interface pour GlassCard
  interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    onClick?: (() => void) | undefined;
  }

  const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverable = true, onClick = undefined }) => {
    return (
      <div
        className={`relative group ${className}`}
        onClick={onClick}
      >
        <div
          className={`relative h-full backdrop-blur-xl rounded-2xl border border-white/20 p-6 overflow-hidden ${hoverable ? 'cursor-pointer transition-all duration-500 hover:border-white/30' : ''
            }`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              }}
            />
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Notifications
  const notifications = [
    { id: 1, type: 'success', message: 'Ordre d\'achat exécuté: 50 actions AgroTech', time: 'Il y a 2h' },
    { id: 2, type: 'info', message: 'Nouvelle startup vérifiée: TechFinance Rwanda', time: 'Il y a 5h' },
    { id: 3, type: 'warning', message: 'Documents KYC expirent dans 30 jours', time: 'Il y a 1j' }
  ];

  // Composant Modal d'authentification
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
    const [errors, setErrors] = useState<any>({});

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

    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      if (errors[field]) {
        setErrors((prev: any) => ({ ...prev, [field]: '' }));
      }
    };

    const validateForm = () => {
      const newErrors: any = {};

      if (authMode === 'register') {
        if (!formData.name.trim()) {
          newErrors.name = 'Le nom est requis';
        }
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Le numéro de téléphone est requis';
        }

        if (selectedAccountType === 'startup') {
          if (!formData.sector) {
            newErrors.sector = 'Le secteur est requis';
          }
          if (!formData.city.trim()) {
            newErrors.city = 'La ville est requise';
          }
        }
      }

      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }

      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      try {
        if (authMode === 'login') {
          await handleLogin(formData.email.trim(), formData.password);
        } else {
          await handleRegister(
            formData.name.trim(),
            formData.email.trim(),
            formData.password,
            formData.phoneNumber.trim(),
            selectedAccountType || 'investor',
            formData.sector,
            formData.country,
            formData.city
          );
        }
      } catch (error) {
        console.error('Erreur auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {authMode === 'login' ? 'Se connecter' : 'Créer votre compte'}
            </h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-white/60 hover:text-white transition-colors"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border ${errors.name ? 'border-red-500' : 'border-white/20'
                      } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur`}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Numéro de téléphone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border ${errors.phoneNumber ? 'border-red-500' : 'border-white/20'
                      } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur`}
                    placeholder="+225 0123456789"
                    disabled={isLoading}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-400">{errors.phoneNumber}</p>
                  )}
                </div>

                {selectedAccountType === 'startup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Secteur d'activité <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {sectors.map(sector => (
                          <button
                            key={sector.id}
                            type="button"
                            onClick={() => handleInputChange('sector', sector.id)}
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
                      {errors.sector && (
                        <p className="mt-1 text-xs text-red-400">{errors.sector}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Pays
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur"
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
                        Ville <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 border ${errors.city ? 'border-red-500' : 'border-white/20'
                          } rounded-xl text-white placeholder-white/40 backdrop-blur`}
                        placeholder="Abidjan"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-400">{errors.city}</p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'
                  } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur`}
                placeholder="email@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Mot de passe <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.password ? 'border-red-500' : 'border-white/20'
                  } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-white/40 backdrop-blur`}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              ) : (
                authMode === 'login' ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            {authMode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                  type="button"
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
                  type="button"
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

  // Header Component
  const Header = () => (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-slate-950/95 backdrop-blur-2xl shadow-lg' : 'bg-gradient-to-b from-slate-950/95 to-slate-950/80 backdrop-blur-xl'
      } border-b border-white/10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-white/80 hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center ml-2 lg:ml-0 cursor-pointer" onClick={() => setActiveView('home')}>
              <div className="relative">
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                AfriStocks
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            <nav className="flex space-x-6">
              {['home', 'startups', 'portfolio', 'trading', 'actualites', 'formations', 'faq'].map((view) => (
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
                  {view === 'actualites' && 'Actualités'}
                  {view === 'formations' && 'Formations'}
                  {view === 'faq' && 'FAQ'}
                  {activeView === view && (
                    <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
                  )}
                </button>
              ))}

              {user?.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setActiveView('admin-dashboard')}
                    className={`relative text-sm font-medium transition-all duration-300 ${activeView.startsWith('admin')
                      ? 'text-orange-400'
                      : 'text-white/70 hover:text-white'
                      }`}
                  >
                    Administration
                    {activeView.startsWith('admin') && (
                      <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveView('admin-news')}
                    className={`relative text-sm font-medium transition-all duration-300 ${activeView === 'admin-news'
                      ? 'text-orange-400'
                      : 'text-white/70 hover:text-white'
                      }`}
                  >
                    Gérer Actualités
                    {activeView === 'admin-news' && (
                      <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
                    )}
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
              >
                <Bell className="w-5 h-5" />
                {isAuthenticated && (
                  <>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>
                    {/* Badge pour les news non lues */}
                    {unreadNewsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNewsCount}
                      </span>
                    )}
                  </>
                )}
              </button>

              {showNotifications && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden bg-white/10">
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

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
                {user?.role === 'STARTUP' && (
                  <button
                    onClick={() => setActiveView('startup-dashboard')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all mr-3 ${activeView === 'startup-dashboard'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                  >
                    Mon Dashboard
                  </button>
                )}

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
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
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
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-medium"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
          <nav className="px-4 py-2 space-y-1">
            {['home', 'startups', 'portfolio', 'trading', 'actualites'].map((view) => (
              <button
                key={view}
                onClick={() => { setActiveView(view); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                {view === 'home' && 'Accueil'}
                {view === 'startups' && 'Startups'}
                {view === 'portfolio' && 'Portfolio'}
                {view === 'trading' && 'Trading'}
                {view === 'actualites' && 'Actualités'}
              </button>
            ))}

            {isAuthenticated && user?.role === 'STARTUP' && (
              <button
                onClick={() => { setActiveView('startup-dashboard'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Mon Dashboard
              </button>
            )}

            {isAuthenticated && user?.role === 'ADMIN' && (
              <button
                onClick={() => { setActiveView('admin-dashboard'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Administration
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );

  // Footer Component MODIFIÉ sans alertes
  const Footer = () => {
    // Fonction pour gérer les clics sur les liens du footer
    const handleFooterClick = (section: string, item?: string) => {
      setCurrentSection({ section, item });
      setActiveView('under-construction');
    };

    return (
      <footer className="bg-slate-950 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Section principale */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Logo et description */}
            <div className="lg:col-span-2">
              <div
                className="flex items-center mb-4 cursor-pointer"
                onClick={() => setActiveView('home')}
              >
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  AfriStocks
                </span>
              </div>
              <p className="text-white/60 mb-6">
                La plateforme de référence pour investir dans les startups africaines
              </p>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowNewsletterModal(true)}
                  className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  S'abonner à la Newsletter
                </button>
                <button
                  onClick={() => handleFooterClick('donate')}
                  className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Faire un don
                </button>
              </div>

              {/* Contact */}
              <div className="mt-6 space-y-2">
                <a href="tel:+2250123456789" className="flex items-center text-white/60 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  +225 01 23 45 67 89
                </a>
                <a href="mailto:contact@afristocks.com" className="flex items-center text-white/60 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 mr-2" />
                  contact@afristocks.com
                </a>
                <p className="flex items-start text-white/60">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                  Abidjan, Côte d'Ivoire
                </p>
              </div>
            </div>

            {/* Produit */}
            <div>
              <h3 className="text-white font-semibold mb-4">Produit</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleFooterClick('how-it-works')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Comment ça marche
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterClick('pricing')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Tarifs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterClick('security')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Sécurité
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterClick('api')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    API
                  </button>
                </li>
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Ressources</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setActiveView('investment-guide');
                      window.scrollTo(0, 0);
                    }}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Guide d'investissement
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveView('formations');
                      window.scrollTo(0, 0);
                    }}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Formations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveView('learn-trading');
                      window.scrollTo(0, 0);
                    }}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Apprendre à trader
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveView('faq');
                      window.scrollTo(0, 0);
                    }}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Légal</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleFooterClick('terms')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Conditions d'utilisation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterClick('privacy')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterClick('compliance')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Conformité
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterClick('licenses')}
                    className="text-white/60 hover:text-white transition-colors text-left"
                  >
                    Licences
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Boutons additionnels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-b border-white/10">
            <button
              onClick={() => handleFooterClick('partner')}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white/80"
            >
              <Users className="w-4 h-4" />
              Devenir partenaire
            </button>
            <button
              onClick={() => handleFooterClick('advisor')}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white/80"
            >
              <HeadphonesIcon className="w-4 h-4" />
              Conseil financier
            </button>
            <button
              onClick={() => handleFooterClick('help')}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white/80"
            >
              <CreditCard className="w-4 h-4" />
              Aide
            </button>
            <button
              onClick={() => handleFooterClick('formations')}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white/80"
            >
              <BookOpen className="w-4 h-4" />
              Formations
            </button>
          </div>

          {/* Copyright et réseaux sociaux */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8">
            <p className="text-white/60 text-sm mb-4 md:mb-0">
              © 2025 AfriStocks. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Newsletter */}
        {showNewsletterModal && (
          <NewsletterModal
            isOpen={showNewsletterModal}
            onClose={() => setShowNewsletterModal(false)}
          />
        )}
      </footer>
    );
  };

  // Composant de sélection du type de compte
  // Interface pour AccountTypeSelection
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 backdrop-blur-xl mb-6">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-300">Choisissez votre type de compte</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  Comment souhaitez-vous utiliser{' '}
                </span>
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  AfriStocks ?
                </span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Sélectionnez le type de compte qui correspond le mieux à vos besoins
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
                    Investissez dans des startups africaines prometteuses et diversifiez votre portfolio
                  </p>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Accès à des startups vérifiées</span>
                    </li>
                    <li className="flex items-start text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Outils d'analyse et de suivi</span>
                    </li>
                    <li className="flex items-start text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Diversification du portfolio</span>
                    </li>
                  </ul>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Idéal pour les particuliers</span>
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
                    Levez des fonds pour développer votre entreprise et accélérer votre croissance
                  </p>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Levée de fonds simplifiée</span>
                    </li>
                    <li className="flex items-start text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Visibilité auprès d'investisseurs</span>
                    </li>
                    <li className="flex items-start text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Accompagnement personnalisé</span>
                    </li>
                  </ul>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Pour les entreprises innovantes</span>
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

  return (
    <FundProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
        {/* Background simple sans particules distrayantes */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-emerald-500/5" />
        </div>

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
          {activeView === 'home' && <HomeView isAuthenticated={isAuthenticated} user={user} mounted={mounted} setActiveView={setActiveView} setAuthMode={setAuthMode} setShowAuthModal={setShowAuthModal} setShowAccountTypeSelection={setShowAccountTypeSelection} />}
          {activeView === 'startups' && <StartupsView setSelectedStartup={setSelectedStartup} setActiveView={setActiveView} />}
          {activeView === 'portfolio' && <PortfolioView isAuthenticated={isAuthenticated} user={user} setActiveView={setActiveView} setAuthMode={setAuthMode} setShowAuthModal={setShowAuthModal} />}
          {activeView === 'trading' && <TradingView isAuthenticated={isAuthenticated} user={user} setActiveView={setActiveView} />}
          {activeView === 'actualites' && <NewsSection />}

          {/* Vue détail startup avec toutes les props */}
          {activeView === 'startup-detail' && selectedStartup && (
            <StartupDetailView
              startup={selectedStartup}
              setActiveView={setActiveView}
              isAuthenticated={isAuthenticated}
              setShowAuthModal={setShowAuthModal}
              setAuthMode={setAuthMode}
              user={user}
            />
          )}

          {/* Vue fonds d'investissement */}
          {activeView === 'investment-fund' && (
            <InvestmentFundView
              setActiveView={setActiveView}
              setCheckoutData={setCheckoutData}
              isAuthenticated={isAuthenticated}
              user={user}
            />
          )}

          {/* Vue checkout d'investissement */}
          {activeView === 'investment-checkout' && checkoutData && (
            <InvestmentCheckoutView
              checkoutData={checkoutData}
              setActiveView={setActiveView}
              isAuthenticated={isAuthenticated}
              user={user}
            />
          )}

          {/* Dashboard startup */}
          {activeView === 'startup-dashboard' && user?.role === 'STARTUP' && (
            <StartupDashboardView startup={user} setActiveView={setActiveView} />
          )}

          {/* Vues Admin */}
          {activeView === 'admin-dashboard' && user?.role === 'ADMIN' && (
            <AdminDashboardView setActiveView={setActiveView} />
          )}
          {activeView === 'admin-startups' && user?.role === 'ADMIN' && (
            <AdminStartupsView setActiveView={setActiveView} />
          )}
          {activeView === 'admin-users' && user?.role === 'ADMIN' && (
            <AdminUsersView setActiveView={setActiveView} />
          )}
          {activeView === 'admin-verification' && user?.role === 'ADMIN' && (
            <AdminVerificationView setActiveView={setActiveView} />
          )}
          {activeView === 'admin-news' && user?.role === 'ADMIN' && (
            <AdminNewsView setActiveView={setActiveView} />
          )}

          {/* Vue en construction */}
          {activeView === 'under-construction' && (
            <UnderConstructionView setActiveView={setActiveView} section={currentSection} />
          )}

          {/* Nouvelles vues (optionnel) */}
          {activeView === 'faq' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-white">FAQ</h1>
              <p className="text-white/60">Page FAQ en construction...</p>
            </div>
          )}

          {activeView === 'blog' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-white">Blog</h1>
              <p className="text-white/60">Page Blog en construction...</p>
            </div>
          )}

          {activeView === 'support' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-white">Support</h1>
              <p className="text-white/60">Page Support en construction...</p>
            </div>
          )}

          {/* 4. RENDU DES VUES - Ajoutez ces conditions dans votre <main> */}
          {/* Vues Learn */}
          {activeView === 'faq' && <FAQView />}
          {activeView === 'formations' && (
            <FormationsView
              setSelectedFormation={setSelectedFormation}
              setActiveView={setActiveView}
            />
          )}
          {activeView === 'formation-detail' && selectedFormation && (
            <FormationDetailView
              formation={selectedFormation}
              setActiveView={setActiveView}
              isAuthenticated={isAuthenticated}
              setShowAuthModal={setShowAuthModal}
              setAuthMode={setAuthMode}
              user={user}
            />
          )}
          {activeView === 'investment-guide' && (
            <InvestmentGuideView setActiveView={setActiveView} />
          )}
          {activeView === 'learn-trading' && (
            <LearnTradingView setActiveView={setActiveView} />
          )}
        </main>

        <Footer />

        {/* Toast notifications */}
        {toast?.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <style jsx>{`
          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes slide-in-up {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .animate-slide-in-up {
            animation: slide-in-up 0.3s ease-out;
          }
        `}</style>
      </div>
    </FundProvider>
  );
};

export default AfriStocksApp;