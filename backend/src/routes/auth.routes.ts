// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authLimiter, createAccountLimiter } from '../middleware/rateLimit.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body } from 'express-validator';
// Vérifiez que cette ligne existe en haut du fichier
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { transformRegisterData } from '../middleware/transform.middleware';

const router = Router();

// Validateurs
const registerValidator = [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),

  // Accepter phoneNumber OU phone_number (optionnel)
  body(['phoneNumber', 'phone_number']).optional().isMobilePhone('any').withMessage('Numéro de téléphone invalide'),

  // Role optionnel avec valeur par défaut
  body('role').optional().isIn(['USER', 'INVESTOR', 'STARTUP']).withMessage('Rôle invalide'),

  // Ces champs ne sont PAS requis pour une inscription basique
  body('firstName').optional(),
  body('lastName').optional(),

  // Pour les startups, rendre ces champs optionnels car on les génère automatiquement
  body('companyName').optional(),
  body('registrationNumber').optional(),
  body('legalName').optional(),
  body('description').optional(),
  body('sector').optional(),
  body('country').optional(),
  body('city').optional()
];

const loginValidator = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
];

// Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Register
router.post('/register',
  createAccountLimiter,
  //transformRegisterData, 
  registerValidator,
  validateRequest,
  async (req, res) => {
    try {
      console.log('📥 Register request:', req.body);

      // Validation manuelle pour les startups
      if (req.body.role === 'STARTUP') {
        if (!req.body.sector) {
          return res.status(400).json({
            success: false,
            error: 'Le secteur est requis pour les startups'
          });
        }
      }

      // Adapter les données pour le service
      const nameParts = (req.body.name || '').split(' ');
      const userData = {
        ...req.body,
        // Normaliser le numéro de téléphone
        phone_number: req.body.phone_number || req.body.phoneNumber || null,
        // Générer firstName et lastName depuis name si non fournis
        firstName: req.body.firstName || nameParts[0] || req.body.name,
        lastName: req.body.lastName || nameParts.slice(1).join(' ') || '',
        // Pour les startups, générer automatiquement les champs requis
        ...(req.body.role === 'STARTUP' && {
          companyName: req.body.companyName || req.body.name,
          registrationNumber: req.body.registrationNumber || `REG-${Date.now()}`,
          legalName: req.body.legalName || req.body.name,
          description: req.body.description || `Startup dans le secteur ${req.body.sector}`,
          sector: req.body.sector,
          country: req.body.country || 'Côte d\'Ivoire',
          city: req.body.city || ''
        })
      };
      // Supprimer phoneNumber pour éviter la confusion
      delete userData.phoneNumber;

      console.log('📤 Sending to AuthService:', userData);

      const result = await AuthService.register(userData);

      console.log('✅ Registration successful');

      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        ...result
      });
    } catch (error: any) {
      console.error('❌ Register error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        message: error.message
      });
    }
  }
);

// Login
router.post('/login',
  authLimiter,
  loginValidator,
  validateRequest,
  async (req, res) => {
    try {
      console.log('📥 Login request for:', req.body.email);

      // Ajouter l'IP et user agent pour le tracking des connexions
      const loginData = {
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress || '',
        userAgent: req.headers['user-agent'] || ''
      };

      const result = await AuthService.login(loginData);

      console.log('📤 Login result:', result);

      res.json({
        success: true,
        message: 'Connexion réussie',
        ...result  // token, refreshToken, user à la racine
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message,
        message: error.message
      });
    }
  }
);

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { userId, refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis'
      });
    }

    await AuthService.logout(userId, refreshToken);
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis'
      });
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      ...result  // token, refreshToken à la racine
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Routes protégées - nécessitent authentification
router.use(authenticate);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await AuthService.getCurrentUser(req.user!.userId);
    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// 2FA Generate
router.post('/2fa/generate', async (req, res) => {
  try {
    const result = await AuthService.generateTwoFactorSecret(req.user!.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 2FA Verify
router.post('/2fa/verify',
  body('token').notEmpty().withMessage('Token 2FA requis'),
  validateRequest,
  async (req, res) => {
    try {
      const { token } = req.body;
      const isValid = await AuthService.verifyTwoFactorToken(req.user!.userId, token);
      res.json({
        success: true,
        data: { verified: isValid }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// 2FA Enable
router.post('/2fa/enable',
  body('token').notEmpty().withMessage('Token 2FA requis'),
  validateRequest,
  async (req, res) => {
    try {
      const { token } = req.body;
      const result = await AuthService.enableTwoFactor(req.user!.userId, token);
      res.json({
        success: true,
        message: '2FA activé avec succès',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// 2FA Disable
router.post('/2fa/disable',
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validateRequest,
  async (req, res) => {
    try {
      const { password } = req.body;
      await AuthService.disableTwoFactor(req.user!.userId, password);
      res.json({
        success: true,
        message: '2FA désactivé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Email verification
router.post('/verify-email',
  body('token').notEmpty().withMessage('Token de vérification requis'),
  validateRequest,
  async (req, res) => {
    try {
      const { token } = req.body;
      await AuthService.verifyEmail(token);
      res.json({
        success: true,
        message: 'Email vérifié avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    await AuthService.resendVerificationEmail(req.user!.userId);
    res.json({
        success: true,
        message: 'Email de vérification renvoyé'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ROUTE TEMPORAIRE - À SUPPRIMER APRÈS CRÉATION DE L'ADMIN
router.post('/create-admin-temp', async (req, res) => {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@afristocks.com' }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Un administrateur existe déjà'
      });
    }

    // Créer le mot de passe hashé
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        email: 'admin@afristocks.com',
        passwordHash: hashedPassword,
        name: 'Administrateur Principal',
        phone_number: '+225 0123456789',
        role: 'ADMIN',
        kycStatus: 'VERIFIED',
        email_verified: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'Administrateur créé avec succès!',
      credentials: {
        email: 'admin@afristocks.com',
        password: 'Admin123!',
        instruction: 'SUPPRIMEZ CETTE ROUTE APRÈS CONNEXION!'
      }
    });
  } catch (error: any) {
    console.error('Erreur création admin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// IMPORTANT : Export par défaut
export default router;