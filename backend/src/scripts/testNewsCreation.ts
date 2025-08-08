// backend/src/scripts/testNewsCreation.ts
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001';

async function testNewsCreation() {
    try {
        console.log('🔐 Connexion admin...');

        // 1. Login admin
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@afristocks.com',
                password: 'Admin123!'
            })
        });

        const loginData = await loginResponse.json();
        console.log('✅ Login réussi:', loginData.user.email);

        if (!loginData.token) {
            throw new Error('Token non reçu');
        }

        // 2. Créer une news
        console.log('📝 Création news...');
        const newsResponse = await fetch(`${API_URL}/api/v1/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                title: 'Test Script News',
                content: 'Contenu de test créé via script',
                category: 'MARKET_UPDATE',
                importance: 'NORMAL',
                isActive: true
            })
        });

        const newsData = await newsResponse.json();
        console.log('✅ News créée:', newsData.data?.id);

        // 3. Récupérer la liste des news
        console.log('📰 Récupération liste news...');
        const listResponse = await fetch(`${API_URL}/api/v1/news`);
        const listData = await listResponse.json();
        console.log(`✅ ${listData.data?.length || 0} news trouvées`);

        console.log('\n🎉 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

testNewsCreation(); 