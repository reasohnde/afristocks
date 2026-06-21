import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { walletRoutes } from './wallet.routes';
import { investmentRoutes } from './investment.routes';
import { fundRoutes } from './fund.routes';
import { newsRoutes } from './news.routes';
import { adminRoutes } from './admin.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Montage des routes
router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/investments', investmentRoutes);
router.use('/fund', fundRoutes);
router.use('/v1/news', newsRoutes);
router.use('/admin', adminRoutes);

// === STUBS pour endpoints non implémentés (éviter les 404 console) ===

// Notifications (stub)
router.post('/v1/notifications/register-token', (req, res) => res.json({ success: true }));
router.post('/v1/notifications/subscribe', (req, res) => res.json({ success: true }));
router.post('/v1/notifications/unsubscribe', (req, res) => res.json({ success: true }));
router.put('/v1/notifications/preferences', (req, res) => res.json({ success: true }));
router.post('/v1/notifications/broadcast', (req, res) => res.json({ success: true }));

// Analytics (stub)
router.post('/v1/analytics/news-view', (req, res) => res.json({ success: true }));
router.post('/v1/analytics/interaction', (req, res) => res.json({ success: true }));
router.post('/v1/analytics/reading-metrics', (req, res) => res.json({ success: true }));
router.get('/v1/analytics/news/:newsId/stats', (req, res) => res.json({ success: true, data: { views: 0, shares: 0, comments: 0 } }));
router.get('/v1/analytics/overview', (req, res) => res.json({ success: true, data: { totalViews: 0, totalInteractions: 0 } }));

// News stats (stub)
router.get('/v1/news/stats/overview', (req, res) => res.json({ success: true, data: { totalArticles: 5, totalViews: 0 } }));

// Trading (stub)
router.get('/trading/chart/:startupId', (req, res) => res.json({
  success: true,
  data: { startupId: req.params.startupId, prices: [], volume: [] }
}));
router.post('/trading/orders', (req, res) => res.json({
  success: true,
  data: { orderId: 'stub-order', status: 'pending', message: 'Trading non disponible en mode MVP' }
}));

// Stub pour les paiements (statut d'une transaction)
router.get('/payments/status/:transactionId', (req, res) => {
  res.json({
    success: true,
    data: {
      transactionId: req.params.transactionId,
      status: 'completed',
      message: 'Transaction traitée'
    }
  });
});

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
      fund: {
        'GET /api/fund': 'Données du fonds AfriStocks',
        'GET /api/fund/investments': 'Liste des investissements',
        'PUT /api/fund': 'Mettre à jour le fonds (auth requise)',
        'POST /api/fund/invest': 'Investir dans le fonds (auth requise)'
      },
      news: {
        'GET /api/v1/news': 'Liste des actualités',
        'GET /api/v1/news/:id': 'Détails d\'un article'
      }
    }
  });
});

export default router;