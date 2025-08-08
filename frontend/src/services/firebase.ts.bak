// frontend/src/services/firebase.ts
import React from 'react';
import { initializeApp } from 'firebase/app';
import {
    getMessaging,
    getToken,
    onMessage,
    isSupported,
    Messaging
} from 'firebase/messaging';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Configuration Firebase (à remplacer par vos vraies clés)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase
let app: any;
let messaging: Messaging | null = null;
let analytics: any;

if (typeof window !== 'undefined') {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
}

export class NotificationService {
    private static instance: NotificationService;
    private token: string | null = null;
    private listeners: Map<string, Set<(message: any) => void>> = new Map();

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async initialize(): Promise<void> {
        try {
            // Vérifier si les notifications sont supportées
            const supported = await isSupported();
            if (!supported) {
                console.warn('Firebase Messaging n\'est pas supporté dans ce navigateur');
                return;
            }

            // Initialiser messaging
            messaging = getMessaging(app);

            // Demander la permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Permission de notification refusée');
                return;
            }

            // Obtenir le token
            await this.getToken();

            // Écouter les messages en foreground
            this.setupMessageListener();

            console.log('Service de notifications initialisé avec succès');
        } catch (error) {
            console.error('Erreur initialisation notifications:', error);
        }
    }

    async getToken(): Promise<string | null> {
        if (!messaging) return null;

        try {
            const currentToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });

            if (currentToken) {
                this.token = currentToken;
                await this.saveTokenToServer(currentToken);
                console.log('Token FCM obtenu:', currentToken);
                return currentToken;
            } else {
                console.warn('Aucun token FCM disponible');
                return null;
            }
        } catch (error) {
            console.error('Erreur obtention token FCM:', error);
            return null;
        }
    }

    private async saveTokenToServer(token: string): Promise<void> {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            await fetch('/api/v1/notifications/register-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ token, userId })
            });
        } catch (error) {
            console.error('Erreur sauvegarde token:', error);
        }
    }

    private setupMessageListener(): void {
        if (!messaging) return;

        onMessage(messaging, (payload) => {
            console.log('Message reçu:', payload);

            // Créer une notification locale
            this.showNotification(
                payload.notification?.title || 'Nouvelle notification',
                payload.notification?.body || '',
                payload.data
            );

            // Notifier les listeners
            this.notifyListeners('message', payload);

            // Logger l'événement
            this.logNotificationEvent('received', payload);
        });
    }

    showNotification(title: string, body: string, data?: any): void {
        if (!('Notification' in window)) return;

        const notification = new Notification(title, {
            body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: data?.tag || 'afristocks-notification',
            data,
            requireInteraction: data?.importance === 'URGENT'
        });

        notification.onclick = () => {
            window.focus();
            if (data?.url) {
                window.location.href = data.url;
            }
            notification.close();
            this.logNotificationEvent('clicked', { title, data });
        };
    }

    // Abonnement aux topics
    async subscribeToTopic(topic: string): Promise<void> {
        if (!this.token) return;

        try {
            await fetch('/api/v1/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ token: this.token, topic })
            });

            console.log(`Abonné au topic: ${topic}`);
        } catch (error) {
            console.error('Erreur abonnement topic:', error);
        }
    }

    async unsubscribeFromTopic(topic: string): Promise<void> {
        if (!this.token) return;

        try {
            await fetch('/api/v1/notifications/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ token: this.token, topic })
            });

            console.log(`Désabonné du topic: ${topic}`);
        } catch (error) {
            console.error('Erreur désabonnement topic:', error);
        }
    }

    // Gestion des listeners
    on(event: string, callback: (message: any) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(callback);

        // Retourner une fonction de désinscription
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    private notifyListeners(event: string, data: any): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    // Analytics
    private logNotificationEvent(action: string, data: any): void {
        if (!analytics) return;

        logEvent(analytics, 'notification_' + action, {
            notification_title: data.title || data.notification?.title,
            notification_type: data.data?.type || 'general',
            notification_importance: data.data?.importance,
            timestamp: new Date().toISOString()
        });
    }

    // Méthodes utilitaires
    isSupported(): boolean {
        return 'Notification' in window &&
            'serviceWorker' in navigator &&
            'PushManager' in window;
    }

    getPermissionStatus(): NotificationPermission {
        if (!('Notification' in window)) return 'denied';
        return Notification.permission;
    }

    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) return 'denied';

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await this.getToken();
        }

        return permission;
    }

    // Préférences utilisateur
    async updatePreferences(preferences: {
        newsAlerts?: boolean;
        investmentUpdates?: boolean;
        urgentOnly?: boolean;
    }): Promise<void> {
        try {
            await fetch('/api/v1/notifications/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(preferences)
            });

            // S'abonner/désabonner des topics selon les préférences
            if (preferences.newsAlerts !== undefined) {
                if (preferences.newsAlerts) {
                    await this.subscribeToTopic('news');
                } else {
                    await this.unsubscribeFromTopic('news');
                }
            }

            if (preferences.investmentUpdates !== undefined) {
                if (preferences.investmentUpdates) {
                    await this.subscribeToTopic('investments');
                } else {
                    await this.unsubscribeFromTopic('investments');
                }
            }
        } catch (error) {
            console.error('Erreur mise à jour préférences:', error);
        }
    }
}

// Hook React pour les notifications
export function useNotifications() {
    const [permission, setPermission] = React.useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = React.useState(false);
    const [lastMessage, setLastMessage] = React.useState<any>(null);

    React.useEffect(() => {
        const service = NotificationService.getInstance();

        // Vérifier le support
        setIsSupported(service.isSupported());
        setPermission(service.getPermissionStatus());

        // Initialiser le service
        service.initialize();

        // Écouter les messages
        const unsubscribe = service.on('message', (message) => {
            setLastMessage(message);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const requestPermission = async () => {
        const service = NotificationService.getInstance();
        const newPermission = await service.requestPermission();
        setPermission(newPermission);
        return newPermission;
    };

    const subscribeToTopic = (topic: string) => {
        return NotificationService.getInstance().subscribeToTopic(topic);
    };

    const unsubscribeFromTopic = (topic: string) => {
        return NotificationService.getInstance().unsubscribeFromTopic(topic);
    };

    const updatePreferences = (preferences: any) => {
        return NotificationService.getInstance().updatePreferences(preferences);
    };

    return {
        permission,
        isSupported,
        lastMessage,
        requestPermission,
        subscribeToTopic,
        unsubscribeFromTopic,
        updatePreferences
    };
}

// Singleton export
export const notificationService = NotificationService.getInstance();