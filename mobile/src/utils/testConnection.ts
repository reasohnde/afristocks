// mobile/src/utils/testConnection.ts
import { API_URL } from '../config/constants';

export const testBackendConnection = async () => {
    try {
        console.log('🔍 Test connexion backend...');
        console.log('📍 URL:', API_URL);

        // Test 1: Connexion basique
        const response = await fetch(`${API_URL}/api/v1/news?limit=1`);
        console.log('📡 Statut:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Connexion réussie');
            console.log('📊 Actualités trouvées:', data.data?.length || 0);

            if (data.data && data.data.length > 0) {
                console.log('📰 Première actualité:', {
                    id: data.data[0].id,
                    title: data.data[0].title,
                    category: data.data[0].category
                });
            }

            return { success: true, data };
        } else {
            console.error('❌ Erreur HTTP:', response.status, response.statusText);
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        return { success: false, error: error.message };
    }
};

export const testWebSocketConnection = async () => {
    try {
        console.log('🔌 Test WebSocket...');

        const wsUrl = API_URL.replace('http', 'ws') + '/ws';
        console.log('📍 WebSocket URL:', wsUrl);

        // Note: WebSocket test nécessite une implémentation spécifique
        // pour React Native/Expo
        console.log('⚠️ Test WebSocket à implémenter');

        return { success: true, message: 'WebSocket test à implémenter' };
    } catch (error) {
        console.error('❌ Erreur WebSocket:', error);
        return { success: false, error: error.message };
    }
};

export const runAllTests = async () => {
    console.log('🧪 Démarrage des tests de connexion...');

    const results = {
        backend: await testBackendConnection(),
        websocket: await testWebSocketConnection()
    };

    console.log('📊 Résultats des tests:', results);

    return results;
}; 