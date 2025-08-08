import { Router } from 'express';
import { TransactionService } from '../services/transaction.service';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, query } from 'express-validator';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Déposer des fonds
router.post('/deposit',
  [
    body('amount').isFloat({ min: 1000 }).withMessage('Le montant minimum est de 1000 XOF'),
    body('method').isIn(['orange_money', 'mtn_money', 'moov_money', 'wave', 'bank_transfer']),
    body('currency').optional().isIn(['XOF', 'EUR', 'USD'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { amount, method, currency = 'XOF' } = req.body;
      
      const transaction = await TransactionService.createDeposit({
        userId: req.user!.userId,
        amount,
        method,
        currency
      });

      res.json({
        success: true,
        message: 'Dépôt initié avec succès',
        data: transaction
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Retirer des fonds
router.post('/withdraw',
  [
    body('amount').isFloat({ min: 5000 }).withMessage('Le montant minimum est de 5000 XOF'),
    body('method').isIn(['orange_money', 'mtn_money', 'moov_money', 'wave', 'bank_transfer']),
    body('currency').optional().isIn(['XOF', 'EUR', 'USD']),
    body('accountDetails').notEmpty().withMessage('Les détails du compte sont requis')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { amount, method, currency = 'XOF', accountDetails } = req.body;
      
      const transaction = await TransactionService.createWithdrawal({
        userId: req.user!.userId,
        amount,
        method,
        currency,
        accountDetails
      });

      res.json({
        success: true,
        message: 'Retrait initié avec succès',
        data: transaction
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Historique des transactions
router.get('/history',
  [
    query('type').optional().isIn(['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'DIVIDEND']),
    query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0
      };

      const transactions = await TransactionService.getUserTransactions(
        req.user!.userId,
        filters
      );

      res.json({
        success: true,
        data: transactions
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

export { router as transactionRoutes };