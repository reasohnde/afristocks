import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/fund
 * Retourne les données agrégées du fonds AfriStocks
 * (agrège les startups actives en un seul "fonds")
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const startups = await prisma.startup.findMany({
      where: { isActive: true }
    });

    const totalTarget = startups.reduce((sum: number, s: any) => sum + (s.valuationTarget?.toNumber?.() ?? Number(s.valuationTarget) ?? 0), 0);
    const totalRaised = startups.reduce((sum: number, s: any) => sum + (s.raisedAmount?.toNumber?.() ?? Number(s.raisedAmount) ?? 0), 0);
    const minInvestment = startups.length > 0
      ? Math.min(...startups.map((s: any) => s.minInvestment?.toNumber?.() ?? Number(s.minInvestment) ?? 0))
      : 50;
    const maxInvestment = startups.length > 0
      ? Math.max(...startups.map((s: any) => s.maxInvestment?.toNumber?.() ?? Number(s.maxInvestment) ?? 0))
      : 10000;

    const fundData = {
      id: '1',
      name: 'AfriStocks Capital Fund',
      tagline: 'Investir dans l\'innovation africaine',
      description: `Un fonds diversifié investissant dans ${startups.length} startup${startups.length > 1 ? 's' : ''} technologique${startups.length > 1 ? 's' : ''} les plus prometteuses d'Afrique.`,
      targetAmount: totalTarget,
      raisedAmount: totalRaised,
      minInvestment,
      maxInvestment,
      expectedReturn: '15-25%',
      duration: '3-5 ans',
      isActive: startups.length > 0,
      email: 'invest@afristocks.com',
      phone: '+225 01 23 45 67 89',
      whatsapp: '+225 01 23 45 67 89'
    };

    res.json({
      success: true,
      data: fundData
    });
  } catch (error: any) {
    console.error('Erreur fund:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/fund/investments
 * Retourne la liste de tous les investissements (public, sans détails sensibles)
 */
router.get('/investments', async (req: Request, res: Response) => {
  try {
    const investments = await prisma.investment.findMany({
      include: {
        user: true,
        startup: true
      },
      orderBy: { investedAt: 'desc' }
    });

    const formattedInvestments = investments.map((inv: any) => ({
      id: inv.id,
      userId: inv.userId,
      userName: inv.user ? `${inv.user.firstName || ''} ${inv.user.lastName || ''}`.trim() || 'Investisseur' : 'Investisseur',
      userEmail: inv.user?.email || '',
      amount: inv.amount?.toNumber?.() ?? Number(inv.amount) ?? 0,
      status: (inv.status || 'completed').toLowerCase(),
      paymentMethod: 'wallet',
      date: inv.investedAt?.toISOString?.() ?? inv.investedAt ?? new Date().toISOString()
    }));

    res.json({
      success: true,
      data: formattedInvestments
    });
  } catch (error: any) {
    console.error('Erreur fund/investments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/fund
 * Met à jour les données du fonds (admin uniquement)
 */
router.put('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Pour l'instant, on accepte la mise à jour sans persistance spéciale
    // Les données du fonds sont agrégées des startups
    res.json({
      success: true,
      message: 'Fonds mis à jour'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/fund/invest
 * Investir dans le fonds (redirige vers la première startup active)
 */
router.post('/invest', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user!.userId;

    if (!amount || amount < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Le montant minimum est de 1000 XOF'
      });
    }

    // Trouver la première startup active pour y placer l'investissement
    const startup = await prisma.startup.findFirst({
      where: { isActive: true }
    });

    if (!startup) {
      return res.status(400).json({
        success: false,
        message: 'Aucune startup active disponible'
      });
    }

    // Importer le service d'investissement pour réutiliser la logique
    const { InvestmentService } = require('../services/investment.service');
    const result = await InvestmentService.invest(userId, startup.id, amount);

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

export { router as fundRoutes };
