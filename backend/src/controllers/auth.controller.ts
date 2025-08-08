// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { redis } from '../config/redis';
import crypto from 'crypto';

// Schémas de validation
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone_number: z.string().min(10, 'Numéro de téléphone invalide').optional(),
  role: z.enum(['USER', 'STARTUP', 'ADMIN', 'INVESTOR']).optional().default('USER'),
  sector: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

export const authController = {
  // Inscription
  async register(req: Request, res: Response) {
    try {
      // Validation des données
      const validatedData = registerSchema.parse(req.body);
      
      console.log('📨 Register request:', {
        ...validatedData,
        password: '***'
      });

      // Appeler le service avec TOUS les champs
      const result = await AuthService.register(validatedData);

      // Réponse au client
      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        ...result // Spread pour garder la structure token/refreshToken/user
      });

    } catch (error: any) {
      console.error('Erreur inscription:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de l\'inscription'
      });
    }
  },

  // Connexion
  async login(req: Request, res: Response) {
    try {
      // Validation des données
      const validatedData = loginSchema.parse(req.body);
      
      console.log('Tentative de connexion:', validatedData.email);

      // Appeler le service de connexion
      const result = await AuthService.login(validatedData);

      res.json({
        success: true,
        message: 'Connexion réussie',
        ...result
      });

    } catch (error: any) {
      console.error('Erreur connexion:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: error.errors
        });
      }

      res.status(401).json({
        success: false,
        error: error.message || 'Erreur lors de la connexion'
      });
    }
  },

  // Déconnexion
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const userId = (req as any).user?.userId;

      // Appeler le service de déconnexion
      await AuthService.logout(userId, refreshToken);

      // Invalider le token dans Redis (blacklist)
      if (userId) {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
          const decoded = (await import('jsonwebtoken')).decode(token) as any;
          if (decoded && decoded.exp) {
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
              await redis.setex(`blacklist:${token}`, ttl, 'true');
            }
          }
        }
      }

      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });

    } catch (error: any) {
      console.error('Erreur déconnexion:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la déconnexion'
      });
    }
  },

  // Rafraîchir le token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token requis'
        });
      }

      // Appeler le service pour rafraîchir le token
      const result = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        ...result
      });

    } catch (error: any) {
      console.error('Erreur refresh token:', error);

      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token invalide ou expiré'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erreur lors du rafraîchissement du token'
      });
    }
  },

  // Mot de passe oublié
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email requis'
        });
      }

      // Rechercher l'utilisateur (importation dynamique de Prisma)
      const { prisma } = await import('../config/database');
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Ne pas révéler si l'email existe
      const successMessage = 'Si cet email existe, vous recevrez un lien de réinitialisation.';

      if (!user) {
        return res.json({
          success: true,
          message: successMessage
        });
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

      // Sauvegarder le token hashé
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetTokenHash,
          resetTokenExpiry
        }
      });

      // Envoyer l'email (importation dynamique)
      const { sendEmail, emailTemplates } = await import('../utils/email');
      await sendEmail({
        to: user.email,
        ...emailTemplates.passwordReset(user.name, resetToken)
      });

      res.json({
        success: true,
        message: successMessage
      });

    } catch (error: any) {
      console.error('Erreur forgot password:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la demande de réinitialisation'
      });
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token et nouveau mot de passe requis'
        });
      }

      // Validation du nouveau mot de passe
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
        });
      }

      // Hasher le token pour comparaison
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Trouver l'utilisateur avec ce token
      const { prisma } = await import('../config/database');
      const user = await prisma.user.findFirst({
        where: {
          resetToken: tokenHash,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Token invalide ou expiré'
        });
      }

      // Hasher le nouveau mot de passe
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe et supprimer le token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      });

    } catch (error: any) {
      console.error('Erreur reset password:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la réinitialisation du mot de passe'
      });
    }
  },

  // Activer 2FA
  async enable2FA(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      // Appeler le service pour générer le secret 2FA
      const result = await AuthService.generateTwoFactorSecret(userId);

      res.json({
        success: true,
        ...result,
        message: 'Scannez le QR code avec votre application 2FA'
      });

    } catch (error: any) {
      console.error('Erreur activation 2FA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'activation 2FA'
      });
    }
  },

  // Vérifier 2FA
  async verify2FA(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Code requis'
        });
      }

      // Appeler le service pour vérifier le code 2FA
      const isValid = await AuthService.verifyTwoFactorToken(userId, code);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Code invalide'
        });
      }

      res.json({
        success: true,
        message: '2FA activé avec succès'
      });

    } catch (error: any) {
      console.error('Erreur vérification 2FA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification 2FA'
      });
    }
  }
};

// Export par défaut
export default authController;