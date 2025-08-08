// backend/src/services/newsService.ts
import { Server } from 'socket.io';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Types temporaires en attendant la génération Prisma
export type NewsCategory = 'MARKET_UPDATE' | 'STARTUP_NEWS' | 'INVESTMENT' | 'REGULATION' | 'TECHNOLOGY' | 'ANALYSIS' | 'EVENT' | 'PARTNERSHIP';
export type NewsImportance = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface CreateNewsData {
    title: string;
    summary?: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    category: NewsCategory;
    importance: NewsImportance;
    tags?: string[];
    authorId: string;
    publishedAt?: Date;
    scheduledAt?: Date;
}

export interface NewsFilters {
  category?: string;
  importance?: string;
  search?: string;
    page?: number;
    limit?: number;
}

class NewsService {
    private socketServer: Server | null = null;
    private mockNews: any[] = [
        {
            id: '1',
            title: "La BAD investit 500 millions $ dans les infrastructures numériques",
            summary: "La Banque Africaine de Développement lance un nouveau programme d'investissement pour accélérer la transformation digitale du continent africain.",
            content: "Contenu détaillé de l'article...",
            imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
            category: 'INVESTMENT' as NewsCategory,
            importance: 'HIGH' as NewsImportance,
            tags: ['BAD', 'infrastructure', 'digital'],
            authorId: '1',
            author: { id: '1', name: 'Admin', email: 'admin@afristocks.com' },
            publishedAt: new Date('2024-01-15'),
            viewCount: 1250,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
        },
        {
            id: '2',
            title: "Croissance record : le PIB africain progresse de 4.2% en 2024",
            summary: "Les économies africaines montrent une résilience remarquable avec une croissance supérieure aux prévisions initiales du FMI.",
            content: "Contenu détaillé de l'article...",
            imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
            category: 'MARKET_UPDATE' as NewsCategory,
            importance: 'URGENT' as NewsImportance,
            tags: ['PIB', 'croissance', 'économie'],
            authorId: '1',
            author: { id: '1', name: 'Admin', email: 'admin@afristocks.com' },
            publishedAt: new Date('2024-01-14'),
            viewCount: 2100,
            createdAt: new Date('2024-01-14'),
            updatedAt: new Date('2024-01-14')
        }
    ];

    // Définir le serveur Socket.io
    public setSocketServer(io: Server) {
        this.socketServer = io;
        logger.info('📡 Socket.io configuré pour le service de news');
    }

