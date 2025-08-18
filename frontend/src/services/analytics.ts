// frontend/src/services/analytics.ts
import React from 'react';

interface NewsViewEvent {
    newsId: string;
    newsTitle: string;
    category: string;
    importance: string;
    source: 'list' | 'detail' | 'notification' | 'search';
}

interface InteractionEvent {
    newsId: string;
    action: 'share' | 'save' | 'comment' | 'like';
    value?: any;
}

interface ReadingMetrics {
    newsId: string;
    startTime: number;
    endTime: number;
    scrollDepth: number;
    completed: boolean;
}

export class AnalyticsService {
    private static instance: AnalyticsService;
    private analytics: any;
    private readingSessions: Map<string, { startTime: number; lastScroll: number }> = new Map();
    private scrollObservers: Map<string, IntersectionObserver> = new Map();

    private constructor() {
        if (typeof window !== 'undefined') {
            this.analytics = null; // Mock pour l'instant
            this.setupPageTracking();
        }
    }

    static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    // Tracking des vues de news
    trackNewsView(event: NewsViewEvent): void {
        this.logEvent('news_view', {
            news_id: event.newsId,
            news_title: event.newsTitle,
            news_category: event.category,
            news_importance: event.importance,
            view_source: event.source,
            timestamp: new Date().toISOString()
        });

        // Envoyer aussi au backend pour les statistiques
        this.sendToBackend('/api/v1/analytics/news-view', {
            newsId: event.newsId,
            source: event.source
        });
    }

    // Tracking des interactions
    trackInteraction(event: InteractionEvent): void {
        this.logEvent(`news_${event.action}`, {
            news_id: event.newsId,
            action_value: event.value,
            timestamp: new Date().toISOString()
        });

        this.sendToBackend('/api/v1/analytics/interaction', event);
    }

    // Tracking du temps de lecture
    startReadingSession(newsId: string): void {
        this.readingSessions.set(newsId, {
            startTime: Date.now(),
            lastScroll: 0
        });

        // Configurer l'observer pour le scroll depth
        this.setupScrollTracking(newsId);
    }

    endReadingSession(newsId: string): void {
        const session = this.readingSessions.get(newsId);
        if (!session) return;

        const endTime = Date.now();
        const duration = endTime - session.startTime;
        const scrollDepth = session.lastScroll;

        // Calculer si l'article a été lu en entier (> 80% scroll + > 30s)
        const completed = scrollDepth > 80 && duration > 30000;

        const metrics: ReadingMetrics = {
            newsId,
            startTime: session.startTime,
            endTime,
            scrollDepth,
            completed
        };

        this.logEvent('news_read', {
            news_id: newsId,
            read_duration: Math.round(duration / 1000),
            scroll_depth: scrollDepth,
            completed,
            timestamp: new Date().toISOString()
        });

        this.sendToBackend('/api/v1/analytics/reading-metrics', metrics);

        // Nettoyer
        this.readingSessions.delete(newsId);
        this.cleanupScrollTracking(newsId);
    }

    // Tracking du scroll
    private setupScrollTracking(newsId: string): void {
        const articleElement = document.querySelector(`[data-news-id="${newsId}"]`);
        if (!articleElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const scrollPercentage = Math.round(
                            (entry.intersectionRect.bottom / entry.rootBounds!.height) * 100
                        );

                        const session = this.readingSessions.get(newsId);
                        if (session && scrollPercentage > session.lastScroll) {
                            session.lastScroll = scrollPercentage;

                            // Logger les milestones de lecture
                            if ([25, 50, 75, 100].includes(scrollPercentage)) {
                                this.logEvent('news_scroll_milestone', {
                                    news_id: newsId,
                                    milestone: scrollPercentage,
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                    }
                });
            },
            {
                threshold: Array.from({ length: 101 }, (_, i) => i / 100)
            }
        );

        observer.observe(articleElement);
        this.scrollObservers.set(newsId, observer);
    }

    private cleanupScrollTracking(newsId: string): void {
        const observer = this.scrollObservers.get(newsId);
        if (observer) {
            observer.disconnect();
            this.scrollObservers.delete(newsId);
        }
    }

