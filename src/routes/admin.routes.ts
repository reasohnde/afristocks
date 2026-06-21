import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

// Toutes les routes admin nécessitent une authentification ET le rôle ADMIN.
// Sans requireAdmin, tout utilisateur connecté pouvait s'auto-promouvoir admin,
// modifier les soldes ou valider son propre KYC (faille d'élévation de privilèges).
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Statistiques du tableau de bord admin
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [userCount, startupCount, investmentCount, totalInvested] = await Promise.all([
      prisma.user.count(),
      prisma.startup.count(),
      prisma.investment.count(),
      prisma.investment.findMany({ select: { amount: true } })
    ]);

    const totalAmount = (totalInvested as any[]).reduce((sum: number, inv: any) => {
      return sum + (inv.amount?.toNumber?.() ?? Number(inv.amount) ?? 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalStartups: startupCount,
        totalInvestments: investmentCount,
        totalInvestedAmount: totalAmount,
        activeUsers: userCount,
        pendingVerifications: 0,
        recentActivity: []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/transactions/recent
 * Transactions récentes
 */
router.get('/transactions/recent', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: true }
    });

    res.json({
      success: true,
      data: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount?.toNumber?.() ?? Number(t.amount) ?? 0,
        status: t.status,
        userName: t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : 'Utilisateur',
        createdAt: t.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/users
 * Liste des utilisateurs (avec filtres optionnels)
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { kycStatus, search, limit: limitStr, offset: offsetStr } = req.query;
    const limit = parseInt(limitStr as string) || 20;
    const offset = parseInt(offsetStr as string) || 0;

    const where: any = {};
    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: u.phoneNumber,
        role: u.role,
        isActive: u.isActive,
        kycStatus: u.kycStatus || 'NONE',
        createdAt: u.createdAt
      })),
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Détails d'un utilisateur
 */
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { wallet: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      data: {
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        phoneNumber: (user as any).phoneNumber,
        role: (user as any).role,
        isActive: (user as any).isActive,
        kycStatus: (user as any).kycStatus || 'NONE',
        wallet: (user as any).wallet ? {
          balance: (user as any).wallet.balance?.toNumber?.() ?? 0,
          currency: (user as any).wallet.currency
        } : null,
        createdAt: (user as any).createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/users/:id/details
 */
router.get('/users/:id/details', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { wallet: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const investments = await prisma.investment.findMany({
      where: { userId: req.params.id },
      include: { startup: true }
    });

    res.json({
      success: true,
      data: {
        ...(user as any),
        investments: investments.map((inv: any) => ({
          id: inv.id,
          amount: inv.amount?.toNumber?.() ?? 0,
          status: inv.status,
          startup: { name: inv.startup?.name }
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    // Liste blanche : empêche la modification de champs sensibles (role, kycStatus,
    // email, password, isActive) via cette route générique. Ces champs ont des
    // endpoints dédiés et audités (toggle-status, verify-kyc, etc.).
    const { firstName, lastName, phoneNumber } = req.body;
    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/users/:id/toggle-status
 */
router.post('/users/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !(user as any).isActive }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/users/:id/kyc
 */
router.post('/users/:id/kyc', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycStatus: status || 'VERIFIED' }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/users/:id/verify-kyc
 */
router.post('/users/:id/verify-kyc', async (req: Request, res: Response) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycStatus: 'VERIFIED' }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/users/:id/reject-kyc
 */
router.post('/users/:id/reject-kyc', async (req: Request, res: Response) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycStatus: 'REJECTED' }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/users/:id/documents
 */
router.get('/users/:id/documents', async (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

/**
 * GET /api/admin/startups
 */
router.get('/startups', async (req: Request, res: Response) => {
  try {
    const startups = await prisma.startup.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: startups.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        logo: s.logo,
        website: s.website,
        valuationTarget: s.valuationTarget?.toNumber?.() ?? 0,
        raisedAmount: s.raisedAmount?.toNumber?.() ?? 0,
        minInvestment: s.minInvestment?.toNumber?.() ?? 0,
        maxInvestment: s.maxInvestment?.toNumber?.() ?? 0,
        isActive: s.isActive,
        startDate: s.startDate,
        endDate: s.endDate,
        createdAt: s.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/startups/:id
 */
router.put('/startups/:id', async (req: Request, res: Response) => {
  try {
    // Liste blanche : raisedAmount est dérivé des investissements et ne doit JAMAIS
    // être modifié à la main (intégrité financière).
    const allowed = ['name', 'description', 'logo', 'website', 'valuationTarget',
      'minInvestment', 'maxInvestment', 'isActive', 'startDate', 'endDate'];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const startup = await prisma.startup.update({
      where: { id: req.params.id },
      data
    });
    res.json({ success: true, data: startup });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/startups/:id/verify
 */
router.post('/startups/:id/verify', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Startup vérifiée' });
});

/**
 * POST /api/admin/startups/:id/toggle-status
 */
router.post('/startups/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const startup = await prisma.startup.findUnique({ where: { id: req.params.id } });
    if (!startup) return res.status(404).json({ success: false, message: 'Startup non trouvée' });

    const updated = await prisma.startup.update({
      where: { id: req.params.id },
      data: { isActive: !(startup as any).isActive }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/fund
 */
router.get('/fund', async (req: Request, res: Response) => {
  try {
    const startups = await prisma.startup.findMany({ where: { isActive: true } });
    const totalTarget = startups.reduce((sum: number, s: any) => sum + (s.valuationTarget?.toNumber?.() ?? 0), 0);
    const totalRaised = startups.reduce((sum: number, s: any) => sum + (s.raisedAmount?.toNumber?.() ?? 0), 0);

    res.json({
      success: true,
      data: {
        name: 'AfriStocks Capital Fund',
        targetAmount: totalTarget,
        raisedAmount: totalRaised,
        startupCount: startups.length,
        isActive: true
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/fund
 */
router.put('/fund', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Fonds mis à jour' });
});

/**
 * GET /api/admin/fund/stats
 */
router.get('/fund/stats', async (req: Request, res: Response) => {
  try {
    const [investmentCount, investorCount, startupCount] = await Promise.all([
      prisma.investment.count(),
      prisma.investment.findMany({ select: { userId: true }, distinct: ['userId'] }),
      prisma.startup.count({ where: { isActive: true } })
    ]);

    const investments = await prisma.investment.findMany({ select: { amount: true } });
    const totalAmount = (investments as any[]).reduce((sum: number, inv: any) => sum + (inv.amount?.toNumber?.() ?? 0), 0);

    res.json({
      success: true,
      data: {
        totalInvestments: investmentCount,
        totalInvestors: (investorCount as any[]).length,
        totalAmount,
        activeStartups: startupCount,
        averageInvestment: investmentCount > 0 ? totalAmount / investmentCount : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/investments
 */
router.get('/investments', async (req: Request, res: Response) => {
  try {
    const investments = await prisma.investment.findMany({
      include: { user: true, startup: true },
      orderBy: { investedAt: 'desc' }
    });

    res.json({
      success: true,
      data: investments.map((inv: any) => ({
        id: inv.id,
        userId: inv.userId,
        userName: inv.user ? `${inv.user.firstName || ''} ${inv.user.lastName || ''}`.trim() : '',
        userEmail: inv.user?.email || '',
        amount: inv.amount?.toNumber?.() ?? 0,
        status: inv.status,
        startupName: inv.startup?.name || '',
        investedAt: inv.investedAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/investments/:id/status
 */
router.put('/investments/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const investment = await prisma.investment.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, data: investment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/investments/export
 */
router.get('/investments/export', async (req: Request, res: Response) => {
  try {
    const investments = await prisma.investment.findMany({
      include: { user: true, startup: true },
      orderBy: { investedAt: 'desc' }
    });

    // Retourne les données en JSON (le frontend pourra les convertir en CSV/Excel)
    res.json({
      success: true,
      data: investments.map((inv: any) => ({
        id: inv.id,
        userName: inv.user ? `${inv.user.firstName || ''} ${inv.user.lastName || ''}`.trim() : '',
        userEmail: inv.user?.email || '',
        amount: inv.amount?.toNumber?.() ?? 0,
        status: inv.status,
        startupName: inv.startup?.name || '',
        investedAt: inv.investedAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/communications/email
 */
router.post('/communications/email', async (req: Request, res: Response) => {
  // Stub - email sending not implemented yet
  res.json({ success: true, message: 'Emails envoyés (simulation)' });
});

export { router as adminRoutes };