    // Créer une nouvelle news (mock)
    public async createNews(data: CreateNewsData) {
        try {
            const news = {
                id: Date.now().toString(),
                ...data,
                tags: data.tags || [],
                author: { id: data.authorId, name: 'Admin', email: 'admin@afristocks.com' },
                publishedAt: data.publishedAt || new Date(),
                viewCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.mockNews.unshift(news);

            // Diffuser via WebSocket si configuré
            if (this.socketServer) {
                this.socketServer.to('news').emit('news:new', news);
                logger.info(`📢 News diffusée: ${news.title}`);
            }

            return news;
        } catch (error) {
            logger.error('Erreur création news:', error);
            throw error;
        }
    }

    // Récupérer les news avec pagination et filtres (mock)
    public async getNews(filters: NewsFilters = {}) {
        try {
            const {
                category,
                importance,
                search,
                page = 1,
                limit = 20
            } = filters;

            let filteredNews = [...this.mockNews];

            // Appliquer les filtres
    if (category && category !== 'all') {
                filteredNews = filteredNews.filter(news => news.category === category);
    }

    if (importance && importance !== 'all') {
                filteredNews = filteredNews.filter(news => news.importance === importance);
    }

    if (search) {
                const searchLower = search.toLowerCase();
                filteredNews = filteredNews.filter(news =>
                    news.title.toLowerCase().includes(searchLower) ||
                    news.summary?.toLowerCase().includes(searchLower) ||
                    news.content.toLowerCase().includes(searchLower)
                );
            }

            const total = filteredNews.length;
            const skip = (page - 1) * limit;
            const news = filteredNews.slice(skip, skip + limit);

            return {
                data: news,
                pagination: {
                    page,
                    limit,
                    total,
                    hasMore: skip + limit < total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Erreur récupération news:', error);
            throw error;
        }
    }

    // Récupérer une news par ID (mock)
    public async getNewsById(id: string) {
        try {
            const news = this.mockNews.find(n => n.id === id);

            if (!news) {
                throw new Error('News non trouvée');
            }

            // Incrémenter le compteur de vues
            news.viewCount++;

            return news;
        } catch (error) {
            logger.error('Erreur récupération news par ID:', error);
            throw error;
        }
    }

    // Mettre à jour une news (mock)
    public async updateNews(id: string, data: Partial<CreateNewsData>) {
        try {
            const newsIndex = this.mockNews.findIndex(n => n.id === id);
            if (newsIndex === -1) {
                throw new Error('News non trouvée');
            }

            const updatedNews = {
                ...this.mockNews[newsIndex],
        ...data,
                updatedAt: new Date()
            };

            this.mockNews[newsIndex] = updatedNews;

            // Diffuser la mise à jour via WebSocket
            if (this.socketServer) {
                this.socketServer.to('news').emit('news:updated', updatedNews);
                logger.info(`📝 News mise à jour: ${updatedNews.title}`);
            }

            return updatedNews;
        } catch (error) {
            logger.error('Erreur mise à jour news:', error);
            throw error;
        }
    }

    // Supprimer une news (mock)
    public async deleteNews(id: string) {
        try {
            const newsIndex = this.mockNews.findIndex(n => n.id === id);
            if (newsIndex === -1) {
                throw new Error('News non trouvée');
            }

            this.mockNews.splice(newsIndex, 1);

            // Diffuser la suppression via WebSocket
            if (this.socketServer) {
                this.socketServer.to('news').emit('news:deleted', { id });
                logger.info(`🗑️ News supprimée: ${id}`);
            }

            return { success: true };
        } catch (error) {
            logger.error('Erreur suppression news:', error);
            throw error;
        }
    }

    // Récupérer les statistiques des news (mock)
    public async getNewsStats() {
        try {
            const totalNews = this.mockNews.length;
            const publishedNews = this.mockNews.filter(n => n.publishedAt).length;
            const urgentNews = this.mockNews.filter(n => n.importance === 'URGENT').length;
            const totalViews = this.mockNews.reduce((sum, n) => sum + n.viewCount, 0);

            return {
                totalNews,
                publishedNews,
                urgentNews,
                totalViews
            };
        } catch (error) {
            logger.error('Erreur récupération stats news:', error);
            throw error;
        }
    }

    // Créer une notification de news (mock)
    public async createNewsNotification(newsId: string, userId: string, title: string, body: string) {
        try {
            const notification = {
                id: Date.now().toString(),
                newsId,
                userId,
                title,
                body,
                data: {},
                sent: false,
                read: false,
                createdAt: new Date()
            };

            return notification;
        } catch (error) {
            logger.error('Erreur création notification news:', error);
            throw error;
        }
    }

    // Marquer une notification comme lue (mock)
    public async markNotificationAsRead(notificationId: string) {
        try {
            const notification = {
                id: notificationId,
                read: true,
                readAt: new Date()
            };

            return notification;
        } catch (error) {
            logger.error('Erreur marquage notification comme lue:', error);
            throw error;
        }
    }

    // Récupérer les notifications d'un utilisateur (mock)
    public async getUserNotifications(userId: string, page = 1, limit = 20) {
        try {
            const mockNotifications = [
                {
                    id: '1',
                    userId,
                    newsId: '1',
                    title: 'Nouvelle actualité importante',
                    body: 'Une nouvelle actualité a été publiée',
                    data: {},
                    sent: true,
                    sentAt: new Date(),
                    read: false,
                    readAt: null,
                    createdAt: new Date(),
                    news: {
                        id: '1',
                        title: 'La BAD investit 500 millions $',
                        category: 'INVESTMENT',
                        importance: 'HIGH'
                    }
                }
            ];

            const total = mockNotifications.length;
            const skip = (page - 1) * limit;
            const notifications = mockNotifications.slice(skip, skip + limit);

            return {
                data: notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    hasMore: skip + limit < total
                }
            };
        } catch (error) {
            logger.error('Erreur récupération notifications:', error);
            throw error;
        }
    }
}

// Instance singleton
export const newsService = new NewsService();