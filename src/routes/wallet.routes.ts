import { Router, Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { depositValidator, withdrawValidator } from '../validators/wallet.validator';
import { prisma } from '../config/database';

const router = Router();

// Toutes les routes wallet nécessitent une authentification
router.use(authenticateToken);

// Obtenir le solde
router.get('/balance', async (req: Request, res: Response) => {
  try {
    const balance = await WalletService.getBalance(req.user!.userId);
    res.json({ success: true, data: balance });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Déposer des fonds
router.post('/deposit', depositValidator, validateRequest, async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethod } = req.body;
    const result = await WalletService.deposit(req.user!.userId, amount, paymentMethod);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Retirer des fonds (validation: montant min 1000 XOF + coordonnées bancaires complètes)
router.post('/withdraw', withdrawValidator, validateRequest, async (req: Request, res: Response) => {
  try {
    const { amount, bankDetails } = req.body;
    const result = await WalletService.withdraw(req.user!.userId, amount, bankDetails);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Historique des transactions
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    res.json({ success: true, data: { transactions: wallet?.transactions || [] } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export { router as walletRoutes };
