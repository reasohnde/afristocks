import { Router } from 'express';
import { InvestmentService } from '../services/investment.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { Request, Response } from 'express';

const router = Router();

const investValidator = [
  param('startupId').isUUID().withMessage('ID de startup invalide'),
  body('amount').isFloat({ min: 1000 }).withMessage('Le montant minimum est de 1000 XOF')
];

const paginationValidator = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
];

router.get('/startups',
  paginationValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const startups = await InvestmentService.getStartups(limit, offset);
      res.json({
        success: true,
        data: startups
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

router.get('/startups/:id',
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const startup = await InvestmentService.getStartupDetails(req.params.id);
      res.json({
        success: true,
        data: startup
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
);

router.use(authenticateToken);

router.post('/invest/:startupId',
  investValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      const result = await InvestmentService.invest(
        req.user!.userId,
        req.params.startupId,
        amount
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
  }
);

router.get('/my-investments', async (req, res) => {
  try {
    const investments = await InvestmentService.getUserInvestments(req.user!.userId);
    res.json({
      success: true,
      data: investments
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Alias: GET /api/investments/my (utilisé par fundService.ts)
router.get('/my', async (req, res) => {
  try {
    const investments = await InvestmentService.getUserInvestments(req.user!.userId);
    res.json({
      success: true,
      data: investments
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/investments (investir dans la première startup active)
router.post('/',
  body('amount').isFloat({ min: 1000 }).withMessage('Le montant minimum est de 1000 XOF'),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      // Trouver la première startup active
      const { prisma } = require('../config/database');
      const startup = await prisma.startup.findFirst({ where: { isActive: true } });
      if (!startup) {
        return res.status(400).json({ success: false, message: 'Aucune startup active' });
      }
      const result = await InvestmentService.invest(req.user!.userId, startup.id, amount);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

export { router as investmentRoutes };
