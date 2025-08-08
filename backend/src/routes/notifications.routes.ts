// backend/src/routes/notifications.routes.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middlewares/auth';
import { adminMiddleware } from '../middlewares/admin';
import { validateRequest } from '../middlewares/validateRequest';
import { notificationService } from '../services/notificationService';
import { analyticsService } from '../services/analyticsService';

const router = Router();

// ========== NOTIFICATIONS ==========

// POST /api/v1/notifications/register-token - Enregistrer un token FCM
router.post('/register-token',
  authMiddleware,
  body('token').notEmpty().isString(),
  validateRequest,
  async (req, res, next) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      await notificationService.registerToken(userId, token);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/notifications/subscribe - S'abonner à un topic
router.post('/subscribe',
  authMiddleware,
  body('topic').notEmpty().isString(),
  validateRequest,
  async (req, res, next) => {
    try {
      const { topic } = req.body;
      const userId = req.user.id;

      await notificationService.subscribeToTopic(userId, topic);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/notifications/unsubscribe - Se désabonner d'un topic
router.post('/unsubscribe',
  authMiddleware,
  body('topic').notEmpty().isString(),
  validateRequest,
  async (req, res, next) => {
    try {
      const { topic } = req.body;
      const userId = req.user.id;

      await notificationService.unsubscribeFromTopic(userId, topic);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/notifications/preferences - Mettre à jour les préférences
router.put('/preferences',
  authMiddleware,
  body('newsAlerts').optional().isBoolean(),
  body('investmentUpdates').optional().isBoolean(),
  body('urgentOnly').optional().isBoolean(),
  validateRequest,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      await notificationService.updatePreferences(userId, preferences);
      res.json({ success: true, preferences });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/notifications/broadcast - Envoyer une notification (admin)
router.post('/broadcast',
  authMiddleware,
  adminMiddleware(['ADMIN', 'EDITOR']),
  body('title').notEmpty(),
  body('body').notEmpty(),
  body('data').optional().isObject(),
  body('topic').optional().isString(),
  body('userIds').optional().isArray(),
  validateRequest,
  async (req, res, next) => {
    try {
      const { title, body, data, topic, userIds } = req.body;

      let result;
      if (topic) {
        result = await notificationService.sendToTopic(topic, { title, body, data });
      } else if (userIds && userIds.length > 0) {
        result = await notificationService.sendToUsers(userIds, { title, body, data });
      } else {
        result = await notificationService.sendToAll({ title, body, data });
      }

      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/notifications/history - Historique des notifications
router.get('/history',
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const notifications = await notificationService.getUserNotifications(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }
);

// ========== ANALYTICS ==========

// POST /api/v1/analytics/news-view - Tracker une vue d'article
router.post('/news-view',
  authMiddleware,
  body('newsId').notEmpty().isString(),
  body('source').isIn(['list', 'detail', 'notification', 'search']),
  validateRequest,
  async (req, res, next) => {
    try {
      const { newsId, source } = req.body;
      const userId = req.user.id;

      await analyticsService.trackNewsView({
        newsId,
        userId,
        source,
        timestamp: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/analytics/interaction - Tracker une interaction
router.post('/interaction',
  authMiddleware,
  body('newsId').notEmpty().isString(),
  body('action').isIn(['share', 'save', 'comment', 'like']),
  body('value').optional(),
  validateRequest,
  async (req, res, next) => {
    try {
      const { newsId, action, value } = req.body;
      const userId = req.user.id;

      await analyticsService.trackInteraction({
        newsId,
        userId,
        action,
        value,
        timestamp: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/analytics/reading-metrics - Métriques de lecture
router.post('/reading-metrics',
  authMiddleware,
  body('newsId').notEmpty().isString(),
  body('startTime').isNumeric(),
  body('endTime').isNumeric(),
  body('scrollDepth').isNumeric(),
  body('completed').isBoolean(),
  validateRequest,
  async (req, res, next) => {
    try {
      const metrics = req.body;
      const userId = req.user.id;

      await analyticsService.trackReadingMetrics({
        ...metrics,
        userId,
        duration: metrics.endTime - metrics.startTime
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/analytics/news/:id/stats - Statistiques d'un article
router.get('/news/:id/stats',
  authMiddleware,
  adminMiddleware(['ADMIN', 'EDITOR']),
  param('id').isString(),
  validateRequest,
  async (req, res, next) => {
    try {
      const newsId = req.params.id;
      const stats = await analyticsService.getNewsStats(newsId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/analytics/overview - Vue d'ensemble
router.get('/overview',
  authMiddleware,
  adminMiddleware(['ADMIN', 'EDITOR']),
  async (req, res, next) => {
    try {
      const { period = 'week' } = req.query;
      const stats = await analyticsService.getOverviewStats(period as string);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/analytics/top-content - Contenu le plus populaire
router.get('/top-content',
  authMiddleware,
  adminMiddleware(['ADMIN', 'EDITOR']),
  async (req, res, next) => {
    try {
      const { period = 'week', limit = 10 } = req.query;
      const topContent = await analyticsService.getTopContent(
        period as string,
        parseInt(limit as string)
      );
      res.json(topContent);
    } catch (error) {
      next(error);
    }
  }
);

export default router;