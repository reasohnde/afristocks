// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ REMPLACEZ PAR VOTRE IP LOCALE !
const API_URL = 'http://100.105.207.193:5001'; // <-- VOTRE IP ICI

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoutez ces logs pour débugger
client.interceptors.request.use(
  async (config) => {
    console.log('🚀 Requête vers:', config.url);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse de:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 Backend non accessible à:', API_URL);
    }
    return Promise.reject(error);
  }
);

export default client;