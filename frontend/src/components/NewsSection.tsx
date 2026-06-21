// frontend/src/components/NewsSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Globe, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../hooks/useWebSocket';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { NewsArticle } from '../types';

// Types
interface News extends NewsArticle {
  category: string;
  importance: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  author: {
    id: string;
    name: string;
  };
  viewCount: number;
  tags?: string[];
}

interface NewsFilters {
  category: string;
  importance: string;
  search?: string;
}

// Hook personnalisé pour la gestion des news
const useNews = (filters: NewsFilters) => {
  const [news, setNews] = useState<News[]>([]); // Déjà initialisé à []

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { socket, connected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  });

  // Chargement initial et pagination
  const loadNews = useCallback(async (pageNum: number, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...filters
      });

      console.log('🔍 Chargement des news:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/v1/news?${params}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/v1/news?${params}`);
      console.log('📡 Réponse API:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 Données reçues:', data);

      // Protection contre undefined et génération d'IDs si nécessaire
      const rawNewsData = data.data || [];
      const newsData = rawNewsData.map((item: any, index: number) => {
        const processedItem = {
          ...item,
          id: item.id || `generated-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          publishedAt: item.publishedAt || new Date().toISOString(),
          author: item.author || { id: 'system', name: 'Système' },
          viewCount: item.viewCount || 0
        };

        // Log pour debug
        if (!item.id) {
          console.warn(`⚠️ Article sans ID détecté à l'index ${index}:`, {
            title: item.title,
            originalId: item.id,
            newId: processedItem.id
          });
        }

        return processedItem;
      });

      console.log('📊 Articles traités:', newsData.length, 'articles avec IDs valides');

      if (isRefresh) {
        setNews(newsData);
        setPage(1);
      } else if (pageNum === 1) {
        setNews(newsData);
      } else {
        setNews(prev => [...prev, ...newsData]);
      }

      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('❌ Erreur chargement news:', error);
      setNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  // Chargement initial
  useEffect(() => {
    loadNews(1);
  }, [loadNews]);

  // WebSocket events
  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'news:new':
            const newItem: News = data.payload;
            // Vérifier si elle correspond aux filtres actuels
            if (filters.category !== 'all' && newItem.category !== filters.category) return;
            if (filters.importance !== 'all' && newItem.importance !== filters.importance) return;
            setNews(prev => [newItem, ...prev]);
            showNotification(`Nouvelle actualité: ${newItem.title}`);
            break;

          case 'news:updated':
            const updatedItem: News = data.payload;
            setNews(prev => prev.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            ));
            break;

          case 'news:deleted':
            const { id } = data.payload;
            setNews(prev => prev.filter(item => item.id !== id));
            break;
        }
      } catch (error) {
        console.error('Erreur parsing message WebSocket:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, connected, filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNews(nextPage);
    }
  };

  const refresh = () => {
    loadNews(1, true);
  };

  return { news, loading, refreshing, hasMore, connected, loadMore, refresh };
};

// Composant NewsCard amélioré
const NewsCard = ({ article, priority }: { article: News; priority: boolean }) => {
  const [imageError, setImageError] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'MARKET_UPDATE': 'from-blue-500 to-indigo-500',
      'STARTUP_NEWS': 'from-emerald-500 to-teal-500',
      'INVESTMENT': 'from-orange-500 to-amber-500',
      'REGULATION': 'from-purple-500 to-pink-500',
      'TECHNOLOGY': 'from-cyan-500 to-blue-500',
      'ANALYSIS': 'from-gray-500 to-gray-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getImportanceBadge = (importance: string) => {
    const badges: Record<string, { color: string; text: string; pulse?: boolean }> = {
      'URGENT': { color: 'bg-red-500', text: 'URGENT', pulse: true },
      'HIGH': { color: 'bg-orange-500', text: 'IMPORTANT' },
      'NORMAL': { color: 'bg-blue-500', text: 'INFO' },
      'LOW': { color: 'bg-gray-500', text: 'SECONDAIRE' }
    };
    return badges[importance] || badges.NORMAL;
  };

  const badge = getImportanceBadge(article.importance);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="group relative backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:border-white/30 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}
    >
      {/* Badge importance */}
      {article.importance !== 'NORMAL' && (
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${badge.color} ${badge.pulse ? 'animate-pulse' : ''}`}>
            {badge.text}
          </span>
        </div>
      )}

      {/* Image avec fallback */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {article.imageUrl && !imageError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-16 h-16 text-white/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Catégorie */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(article.category)}`}>
            {article.category.replace('_', ' ')}
          </span>
        </div>

        {/* Live indicator pour les news urgentes */}
        {article.importance === 'URGENT' && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500/80 backdrop-blur rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-white">EN DIRECT</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-white/60 text-sm mb-4 line-clamp-2">
            {article.summary}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/70">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
            </span>
            <span>{article.viewCount} vues</span>
          </div>
          <span className="text-white/60">{article.author.name}</span>
        </div>
      </div>
    </motion.article>
  );
};

