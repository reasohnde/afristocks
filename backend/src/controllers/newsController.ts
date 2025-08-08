// backend/src/controllers/newsController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { broadcastNews, notifyAdmins } from '../websocket/newsWebSocket';

const prisma = new PrismaClient();

export const newsController = {
    // Créer une news
    async create(req: Request, res: Response) {
        try {
            const news = await prisma.news.create({
                data: {
                    ...req.body,
                    authorId: req.user.id,
                },
                include: {
                    author: {
                        select: { id: true, name: true }
                    }
                }
            });

            // Broadcast via WebSocket
            broadcastNews('news:new', news);

            // Notification push si urgent
            if (news.importance === 'URGENT' && req.body.sendNotification) {
                await sendPushNotification(news);
            }

            res.json({ success: true, data: news });
        } catch (error) {
            res.status(500).json({ error: 'Erreur création news' });
        }
    },

    // Liste des news avec pagination
    async list(req: Request, res: Response) {
        const { page = 1, limit = 20, category, importance, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (category && category !== 'all') where.category = category;
        if (importance && importance !== 'all') where.importance = importance;
        if (search) {
            where.OR = [
                { title: { contains: String(search) } },
                { summary: { contains: String(search) } }
            ];
        }

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                include: {
                    author: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { publishedAt: 'desc' },
                take: Number(limit),
                skip: offset
            }),
            prisma.news.count({ where })
        ]);

        res.json({
            data: news,
            total,
            hasMore: offset + news.length < total,
            page: Number(page)
        });
    },

    // Mettre à jour une news
    async update(req: Request, res: Response) {
        try {
            const news = await prisma.news.update({
                where: { id: req.params.id },
                data: req.body,
                include: {
                    author: {
                        select: { id: true, name: true }
                    }
                }
            });

            // Broadcast update
            broadcastNews('news:updated', news);

            res.json({ success: true, data: news });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour' });
        }
    },

    // Supprimer une news
    async delete(req: Request, res: Response) {
        try {
            await prisma.news.delete({
                where: { id: req.params.id }
            });

            // Broadcast deletion
            broadcastNews('news:deleted', { id: req.params.id });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur suppression' });
        }
    },

    // Stats pour analytics
    async stats(req: Request, res: Response) {
        const [totalViews, uniqueViewers, topCategories] = await Promise.all([
            prisma.news.aggregate({
                _sum: { viewCount: true }
            }),
            prisma.newsView.groupBy({
                by: ['userId'],
                _count: true
            }),
            prisma.news.groupBy({
                by: ['category'],
                _count: true,
                orderBy: { _count: { id: 'desc' } },
                take: 5
            })
        ]);

        res.json({
            totalViews: totalViews._sum.viewCount || 0,
            uniqueViewers: uniqueViewers.length,
            avgReadTime: 3.5, // À calculer
            shareCount: 0, // À implémenter
            topCategories: topCategories.map(c => ({
                category: c.category,
                count: c._count
            })),
            viewsTrend: [] // À implémenter
        });
    }
}; 