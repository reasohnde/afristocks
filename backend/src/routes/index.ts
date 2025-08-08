import { Router } from 'express';
import authRoutes from './auth.routes';
import { walletRoutes } from './wallet.routes';
import { investmentRoutes } from './investment.routes';
import { adminRoutes } from './admin.routes';
import { transactionRoutes } from './transaction.routes';
import newsRoutes from './news.routes';
import notificationsRoutes from './notifications.routes';

import fundRoutes from './fund.routes';


const router = Router();



// Route de test pour l'API
router.get('/', (req, res) => {
  res.json({
    message: 'AfriStocks API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      startups: '/api/startups',
      trading: '/api/trading',
      portfolio: '/api/portfolio'
    }
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Monter les routes d'authentification
router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/// Montage des routes (UNE SEULE FOIS)
router.use('/auth', authRoutes);
router.use('/fund', fundRoutes);
router.use('/fund', fundRoutes);
router.use('/wallet', walletRoutes);
router.use('/investments', investmentRoutes);
router.use('/admin', adminRoutes);
router.use('/news', newsRoutes);
router.use('/notifications', notificationsRoutes);

// Documentation
router.get('/docs', (req, res) => {
  res.json({
    message: 'Documentation API AfriStocks',
    baseUrl: req.protocol + '://' + req.get('host'),
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Créer un compte',
        'POST /api/auth/login': 'Se connecter',
        'POST /api/auth/logout': 'Se déconnecter (auth requise)',
        'POST /api/auth/refresh-token': 'Rafraîchir le token',
        'POST /api/auth/2fa/generate': 'Générer QR code 2FA (auth requise)',
        'POST /api/auth/2fa/verify': 'Vérifier code 2FA (auth requise)'
      },
      wallet: {
        'GET /api/wallet/balance': 'Obtenir le solde (auth requise)',
        'POST /api/wallet/deposit': 'Déposer des fonds (auth requise)',
        'POST /api/wallet/withdraw': 'Retirer des fonds (auth requise)',
        'GET /api/wallet/transactions': 'Historique des transactions (auth requise)'
      },
      investments: {
        'GET /api/investments/startups': 'Liste des startups',
        'GET /api/investments/startups/:id': 'Détails d\'une startup',
        'POST /api/investments/invest/:startupId': 'Investir dans une startup (auth requise)',
        'GET /api/investments/my-investments': 'Mes investissements (auth requise)'
      },
      news: {
        'GET /api/news': 'Liste des actualités',
        'GET /api/news/:id': 'Détails d\'une actualité',
        'POST /api/news': 'Créer une actualité (admin/editor)',
        'PUT /api/news/:id': 'Modifier une actualité (admin/editor)',
        'DELETE /api/news/:id': 'Supprimer une actualité (admin)',
        'GET /api/news/stats/overview': 'Statistiques des news (admin/editor)'
      },
      notifications: {
        'POST /api/notifications/register-token': 'Enregistrer token FCM (auth)',
        'POST /api/notifications/subscribe': 'S\'abonner à un topic (auth)',
        'POST /api/notifications/unsubscribe': 'Se désabonner d\'un topic (auth)',
        'PUT /api/notifications/preferences': 'Mettre à jour préférences (auth)',
        'POST /api/notifications/broadcast': 'Envoyer notification (admin/editor)',
        'GET /api/notifications/history': 'Historique notifications (auth)'
      },
      analytics: {
        'POST /api/notifications/news-view': 'Tracker vue article (auth)',
        'POST /api/notifications/interaction': 'Tracker interaction (auth)',
        'POST /api/notifications/reading-metrics': 'Métriques lecture (auth)',
        'GET /api/notifications/news/:id/stats': 'Stats article (admin/editor)',
        'GET /api/notifications/overview': 'Stats globales (admin/editor)',
        'GET /api/notifications/top-content': 'Contenu populaire (admin/editor)'
      }
    }
  });
});
router.use('/admin', adminRoutes);
router.use('/transactions', transactionRoutes);

// Middleware de debug pour les routes non trouvées (en développement uniquement)
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    console.log(`⚠️  Route API non trouvée: ${req.method} ${req.originalUrl}`);
    next();
  });
}

export default router;