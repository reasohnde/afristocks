import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { walletRoutes } from './wallet.routes';
import { investmentRoutes } from './investment.routes';

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
      }
    }
  });
});

export default router;