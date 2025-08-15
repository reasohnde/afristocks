// mobile/src/services/newsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';
import io from 'socket.io-client';

const WS_URL = 'http://100.105.207.193:5001';

class NewsService {
    private socket: any = null;
    private listeners: Map<string, Set<Function>> = new Map();

    async connectWebSocket() {
        try {
            console.log('🔌 Connexion Socket.io...');
            const token = await AsyncStorage.getItem('token');

            this.socket = io(WS_URL, {
                path: '/news',
                transports: ['websocket', 'polling'],
                auth: {
                    token: token || ''
                }
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket.io connecté');

                // Rejoindre la room des news
                this.socket.emit('join', 'mobile-user');
                this.socket.emit('subscribe', { category: 'all' });
            });

            this.socket.on('news:new', (data: any) => {
                console.log('📰 Nouvelle actualité reçue:', data);
                this.emit('news:new', data);
            });

            this.socket.on('news:updated', (data: any) => {
                console.log('📝 Actualité mise à jour:', data);
                this.emit('news:updated', data);
            });

            this.socket.on('news:deleted', (data: any) => {
                console.log('🗑️ Actualité supprimée:', data);
                this.emit('news:deleted', data);
            });

            this.socket.on('disconnect', (reason: string) => {
                console.log('🔌 Socket.io déconnecté:', reason);
                // Reconnexion automatique
                setTimeout(() => {
                    console.log('🔄 Tentative de reconnexion Socket.io...');
                    this.connectWebSocket();
                }, 5000);
            });

            this.socket.on('error', (error: any) => {
                console.error('❌ Socket.io error:', error);
            });
        } catch (error) {
            console.error('❌ Erreur connexion Socket.io:', error);
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: Function) {
        this.listeners.get(event)?.delete(callback);
    }

    private emit(event: string, data: any) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }

    async getNews(params = {}) {
        try {
            console.log('🔍 NewsService.getNews - Début');
            console.log('📍 URL:', `${API_URL}/api/v1/news`);

            const token = await AsyncStorage.getItem('token');
            const queryString = new URLSearchParams(params).toString();

            const url = `${API_URL}/api/v1/news?${queryString}`;
            console.log('🌐 Requête:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Statut:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Données reçues:', data.data?.length || 0, 'actualités');

            return data;
        } catch (error) {
            console.error('❌ Erreur getNews:', error);
            throw error;
        }
    }

    async createNews(data: any) {
        const token = await AsyncStorage.getItem('token');

        const response = await fetch(`${API_URL}/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        return response.json();
    }
}

export default new NewsService(); 