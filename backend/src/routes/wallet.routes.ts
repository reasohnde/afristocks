import { Router, Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';
import { WalletType, Currency } from '@prisma/client';

console.log('WalletType:', WalletType); // doit afficher un objet
console.log('Currency:', Currency);     // doit afficher un objet

const router = Router();

// Toutes les routes nécessitent l'utilisateur authentifié
router.use(authenticate);

//Route de test sans authentification
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Wallet routes working!'
  });
});

/**
 * GET /api/wallets
 * Récupère tous les wallets de l'utilisateur connecté
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const wallets = await WalletService.getUserWallets(userId);

    const formatted = wallets.map(wallet => ({
      id: wallet.id,
      currency: wallet.currency,
      type: wallet.wallet_type,
      balance: Number(wallet.balance),
      lockedBalance: Number(wallet.locked_balance),
      isPrimary: wallet.is_primary,
      isActive: wallet.is_active,
      walletAddress: wallet.wallet_address,
      mobileNumber: wallet.mobile_number,
      iban: wallet.iban,
      createdAt: wallet.created_at.toISOString()
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des wallets' });
  }
});

/**
 * POST /api/wallets
 * Crée un wallet pour l'utilisateur
 */
router.post(
  '/',
  // Les validateurs AVANT validateRequest
  [
    body('walletType').isIn(Object.values(WalletType)),
    body('currency').isIn(Object.values(Currency)),
    body('mobileNumber').optional().isMobilePhone('any'),
    body('isPrimary').optional().isBoolean()
  ],
  validateRequest, // validateRequest APRÈS les validateurs
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { walletType, currency, mobileNumber, isPrimary } = req.body;

      const wallet = await WalletService.createWallet({
        userId,
        walletType,
        currency,
        mobileNumber,
        isPrimary
      });

      res.status(201).json({
        success: true,
        data: {
          id: wallet.id,
          currency: wallet.currency,
          type: wallet.wallet_type,
          balance: Number(wallet.balance),
          createdAt: wallet.created_at.toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/wallets/:currency
 * Récupère un wallet spécifique selon sa devise
 */
router.get(
  '/:currency',
  // Validateurs d'abord
  [
    param('currency').isIn(Object.values(Currency))
  ],
  validateRequest, // Puis validateRequest
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const currency = req.params.currency as Currency;

      const wallet = await WalletService.getWallet(userId, currency);
      if (!wallet) {
        return res.status(404).json({ success: false, error: 'Wallet non trouvé' });
      }

      res.json({
        success: true,
        data: {
          id: wallet.id,
          currency: wallet.currency,
          type: wallet.wallet_type,
          balance: Number(wallet.balance),
          lockedBalance: Number(wallet.locked_balance),
          isPrimary: wallet.is_primary,
          walletAddress: wallet.wallet_address,
          mobileNumber: wallet.mobile_number,
          createdAt: wallet.created_at.toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la récupération du wallet' });
    }
  }
);

/**
 * POST /api/wallets/transfer
 * Transfert interne entre deux wallets de l'utilisateur
 */
router.post(
  '/transfer',
  // Validateurs d'abord
  [
    body('fromCurrency').isIn(Object.values(Currency)),
    body('toCurrency').isIn(Object.values(Currency)),
    body('amount').isFloat({ min: 0.01 })
  ],
  validateRequest, // Puis validateRequest
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { fromCurrency, toCurrency, amount } = req.body;

      const exchangeRate = 1; // TODO: remplacer par un vrai taux dynamique

      await WalletService.internalTransfer(userId, fromCurrency, toCurrency, amount, exchangeRate);

      res.json({
        success: true,
        message: 'Transfert effectué avec succès'
      });
    } catch (error: any) {
      console.error('Error transferring funds:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/wallets/balance/total
 * Calcule le solde total dans une devise donnée
 */
router.get('/balance/total', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const referenceCurrency = (req.query.currency as Currency) || Currency.EUR;

    const totalBalance = await WalletService.getTotalBalance(userId, referenceCurrency);

    res.json({
      success: true,
      data: {
        totalBalance,
        currency: referenceCurrency
      }
    });
  } catch (error) {
    console.error('Error calculating total balance:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du calcul du solde total' });
  }
});

export { router as walletRoutes };