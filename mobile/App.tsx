// App.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './src/contexts/AuthContext';
import { FundProvider } from './src/contexts/FundContext';
import { store } from './src/store/store';
import client from './src/api/client';
import { theme } from './src/styles/theme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Configuration Stripe
const STRIPE_PUBLISHABLE_KEY = '51Rs2dhQ77ACef2h1nex8X20e2yVOfpxnKw7z4X1FGgdVBYBg6AJo2uOJNAyG5K3fiYkqssZKpzU6r2HQ34THcH0H00PyK8zjhh'; // Remplacez par votre clé


console.log('Theme loaded:', theme);
console.log('Glass colors:', theme.colors?.glass);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [stripeKey, setStripeKey] = useState<string>('');

  useEffect(() => {
    checkAuthStatus();
    testBackendConnection(); // Ajoutez cette ligne

    // Charger la clé Stripe depuis AsyncStorage
    AsyncStorage.getItem('fundData').then(data => {
      if (data) {
        const fundData = JSON.parse(data);
        if (fundData.stripePublicKey) {
          setStripeKey(fundData.stripePublicKey);
        }
      }
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));

        // Vérifier si le token est toujours valide
        try {
          const response = await client.get('/api/auth/verify');
          if (!response.data.valid) {
            // Token invalide, déconnexion
            await logout();
          }
        } catch (error) {
          // En cas d'erreur, on garde l'utilisateur connecté
          console.log('Token verification failed, keeping user logged in');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ajoutez cette fonction
  const testBackendConnection = async () => {
    try {
      console.log('🔍 Test de connexion au backend...');
      const response = await fetch(`${client.defaults.baseURL}/api/health`);
      if (response.ok) {
        console.log('✅ Backend accessible !');
      } else {
        console.log('⚠️ Backend répond mais avec erreur:', response.status);
      }
    } catch (error) {
      console.error('❌ Backend inaccessible:', error.message);
      console.error('📍 URL tentée:', client.defaults.baseURL);
      console.error('💡 Vérifiez que:');
      console.error('   1. Le backend est démarré (npm run dev)');
      console.error('   2. L\'IP dans client.ts est correcte');
      console.error('   3. Téléphone et PC sont sur le même WiFi');
    }
  };

  const login = async (token: string, userData: any) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUserToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUserToken(null);
    setUser(null);
  };

  const updateUser = async (userData: any) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
        <ActivityIndicator size="large" color={theme.colors.primary.orange} />
        <Text style={{ color: 'white', marginTop: 16 }}>Chargement...</Text>
      </View>
    );
  }

  // Si pas de clé, utiliser une clé par défaut pour le dev
  const publishableKey = stripeKey || 'pk_test_VOTRE_CLE_PAR_DEFAUT';

  return (
    <Provider store={store}>
      <AuthContext.Provider value={{
        isLoggedIn: !!userToken,
        user,
        login,
        logout,
        updateUser,
      }}>
        <SafeAreaProvider>
          <FundProvider>
            <StripeProvider
              publishableKey={publishableKey}
              merchantIdentifier="merchant.com.afristocks"
            >
              <NavigationContainer>
                <StatusBar style="light" />
                <AppNavigator />
              </NavigationContainer>
            </StripeProvider>
          </FundProvider>
        </SafeAreaProvider>
      </AuthContext.Provider>
    </Provider>
  );
}