    // Tracking des recherches
    trackSearch(query: string, resultsCount: number): void {
        this.logEvent('news_search', {
            search_query: query,
            results_count: resultsCount,
            timestamp: new Date().toISOString()
        });
    }

    // Tracking des filtres
    trackFilterUsage(filterType: string, filterValue: string): void {
        this.logEvent('news_filter_used', {
            filter_type: filterType,
            filter_value: filterValue,
            timestamp: new Date().toISOString()
        });
    }

    // Tracking des notifications
    trackNotificationInteraction(action: 'received' | 'clicked' | 'dismissed', notificationData: any): void {
        this.logEvent(`notification_${action}`, {
            notification_id: notificationData.id,
            notification_type: notificationData.type,
            notification_title: notificationData.title,
            timestamp: new Date().toISOString()
        });
    }

    // Tracking des pages
    private setupPageTracking(): void {
        if (typeof window === 'undefined') return;

        // Track les changements de page
        let lastPage = window.location.pathname;

        const trackPageView = () => {
            const currentPage = window.location.pathname;
            if (currentPage !== lastPage) {
                this.logEvent('page_view', {
                    page_path: currentPage,
                    page_title: document.title,
                    timestamp: new Date().toISOString()
                });
                lastPage = currentPage;
            }
        };

        // Observer pour les changements d'URL (SPA)
        const observer = new MutationObserver(trackPageView);
        observer.observe(document, { subtree: true, childList: true });

        // Écouter les événements de navigation
        window.addEventListener('popstate', trackPageView);
    }

    // Méthode générique pour logger les événements
    private logEvent(eventName: string, parameters: any): void {
        // Logger en console en dev
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${eventName}:`, parameters);
        }
    }

    // Envoyer les données au backend
    private async sendToBackend(endpoint: string, data: any): Promise<void> {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Erreur envoi analytics:', error);
        }
    }

    // Méthodes pour récupérer les statistiques
    async getNewsStats(newsId: string): Promise<any> {
        try {
            const response = await fetch(`/api/v1/analytics/news/${newsId}/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.json();
        } catch (error) {
            console.error('Erreur récupération stats:', error);
            return null;
        }
    }

    async getOverallStats(period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
        try {
            const response = await fetch(`/api/v1/analytics/overview?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.json();
        } catch (error) {
            console.error('Erreur récupération stats globales:', error);
            return null;
        }
    }
}

// Hook React pour l'analytics
export function useAnalytics() {
    const analytics = React.useRef(AnalyticsService.getInstance());

    const trackNewsView = React.useCallback((event: NewsViewEvent) => {
        analytics.current.trackNewsView(event);
    }, []);

    const trackInteraction = React.useCallback((event: InteractionEvent) => {
        analytics.current.trackInteraction(event);
    }, []);

    const startReading = React.useCallback((newsId: string) => {
        analytics.current.startReadingSession(newsId);
    }, []);

    const endReading = React.useCallback((newsId: string) => {
        analytics.current.endReadingSession(newsId);
    }, []);

    const trackSearch = React.useCallback((query: string, resultsCount: number) => {
        analytics.current.trackSearch(query, resultsCount);
    }, []);

    const trackFilter = React.useCallback((filterType: string, filterValue: string) => {
        analytics.current.trackFilterUsage(filterType, filterValue);
    }, []);

    return {
        trackNewsView,
        trackInteraction,
        startReading,
        endReading,
        trackSearch,
        trackFilter,
        getNewsStats: analytics.current.getNewsStats.bind(analytics.current),
        getOverallStats: analytics.current.getOverallStats.bind(analytics.current)
    };
}

// Composant pour tracker automatiquement la lecture
export function NewsReadingTracker({ newsId, children }: { newsId: string; children: React.ReactNode }) {
    const { startReading, endReading } = useAnalytics();

    React.useEffect(() => {
        startReading(newsId);

        return () => {
            endReading(newsId);
        };
    }, [newsId, startReading, endReading]);

    return React.createElement('div', { 'data-news-id': newsId }, children);
}

// Export singleton
export const analyticsService = AnalyticsService.getInstance();