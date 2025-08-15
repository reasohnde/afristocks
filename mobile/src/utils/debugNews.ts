// mobile/src/utils/debugNews.ts
import { API_URL } from '../config/constants';

export const debugNewsAPI = async () => {
    try {
        console.log('🔍 Debug News API...');
        console.log('📍 API_URL:', API_URL);

        // Test 1: Connexion basique
        console.log('\n📡 Test 1: Connexion basique');
        const response = await fetch(`${API_URL}/api/v1/news?limit=3`);
        console.log('✅ Statut:', response.status, response.statusText);

        const data = await response.json();
        console.log('📊 Données reçues:', data);
        console.log('📰 Actualités trouvées:', data.data?.length || 0);

        if (data.data && data.data.length > 0) {
            console.log('📝 Première actualité:', {
                id: data.data[0].id,
                title: data.data[0].title,
                category: data.data[0].category,
                publishedAt: data.data[0].publishedAt
            });
        }

        // Test 2: Avec authentification
        console.log('\n🔐 Test 2: Avec authentification');
        const authResponse = await fetch(`${API_URL}/api/v1/news?limit=2`, {
            headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Statut auth:', authResponse.status);

        // Test 3: Filtres
        console.log('\n🔍 Test 3: Filtres');
        const filterResponse = await fetch(`${API_URL}/api/v1/news?category=STARTUP_NEWS&limit=1`);
        console.log('✅ Statut filtre:', filterResponse.status);

        return {
            success: true,
            basicTest: response.ok,
            authTest: authResponse.ok,
            filterTest: filterResponse.ok,
            data: data
        };

    } catch (error) {
        console.error('❌ Erreur debug:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const testNewsService = async () => {
    try {
        console.log('🧪 Test NewsService...');

        // Importer le service
        const newsService = require('../services/newsService').default;

        // Test getNews
        console.log('📡 Test getNews...');
        const result = await newsService.getNews({ limit: 2 });
        console.log('✅ Résultat getNews:', result);

        return {
            success: true,
            result: result
        };

    } catch (error) {
        console.error('❌ Erreur test service:', error);
        return {
            success: false,
            error: error.message
        };
    }
}; 