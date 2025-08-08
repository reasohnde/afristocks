// backend/src/routes/admin.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AdminService } from '../services/admin.service';
import { requireAdmin } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Toutes les routes nécessitent l'authentification et le rôle admin
router.use(authenticate);
router.use(requireAdmin);

// Dashboard statistiques
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await AdminService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// === GESTION DES STARTUPS ===

// Liste des startups
router.get('/startups',
  [
    query('status').optional().isIn(['all', 'pending', 'verified', 'rejected']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const filters = {
        status: req.query.status as any || 'all',
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0
      };

      const startups = await AdminService.getStartups(filters);
      res.json({
        success: true,
        data: startups
      });
    } catch (error: any) {
      console.error('Get startups error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Approuver une startup
router.post('/startups/:id/approve',
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const startup = await AdminService.approveStartup(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        message: 'Startup approuvée avec succès',
        data: startup
      });
    } catch (error: any) {
      console.error('Approve startup error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Rejeter une startup
router.post('/startups/:id/reject',
  [
    param('id').isUUID(),
    body('reason').notEmpty().withMessage('La raison est requise')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const startup = await AdminService.rejectStartup(
        req.params.id,
        req.body.reason,
        req.user!.userId
      );
      res.json({
        success: true,
        message: 'Startup rejetée',
        data: startup
      });
    } catch (error: any) {
      console.error('Reject startup error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// === GESTION DES UTILISATEURS ===

// Liste des utilisateurs
router.get('/users',
  [
    query('role').optional().isIn(['USER', 'INVESTOR', 'STARTUP', 'ADMIN']),
    query('kycStatus').optional().isIn(['PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED']),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const filters = {
        role: req.query.role as any,
        kycStatus: req.query.kycStatus as any,
        search: req.query.search as string,
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0
      };

      const users = await AdminService.getUsers(filters);
      res.json({
        success: true,
        data: users
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Détails complets d'un utilisateur avec toutes les relations
router.get('/users/:id/details', 
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      console.log('📋 Fetching complete details for user:', id);

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          startup: true,
          wallets: {
            orderBy: { isPrimary: 'desc' }
          },
          transactions: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          investments: {
            include: {
              startup: {
                select: {
                  companyName: true,
                  sector: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      console.log('✅ User found with complete data:', {
        userId: user.id,
        hasStartup: !!user.startup,
        hasProfile: !!user.profile,
        walletsCount: user.wallets.length,
        transactionsCount: user.transactions.length
      });

      // Formater les données pour le frontend
      const formattedUser = {
        // Données de base de l'utilisateur
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        kycStatus: user.kycStatus,
        isActive: user.isActive,
        email_verified: user.email_verified,
        two_factor_enabled: user.two_factor_enabled,
        created_at: user.created_at,
        lastLogin: user.last_login,
        
        // Données du profil
        profile: user.profile,
        
        // Données startup (si applicable)
        startup: user.startup,
        // Aplatir aussi les données startup au niveau racine pour compatibilité
        ...(user.startup && {
          companyName: user.startup.companyName,
          sector: user.startup.sector,
          country: user.startup.country,
          city: user.startup.city,
          description: user.startup.description,
          website: user.startup.website,
          foundedDate: user.startup.foundedDate,
          teamSize: user.startup.teamSize,
          revenue: user.startup.valuation,
          registrationNumber: user.startup.registrationNumber,
          employees: user.startup.teamSize, // Alias pour compatibilité
        }),
        
        // Données financières
        wallets: user.wallets,
        primaryWallet: user.wallets.find(w => w.isPrimary) || user.wallets[0],
        
        // Transactions
        transactions: user.transactions,
        
        // Investissements
        investments: user.investments,
        
        // Documents KYC - Pour l'instant vides car pas de table documents KYC
        kycDocuments: []
      };

      res.json({
        success: true,
        data: formattedUser
      });
    } catch (error: any) {
      console.error('Erreur récupération détails utilisateur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }
);

// Valider le KYC d'un utilisateur
router.post('/users/:id/verify-kyc',
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      console.log('Verifying KYC for user:', req.params.id);
      const user = await AdminService.verifyUserKYC(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        message: 'KYC validé avec succès',
        data: user
      });
    } catch (error: any) {
      console.error('Verify KYC error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Rejeter le KYC
router.post('/users/:id/reject-kyc',
  [
    param('id').isUUID(),
    body('reason').notEmpty().withMessage('La raison est requise')
  ],
  validateRequest,
  async (req, res) => {
    try {
      console.log('Rejecting KYC for user:', req.params.id, 'Reason:', req.body.reason);
      const user = await AdminService.rejectUserKYC(
        req.params.id,
        req.body.reason,
        req.user!.userId
      );
      res.json({
        success: true,
        message: 'KYC rejeté',
        data: user
      });
    } catch (error: any) {
      console.error('Reject KYC error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Bloquer un utilisateur
router.post('/users/:id/block',
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      console.log('Blocking user:', req.params.id);
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: false }
      });
      
      res.json({
        success: true,
        message: 'Utilisateur bloqué',
        data: user
      });
    } catch (error: any) {
      console.error('Block user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Débloquer un utilisateur
router.post('/users/:id/unblock',
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      console.log('Unblocking user:', req.params.id);
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: true }
      });
      
      res.json({
        success: true,
        message: 'Utilisateur débloqué',
        data: user
      });
    } catch (error: any) {
      console.error('Unblock user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Basculer le statut d'un utilisateur (compatibilité)
router.post('/users/:id/toggle-status',
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      console.log('Toggling status for user:', req.params.id);
      const user = await AdminService.toggleUserStatus(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        message: user.isActive ? 'Utilisateur débloqué' : 'Utilisateur bloqué',
        data: user
      });
    } catch (error: any) {
      console.error('Toggle status error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Supprimer un utilisateur
router.delete('/users/:id',
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      await AdminService.deleteUser(
        req.params.id,
        req.user!.userId
      );
      res.json({
        success: true,
        message: 'Utilisateur supprimé'
      });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Transactions récentes
router.get('/transactions/recent', async (req, res) => {
  try {
    const transactions = await AdminService.getRecentTransactions();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Documents en attente
router.get('/documents/pending', async (req, res) => {
  try {
    const documents = await AdminService.getPendingDocuments();
    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    console.error('Get documents error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Test route pour vérifier que les routes admin fonctionnent
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes working',
    user: req.user
  });
});

export { router as adminRoutes };