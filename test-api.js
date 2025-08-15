// Test de communication avec le backend
const API_URL = 'http://100.105.207.193:5001';

async function testBackendConnection() {
    console.log('🔍 Test de connexion au backend...');
    console.log(`📍 URL: ${API_URL}`);

    try {
        // Test 1: Endpoint de santé
        console.log('\n1️⃣ Test endpoint /health');
        const healthResponse = await fetch(`${API_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);

        // Test 2: Endpoint du fonds
        console.log('\n2️⃣ Test endpoint /api/fund');
        const fundResponse = await fetch(`${API_URL}/api/fund`);
        const fundData = await fundResponse.json();
        console.log('✅ Fund data:', fundData);

        // Test 3: Endpoint des investissements
        console.log('\n3️⃣ Test endpoint /api/fund/investments');
        const investmentsResponse = await fetch(`${API_URL}/api/fund/investments`);
        const investmentsData = await investmentsResponse.json();
        console.log('✅ Investments data:', investmentsData);

        console.log('\n🎉 Tous les tests sont passés !');

    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.log('\n💡 Vérifiez que :');
        console.log('   - Le backend est démarré sur le port 5001');
        console.log('   - L\'adresse IP est correcte');
        console.log('   - Le firewall autorise les connexions');
    }
}

testBackendConnection(); 