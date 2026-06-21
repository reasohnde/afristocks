// src/app/news/SmartNewsSection.tsx
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  source: string;
  image?: string;
  link?: string;
}

const SmartNewsSection = () => {
  const [news, setNews] = useState<NewsArticle[]>([]); // Type explicite
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data.articles || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Socket.IO connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002');

    newSocket.on('connect', () => {
      console.log('Socket.IO connecté');
    });

    newSocket.on('news:update', (data: { articles: NewsArticle[] }) => {
      console.log('Nouvelles actualités:', data);
      setNews(prev => [...data.articles, ...prev].slice(0, 20));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Pour éviter les erreurs de variables non utilisées
  const handleRefresh = () => {
    fetchNews();
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h2>Smart News Section</h2>
      <button onClick={handleRefresh}>Actualiser</button>
      <div>
        {news.map((article, i) => (
          <div key={article.id || i}>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartNewsSection;