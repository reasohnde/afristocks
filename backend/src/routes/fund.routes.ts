// backend/src/routes/fund.routes.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
console.log('🔵 Fund routes loaded!');
const prisma = new PrismaClient();

// Interface pour les requêtes authentifiées
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

// GET /api/fund - Récupérer les informations du fonds
router.get('/', async (req: Request, res: Response) => {
  console.log('🟢 GET /api/fund called');
  try {
    let fund = await prisma.fund.findFirst({
      include: {
        _count: {
          select: { investments: true }
        }
      }
    });

    if (!fund) {
      // Créer le fonds par défaut s'il n'existe pas
      fund = await prisma.fund.create({
        data: {
          name: 'AfriStocks Capital Fund',
          tagline: 'Investir dans l\'innovation africaine',
          description: 'Un fonds diversifié investissant dans les startups technologiques les plus prometteuses d\'Afrique.',
          targetAmount: 50000,
          raisedAmount: 15000,
          minInvestment: 50,
          maxInvestment: 10000,
          expectedReturn: '15-25%',
          duration: '3-5 ans',
          isActive: true,
          email: 'invest@afristocks.com',
          phone: '+225 01 23 45 67 89',
          whatsapp: '+225 01 23 45 67 89'
        },
        include: {
          _count: {
            select: { investments: true }
          }
        }
      });
    }

    // Formater la réponse pour correspondre au frontend
    const fundData = {
      ...fund,
      investors: fund._count.investments
    };

    res.json({
      success: true,
      data: fundData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du fonds:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du fonds'
    });
  }
});

// POST /api/fund/invest - Investir dans le fonds (compatible frontend)
router.post('/invest', async (req: Request, res: Response) => {
  try {
    const { amount, userName, userEmail, paymentMethod, status = 'completed' } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }

    if (!userName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email requis'
      });
    }

    // Récupérer le fonds
    const fund = await prisma.fund.findFirst();
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fonds non trouvé'
      });
    }

    // Vérifier les limites
    if (amount < fund.minInvestment) {
      return res.status(400).json({
        success: false,
        message: `Le montant minimum est de ${fund.minInvestment}€`
      });
    }

    if (amount > fund.maxInvestment) {
      return res.status(400).json({
        success: false,
        message: `Le montant maximum est de ${fund.maxInvestment}€`
      });
    }

    // Vérifier si le fonds est actif
    if (!fund.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Les investissements sont temporairement suspendus'
      });
    }

    // Récupérer l'utilisateur si l'email existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    // Créer l'investissement dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'investissement
      const investment = await tx.fundInvestment.create({
        data: {
          fundId: fund.id,
          userId: existingUser?.id || null,
          userName: userName,
          userEmail: userEmail,
          amount: amount,
          paymentMethod: paymentMethod || 'card',
          status: status
        }
      });

      // Mettre à jour le montant levé
      const updatedFund = await tx.fund.update({
        where: { id: fund.id },
        data: {
          raisedAmount: {
            increment: amount
          }
        }
      });

      return { investment, updatedFund };
    });

    // Formater la réponse pour le frontend
    const responseData = {
      id: result.investment.id,
      userId: result.investment.userId || 'anonymous',
      userName: result.investment.userName,
      userEmail: result.investment.userEmail,
      amount: result.investment.amount,
      paymentMethod: result.investment.paymentMethod,
      status: result.investment.status,
      date: result.investment.created_at.toISOString()
    };

    res.json({
      success: true,
      data: responseData,
      message: 'Investissement confirmé'
    });
  } catch (error) {
    console.error('Erreur lors de l\'investissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'investissement'
    });
  }
});

// GET /api/fund/investments - Récupérer tous les investissements
router.get('/investments', async (req: Request, res: Response) => {
  try {
    const fund = await prisma.fund.findFirst();
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fonds non trouvé'
      });
    }

    const investments = await prisma.fundInvestment.findMany({
      where: {
        fundId: fund.id,
        status: 'completed'
      },
      select: {
        id: true,
        userId: true,
        userName: true,
        userEmail: true,
        amount: true,
        status: true,
        paymentMethod: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 100 // Limiter à 100 derniers investissements
    });

    // Formater pour le frontend
    const formattedInvestments = investments.map(inv => ({
      id: inv.id,
      userId: inv.userId || 'anonymous',
      userName: inv.userName,
      userEmail: inv.userEmail,
      amount: inv.amount,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      date: inv.created_at.toISOString()
    }));

    res.json({
      success: true,
      data: formattedInvestments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des investissements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des investissements'
    });
  }
});

// PUT /api/fund - Mettre à jour le fonds (Admin seulement)
router.put('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Vérifier le rôle admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent modifier le fonds.'
      });
    }

    const fund = await prisma.fund.findFirst();
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fonds non trouvé'
      });
    }

    // Mise à jour avec les champs autorisés
    const allowedFields = [
      'name', 'tagline', 'description', 'targetAmount',
      'minInvestment', 'maxInvestment', 'expectedReturn',
      'duration', 'isActive', 'email', 'phone', 'whatsapp'
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedFund = await prisma.fund.update({
      where: { id: fund.id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedFund,
      message: 'Fonds mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fonds:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du fonds'
    });
  }
});

// GET /api/fund/stats - Statistiques du fonds
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const fund = await prisma.fund.findFirst();
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fonds non trouvé'
      });
    }

    // Compter les investisseurs uniques
    const uniqueInvestors = await prisma.fundInvestment.groupBy({
      by: ['userEmail'],
      where: {
        fundId: fund.id,
        status: 'completed'
      }
    });

    // Statistiques des investissements
    const stats = await prisma.fundInvestment.aggregate({
      where: {
        fundId: fund.id,
        status: 'completed'
      },
      _sum: {
        amount: true
      },
      _count: true,
      _avg: {
        amount: true
      }
    });

    res.json({
      success: true,
      data: {
        totalRaised: stats._sum.amount || 0,
        targetAmount: fund.targetAmount,
        progress: ((stats._sum.amount || 0) / fund.targetAmount) * 100,
        totalInvestors: uniqueInvestors.length,
        totalInvestments: stats._count,
        averageInvestment: stats._avg.amount || 0,
        isActive: fund.isActive
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

export default router;