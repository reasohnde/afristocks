// Créer src/app/views/NewsView.tsx
import React, { useState, useEffect } from 'react';
import {
  Calendar, Globe, Clock, TrendingUp, Filter, Search,
  Bookmark, Share2, ExternalLink, AlertCircle
} from 'lucide-react';
import { BackButton } from '../components/BackButton';

interface NewsViewProps {
  setActiveView: (view: string) => void;
  setSelectedNews?: (news: any) => void;
}

const NewsView: React.FC<NewsViewProps> = ({ setActiveView }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Charger les actualités
    setTimeout(() => {
      setNews([
        {
          id: 1,
          title: "L'écosystème des startups africaines attire un investissement record",
          excerpt: "Les startups fintech dominent avec 65% des financements...",
          category: "Financement",
          date: new Date(),
          readTime: "3 min",
          image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
          author: "Sarah M.",
          tags: ["FinTech", "Investissement", "Afrique"]
        },
        {
          id: 2,
          title: "M-Pesa révolutionne les paiements transfrontaliers",
          excerpt: "La plateforme s'étend à 7 nouveaux pays...",
          category: "Innovation",
          date: new Date(),
          readTime: "5 min",
          image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop",
          author: "John D.",
          tags: ["Mobile Money", "Kenya", "Paiements"]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', 'Financement', 'Innovation', 'Politique', 'Marché'];

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filter === 'all' || article.category === filter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white">Chargement des actualités...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => setActiveView('home')} />
          <div>
            <h1 className="text-3xl font-bold text-white">Actualités</h1>
            <p className="text-white/60">Les dernières nouvelles du marché africain</p>
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div className="flex gap-2 p-1 bg-white/10 rounded-xl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg transition-all capitalize ${filter === cat
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white'
                }`}
            >
              {cat === 'all' ? 'Toutes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des articles */}
      <div className="grid gap-6">
        {filteredNews.map(article => (
          <article
            key={article.id}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:border-white/30 transition-all"
          >
            <div className="md:flex">
              <div className="md:w-1/3">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 md:h-full object-cover"
                />
              </div>

              <div className="flex-1 p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-white mb-2 hover:text-orange-400 transition-colors cursor-pointer">
                  {article.title}
                </h2>

                <p className="text-white/70 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {article.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Bookmark className="w-4 h-4 text-white/60" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Share2 className="w-4 h-4 text-white/60" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <ExternalLink className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsView;