import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export class NewsWebSocketServer {
    private io: Server;
    private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

    constructor(httpServer: HTTPServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                credentials: true
            },
            path: '/news'
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`📡 Nouvelle connexion WebSocket news: ${socket.id}`);

            // Rejoindre la room des news
            socket.join('news');

            // Gérer la connexion d'un utilisateur
            socket.on('join', (userId: string) => {
                this.connectedUsers.set(socket.id, userId);
                socket.join(`user:${userId}`);
                socket.join('news');
                logger.info(`👤 User ${userId} rejoint les news`);
            });

            // Gérer les filtres de news
            socket.on('subscribe', (filters: { category?: string; importance?: string }) => {
                const userId = this.connectedUsers.get(socket.id);
                if (userId) {
                    socket.join(`news:${userId}:${JSON.stringify(filters)}`);
                    logger.info(`🔔 User ${userId} s'abonne aux news avec filtres:`, filters);
                }
            });

            // Gérer la déconnexion
            socket.on('disconnect', () => {
                const userId = this.connectedUsers.get(socket.id);
                if (userId) {
                    logger.info(`👋 User ${userId} déconnecté des news`);
                }
                this.connectedUsers.delete(socket.id);
                logger.info(`📡 Déconnexion WebSocket news: ${socket.id}`);
            });

            // Gérer les erreurs
            socket.on('error', (error: any) => {
                logger.error(`❌ Erreur WebSocket news: ${error.message}`);
            });
        });
    }

    // Méthodes pour envoyer des événements
    public broadcastNews(news: any) {
        this.io.to('news').emit('news:new', news);
        logger.info(`📢 News diffusée: ${news.title}`);
    }

    public broadcastNewsUpdate(news: any) {
        this.io.to('news').emit('news:updated', news);
        logger.info(`📝 News mise à jour: ${news.title}`);
    }

    public broadcastNewsDelete(newsId: string) {
        this.io.to('news').emit('news:deleted', { id: newsId });
        logger.info(`🗑️ News supprimée: ${newsId}`);
    }

    public sendToUser(userId: string, event: string, data: any) {
        this.io.to(`user:${userId}`).emit(event, data);
        logger.info(`📤 Envoi à user ${userId}: ${event}`);
    }

    public sendToFilteredUsers(filters: any, event: string, data: any) {
        // Envoyer aux utilisateurs avec des filtres spécifiques
        this.io.to(`news:*:${JSON.stringify(filters)}`).emit(event, data);
        logger.info(`📤 Envoi filtré: ${event}`);
    }

    // Obtenir l'instance Socket.io
    public getIO(): Server {
        return this.io;
    }

    // Obtenir les statistiques de connexion
    public getStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            totalConnections: this.io.engine.clientsCount
        };
    }
} 