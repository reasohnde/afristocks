// backend/src/scripts/testMobileNews.ts
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001';

async function testMobileNewsAPI() {
    try {
        console.log('📱 Test API Mobile News...');

        // 1. Test récupération des actualités publiques
        console.log('\n🔍 Test GET /api/v1/news (public)');
        const publicResponse = await fetch(`${API_URL}/api/v1/news?limit=5`);
        const publicData = await publicResponse.json();

        console.log('✅ Statut:', publicResponse.status);
        console.log('📊 Actualités trouvées:', publicData.data?.length || 0);

        if (publicData.data && publicData.data.length > 0) {
            console.log('📰 Première actualité:', {
                id: publicData.data[0].id,
                title: publicData.data[0].title,
                category: publicData.data[0].category,
                importance: publicData.data[0].importance,
                publishedAt: publicData.data[0].publishedAt
            });
        }

        // 2. Test avec authentification admin
        console.log('\n🔐 Test avec authentification admin');

        // Login admin
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

        if (loginData.token) {
            console.log('✅ Login admin réussi');

            // Test récupération avec token
            const authResponse = await fetch(`${API_URL}/api/v1/news?limit=3`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });

            const authData = await authResponse.json();
            console.log('✅ Actualités avec auth:', authData.data?.length || 0);
        } else {
            console.log('❌ Échec login admin');
        }

        // 3. Test filtres
        console.log('\n🔍 Test filtres');

        const filters = [
            'category=STARTUP_NEWS',
            'importance=URGENT',
            'search=test'
        ];

        for (const filter of filters) {
            const filterResponse = await fetch(`${API_URL}/api/v1/news?${filter}`);
            const filterData = await filterResponse.json();
            console.log(`✅ Filtre ${filter}:`, filterData.data?.length || 0, 'résultats');
        }

        console.log('\n🎉 Tests terminés avec succès !');

    } catch (error) {
        console.error('❌ Erreur test mobile news:', error);
    }
}

testMobileNewsAPI(); 