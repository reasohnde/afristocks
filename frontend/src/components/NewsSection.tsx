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
      'MARKET_UPDATE': 'text-blue-700 bg-blue-50 border border-blue-200',
      'STARTUP_NEWS': 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      'INVESTMENT': 'text-amber-700 bg-amber-50 border border-amber-200',
      'REGULATION': 'text-purple-700 bg-purple-50 border border-purple-200',
      'TECHNOLOGY': 'text-cyan-700 bg-cyan-50 border border-cyan-200',
      'ANALYSIS': 'text-slate-600 bg-slate-50 border border-slate-200'
    };
    return colors[category] || 'text-slate-600 bg-slate-50 border border-slate-200';
  };

  const getImportanceBadge = (importance: string) => {
    const badges: Record<string, { color: string; text: string; pulse?: boolean }> = {
      'URGENT': { color: 'text-red-700 bg-red-50 border border-red-200', text: 'URGENT', pulse: true },
      'HIGH': { color: 'text-amber-700 bg-amber-50 border border-amber-200', text: 'IMPORTANT' },
      'NORMAL': { color: 'text-blue-700 bg-blue-50 border border-blue-200', text: 'INFO' },
      'LOW': { color: 'text-slate-600 bg-slate-50 border border-slate-200', text: 'SECONDAIRE' }
    };
    return badges[importance] || badges.NORMAL;
  };

  const badge = getImportanceBadge(article.importance);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:border-slate-300 transition-all duration-300"
    >
      {/* Badge importance */}
      {article.importance !== 'NORMAL' && (
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color} ${badge.pulse ? 'animate-pulse' : ''}`}>
            {badge.text}
          </span>
        </div>
      )}

      {/* Image avec fallback */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {article.imageUrl && !imageError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() => setImageError(true)}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-16 h-16 text-slate-300" />
          </div>
        )}

        {/* Catégorie */}
        <div className="absolute top-4 left-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
            {article.category.replace('_', ' ')}
          </span>
        </div>

        {/* Live indicator pour les news urgentes */}
        {article.importance === 'URGENT' && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-white">EN DIRECT</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">
            {article.summary}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
            </span>
            <span className="tabular-nums">{article.viewCount} vues</span>
          </div>
          <span className="text-slate-500">{article.author.name}</span>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Actualités du marché
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-slate-500">Mises à jour en temps réel</p>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${connected ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
              }`}>
              {connected ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Connecté</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Hors ligne</span>
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
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filters.importance}
            onChange={(e) => setFilters({ ...filters, importance: e.target.value })}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
          >
            {importanceLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="p-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenu avec AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div key="news-content" className="space-y-6">
          {loading && news.length === 0 ? (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map(i => (
                <div key={`skeleton-${i}`} className="h-96 bg-slate-100 border border-slate-200 rounded-lg animate-pulse" />
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
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucune actualité disponible</p>
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
          <div className="flex items-center gap-2 text-slate-500">
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
