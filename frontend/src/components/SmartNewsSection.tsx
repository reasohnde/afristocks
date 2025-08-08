// frontend/src/components/SmartNewsSection.tsx
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

const SmartNewsSection = () => {
  const [news, setNews] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    sector: 'all',
    sentiment: 'all',
    country: 'all'
  });
  const [loading, setLoading] = useState(true);

  // WebSocket pour updates temps réel
  const { socket } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  });

  useEffect(() => {
    fetchNews();

    // Écouter les mises à jour
    if (socket) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Nouvelles actualités:', data);
          // Ajouter les nouvelles en haut
          if (data.articles) {
            setNews(prev => [...data.articles, ...prev].slice(0, 20));
          }
        } catch (error) {
          console.error('Erreur parsing WebSocket:', error);
        }
      };

      socket.addEventListener('message', handleMessage);

      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    }
  }, [filters, socket]);

  const fetchNews = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Erreur chargement news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Actualités du marché
          </h2>
          <p className="text-white/60">
            Analysées par IA • Mises à jour en temps réel
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          <select
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="all">Tous secteurs</option>
            <option value="fintech">FinTech</option>
            <option value="agritech">AgriTech</option>
            <option value="healthtech">HealthTech</option>
          </select>

          <select
            value={filters.sentiment}
            onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="all">Tout sentiment</option>
            <option value="positif">Positif</option>
            <option value="neutre">Neutre</option>
            <option value="négatif">Négatif</option>
          </select>
        </div>
      </div>

      {/* Articles avec indicateurs IA */}
      <div className="grid gap-6">
        {news.map((article, i) => (
          <article
            key={article.id || i}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {article.title}
                </h3>

                {/* Métadonnées IA */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.sectors?.map((sector: string) => (
                    <span key={sector} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                      {sector}
                    </span>
                  ))}
                  {article.countries?.map((country: string) => (
                    <span key={country} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      {country}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score d'impact */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  article.impactScore > 7 ? 'text-emerald-400' :
                  article.impactScore > 4 ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {article.impactScore}/10
                </div>
                <p className="text-xs text-white/60">Impact</p>
              </div>
            </div>

            {/* Résumé IA */}
            <p className="text-white/80 mb-4">
              {article.summary}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{article.source}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                <span className={`px-2 py-0.5 rounded ${
                  article.sentiment === 'positif' ? 'bg-emerald-500/20 text-emerald-400' :
                  article.sentiment === 'négatif' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {article.sentiment}
                </span>
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 text-sm"
              >
                Lire plus →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SmartNewsSection;
