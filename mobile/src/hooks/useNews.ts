// mobile/src/hooks/useNews.ts
import { useEffect, useState } from 'react';
import newsService from '../services/newsService';

export function useNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🔄 useNews useEffect - Initialisation');

        // Charger les news initiales
        loadNews();

        // Connecter WebSocket
        newsService.connectWebSocket();

        // Écouter les updates
        const handleNewNews = (data: any) => {
            console.log('📰 Nouvelle actualité reçue via WebSocket:', data);
            setNews(prev => {
                // Éviter les doublons
                const exists = prev.find(item => item.id === data.id);
                if (exists) {
                    console.log('⚠️ Actualité déjà présente, mise à jour');
                    return prev.map(item => item.id === data.id ? data : item);
                }
                console.log('✅ Ajout de nouvelle actualité');
                return [data, ...prev];
            });
        };

        const handleUpdate = (data: any) => {
            console.log('📝 Actualité mise à jour via WebSocket:', data);
            setNews(prev => prev.map(item =>
                item.id === data.id ? data : item
            ));
        };

        const handleDelete = (data: any) => {
            console.log('🗑️ Actualité supprimée via WebSocket:', data);
            setNews(prev => prev.filter(item => item.id !== data.id));
        };

        // S'abonner aux événements WebSocket
        newsService.on('news:new', handleNewNews);
        newsService.on('news:updated', handleUpdate);
        newsService.on('news:deleted', handleDelete);

        return () => {
            console.log('🧹 Nettoyage useNews useEffect');
            newsService.off('news:new', handleNewNews);
            newsService.off('news:updated', handleUpdate);
            newsService.off('news:deleted', handleDelete);
        };
    }, []);

    const loadNews = async () => {
        try {
            console.log('🔄 useNews.loadNews - Début');
            setLoading(true);
            setError(null);

            const result = await newsService.getNews();
            console.log('📦 Résultat getNews:', result);

            if (result.data && Array.isArray(result.data)) {
                setNews(result.data);
                console.log('✅ Actualités chargées:', result.data.length);
            } else {
                console.warn('⚠️ Format de données inattendu:', result);
                setNews([]);
            }
        } catch (error) {
            console.error('❌ Erreur loadNews:', error);
            setError(error.message);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    return { news, loading, error, refresh: loadNews };
} 