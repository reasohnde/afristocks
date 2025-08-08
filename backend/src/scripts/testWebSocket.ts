// backend/src/scripts/testWebSocket.ts
import WebSocket from 'ws';

const WS_URL = 'ws://localhost:5001';

async function testWebSocket() {
    console.log('🧪 Test WebSocket...');

    try {
        // Connexion WebSocket
        const ws = new WebSocket(WS_URL);

        ws.on('open', () => {
            console.log('✅ WebSocket connecté');

            // Envoyer un message de test
            ws.send(JSON.stringify({
                type: 'ping',
                payload: { message: 'Test connexion' }
            }));
        });

        ws.on('message', (data) => {
            console.log('📨 Message reçu:', data.toString());
        });

        ws.on('error', (error) => {
            console.error('❌ Erreur WebSocket:', error);
        });

        ws.on('close', () => {
            console.log('🔌 WebSocket fermé');
        });

        // Attendre 5 secondes puis fermer
        setTimeout(() => {
            ws.close();
        }, 5000);

    } catch (error) {
        console.error('❌ Erreur test WebSocket:', error);
    }
}

// Test de création d'actualité avec notification
async function testNewsCreation() {
    console.log('\n📰 Test création actualité...');

    try {
        // 1. Login admin
        const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@afristocks.com',
                password: 'Admin123!'
            })
        });

        const loginData = await loginResponse.json();
        const token = loginData.token;

        console.log('✅ Login réussi');

        // 2. Créer une actualité
        const newsResponse = await fetch('http://localhost:5001/api/v1/news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Test WebSocket Notification',
                content: 'Cette actualité teste les notifications WebSocket',
                category: 'MARKET_UPDATE',
                importance: 'NORMAL',
                isActive: true
            })
        });

        const newsData = await newsResponse.json();
        console.log('✅ Actualité créée:', newsData.data?.id);

        return newsData.data;

    } catch (error) {
        console.error('❌ Erreur test création:', error);
    }
}

// Test complet
async function runTests() {
    console.log('🚀 Démarrage des tests WebSocket...\n');

    // Test 1: Connexion WebSocket
    await testWebSocket();

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Création d'actualité
    await testNewsCreation();

    console.log('\n✅ Tests terminés');
}

runTests().catch(console.error); 