// Composant principal
export default function NewsSection() {
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    importance: 'all'
  });

  const { news, loading, refreshing, hasMore, connected, loadMore, refresh } = useNews(filters);

  // Debug: Afficher les informations de débogage
  console.log('🔍 NewsSection - État:', {
    newsCount: news.length,
    loading,
    refreshing,
    hasMore,
    connected,
    filters
  });

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll(loadMore, hasMore);

  // Categories disponibles
  const categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'MARKET_UPDATE', label: 'Marché' },
    { value: 'STARTUP_NEWS', label: 'Startups' },
    { value: 'INVESTMENT', label: 'Investissement' },
    { value: 'REGULATION', label: 'Régulation' },
    { value: 'TECHNOLOGY', label: 'Tech' },
    { value: 'ANALYSIS', label: 'Analyses' }
  ];

  const importanceLevels = [
    { value: 'all', label: 'Toutes' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'Important' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'LOW', label: 'Secondaire' }
  ];

  return (
    <section className="py-12 relative">
      {/* Header avec indicateur de connexion */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Actualités du marché
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-white/60">Mises à jour en temps réel</p>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${connected ? 'bg-emerald-500/20' : 'bg-red-500/20'
              }`}>
              {connected ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Connecté</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Hors ligne</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filtres et refresh */}
        <div className="flex items-center gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filters.importance}
            onChange={(e) => setFilters({ ...filters, importance: e.target.value })}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur"
          >
            {importanceLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenu avec AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div key="news-content" className="space-y-6">
          {/* Debug info */}
          <div className="mb-4 p-4 bg-white/10 rounded-lg">
            <p className="text-white/80 text-sm">
              Debug: {news.length} actualités, Loading: {loading ? 'Oui' : 'Non'},
              Connected: {connected ? 'Oui' : 'Non'}
            </p>
            {news.length > 0 && (
              <p className="text-white/60 text-xs mt-1">
                IDs: {news.map(n => n.id || 'SANS_ID').slice(0, 5).join(', ')}
                {news.length > 5 && '...'}
              </p>
            )}
          </div>

          {loading && news.length === 0 ? (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map(i => (
                <div key={`skeleton-${i}`} className="h-96 bg-white/10 rounded-2xl animate-pulse" />
              ))}
            </motion.div>
          ) : news.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Aucune actualité disponible</p>
            </motion.div>
          ) : (
            <motion.div
              key="news-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {news
                .filter(article => article && article.id)
                .map((article, index) => {
                  const uniqueKey = `${article.id}-${index}`;
                  return (
                    <NewsCard
                      key={uniqueKey}
                      article={article}
                      priority={index < 3}
                    />
                  );
                })}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sentinel pour infinite scroll */}
      <div ref={sentinelRef} className="h-20" />

      {/* Loader pour pagination */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-white/60">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Chargement...</span>
          </div>
        </div>
      )}
    </section>
  );
}

// Fonction helper pour les notifications
function showNotification(message: string) {
  // À implémenter selon votre système de notifications
  console.log('Notification:', message);
}
