// src/components/layout/Header.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: any;
  isAuthenticated: boolean;
  onLogout: () => void;
  onShowAuth: (mode: 'login' | 'register') => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isAuthenticated,
  onLogout,
  onShowAuth,
  activeView,
  onViewChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { key: 'home', label: 'Accueil' },
    { key: 'startups', label: 'Startups' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'trading', label: 'Trading' },
  ];

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/10' 
          : 'bg-gradient-to-b from-slate-950/80 to-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-white/80 hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                className={cn(
                  'relative text-sm font-medium transition-all duration-300',
                  activeView === item.key 
                    ? 'text-orange-400' 
                    : 'text-white/70 hover:text-white'
                )}
              >
                {item.label}
                {activeView === item.key && (
                  <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 relative">
              <Bell className="w-5 h-5" />
              {isAuthenticated && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-white/60">
                    {user?.balance?.toLocaleString()} XOF
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onShowAuth('login')}
                  className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => onShowAuth('register')}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onViewChange(item.key);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};