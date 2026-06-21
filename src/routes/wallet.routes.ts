import { Router } from 'express';
import { WalletService } from '../services/wallet.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
const router = Router();

// Toutes les routes wallet nécessitent une authentification
router.use(authenticateToken);

// Obtenir le solde
router.get('/balance', async (req, res) => {
  try {
    const balance = await WalletService.getBalance(req.user!.userId);
    res.json({
      success: true,
      data: balance
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Déposer des fonds
router.post('/deposit', async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const result = await WalletService.deposit(
      req.user!.userId,
      amount,
      paymentMethod
    );
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Retirer des fonds
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Montant invalide' });
    }
    if (!bankDetails || typeof bankDetails !== 'object' || !bankDetails.bankName) {
      return res.status(400).json({ success: false, message: 'Coordonnées bancaires requises (bankName)' });
    }
    const result = await WalletService.withdraw(req.user!.userId, amount, bankDetails);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Historique des transactions
router.get('/transactions', async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    res.json({
      success: true,
      data: {
        transactions: wallet?.transactions || []
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export { router as walletRoutes };
