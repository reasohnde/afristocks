// backend/src/routes/news.routes.ts
import { Router } from 'express';
import { PrismaClient, NewsCategory, NewsImportance } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth';
import { broadcastNews } from '../websocket/newsWebSocket';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/news - Ajouter des logs pour debug
router.get('/', async (req, res) => {
    try {
        console.log('📰 GET /api/v1/news - Query params:', req.query);

        const { page = 1, limit = 20, category, importance, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            isActive: true,
            // Vérifier que publishedAt n'est pas null
            publishedAt: { not: null }
        };

        if (category && category !== 'all') {
            where.category = category;
        }
        if (importance && importance !== 'all') {
            where.importance = importance;
        }
        if (search) {
            where.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { summary: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        // Log des filtres
        console.log('🔍 Filtres appliqués:', where);

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                include: {
                    author: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.news.count({ where })
        ]);

        console.log(`📊 Trouvé ${news.length} actualités sur ${total} total`);

        res.json({
            data: news,
            total,
            hasMore: skip + news.length < total
        });
    } catch (error) {
        console.error('❌ Erreur GET news:', error);
        res.status(500).json({ error: 'Erreur serveur', data: [] });
    }
});

// POST /api/v1/news - Créer (Admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        console.log('=== CRÉATION NEWS ===');
        console.log('👤 Utilisateur:', req.user);
        console.log('📝 Body reçu:', req.body);

        // Vérifier que l'utilisateur a un ID
        const authorId = req.user?.userId;
        if (!authorId) {
            return res.status(400).json({
                error: 'ID utilisateur manquant',
                details: 'Impossible de déterminer l\'auteur'
            });
        }

        const {
            title,
            summary,
            content,
            category,
            importance,
            tags,
            imageUrl,
            isActive,
            publishedAt,
            sendNotification
        } = req.body;

        // Validation basique
        if (!title || !content || !category || !importance) {
            return res.status(400).json({
                error: 'Données manquantes',
                details: 'Titre, contenu, catégorie et importance sont requis'
            });
        }

        // Créer la news
        const news = await prisma.news.create({
            data: {
                title,
                summary: summary || '',
                content,
                category: category as NewsCategory,
                importance: importance as NewsImportance,
                tags: tags || [],
                imageUrl: imageUrl || null,
                isActive: isActive === true,
                publishedAt: isActive === true ? new Date() : null,
                authorId: authorId,
                metadata: {}
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        console.log('✅ News créée avec succès:', news.id);

        // Notifier tous les clients via WebSocket
        try {
            broadcastNews('news:new', news);
            console.log('📡 Notification WebSocket envoyée');
        } catch (wsError) {
            console.error('❌ Erreur WebSocket:', wsError);
        }

        res.json({
            success: true,
            data: news,
            message: 'Actualité créée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur création news:', error);

        // Meilleure gestion des erreurs Prisma
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Erreur lors de la création',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            res.status(500).json({
                error: 'Erreur inconnue',
                details: 'Une erreur inattendue s\'est produite'
            });
        }
    }
});

// PUT /api/v1/news/:id - Modifier (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const news = await prisma.news.update({
            where: { id },
            data: {
                ...req.body,
                publishedAt: req.body.isActive ?
                    (req.body.publishedAt ? new Date(req.body.publishedAt) : new Date()) :
                    null,
                updatedAt: new Date()
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Notifier tous les clients via WebSocket
        try {
            broadcastNews('news:updated', news);
            console.log('📡 Notification WebSocket mise à jour envoyée');
        } catch (wsError) {
            console.error('❌ Erreur WebSocket:', wsError);
        }

        res.json({
            success: true,
            data: news,
            message: 'Actualité mise à jour'
        });
    } catch (error) {
        console.error('Erreur update news:', error);
        res.status(500).json({ error: 'Erreur mise à jour' });
    }
});

// DELETE /api/v1/news/:id - Supprimer (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        await prisma.news.delete({
            where: { id: req.params.id }
        });

        // Notifier tous les clients via WebSocket
        try {
            broadcastNews('news:deleted', { id: req.params.id });
            console.log('📡 Notification WebSocket suppression envoyée');
        } catch (wsError) {
            console.error('❌ Erreur WebSocket:', wsError);
        }

        res.json({
            success: true,
            message: 'Actualité supprimée'
        });
    } catch (error) {
        console.error('Erreur delete news:', error);
        res.status(500).json({ error: 'Erreur suppression' });
    }
});

// GET /api/v1/news/stats/overview - Stats (Admin)
router.get('/stats/overview', authenticate, adminOnly, async (req, res) => {
    try {
        const [totalViews, newsCount, topCategories] = await Promise.all([
            prisma.news.aggregate({
                _sum: { viewCount: true }
            }),
            prisma.news.count(),
            prisma.news.groupBy({
                by: ['category'],
                _count: true,
                orderBy: { _count: { category: 'desc' } },
                take: 5
            })
        ]);

        // Trend des 7 derniers jours
        const viewsTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await prisma.news.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            viewsTrend.push({
                date: date.toISOString(),
                views: count * Math.floor(Math.random() * 100 + 50) // Simulation
            });
        }

        res.json({
            totalViews: totalViews._sum.viewCount || 0,
            uniqueViewers: Math.floor((totalViews._sum.viewCount || 0) * 0.7),
            avgReadTime: 3.5,
            shareCount: Math.floor((totalViews._sum.viewCount || 0) * 0.1),
            topCategories: topCategories.map(cat => ({
                category: cat.category,
                count: cat._count
            })),
            viewsTrend
        });
    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({ error: 'Erreur stats' });
    }
});

export default router;