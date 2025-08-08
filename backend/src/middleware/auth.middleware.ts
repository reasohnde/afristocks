import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.utils';
import { PrismaClient, UserRole, KycStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Étendre l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        kycStatus: KycStatus;
      };
    }
  }
}

// Middleware principal d'authentification - compatible avec votre code existant
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token d\'accès manquant'
    });
    return;
  }

  try {
    // Utilise votre fonction verifyAccessToken existante
    const decoded = verifyAccessToken(token);
    
    // Enrichir avec les infos de la DB si nécessaire
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        kycStatus: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Compte inactif ou introuvable'
      });
      return;
    }

    // Ajouter les infos complètes à la requête
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus
    };
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
    return;
  }
};

// Middleware optionnel - n'échoue pas si pas de token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      
      // Enrichir avec les infos de la DB
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          kycStatus: true,
          isActive: true
        }
      });

      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus
        };
      }
    } catch (error) {
      // Ignorer l'erreur, l'utilisateur reste non authentifié
    }
  }

  next();
};

// Middleware pour vérifier les rôles
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé - Rôle insuffisant',
        requiredRoles: roles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

// Middleware pour vérifier le statut KYC
export const requireKycStatus = (statuses: KycStatus[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
      return;
    }

    if (!statuses.includes(req.user.kycStatus)) {
      res.status(403).json({
        success: false,
        message: 'Vérification KYC requise',
        currentStatus: req.user.kycStatus,
        requiredStatus: statuses
      });
      return;
    }

    next();
  };
};

// Middleware pour vérifier si l'email est vérifié
export const requireEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { email_verified: true }
  });

  if (!user?.email_verified) {
    res.status(403).json({
      success: false,
      message: 'Veuillez vérifier votre adresse email'
    });
    return;
  }

  next();
};

// Middleware pour vérifier la 2FA si activée
export const check2FA = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { two_factor_enabled: true }
  });

  if (user?.two_factor_enabled) {
    const twoFactorToken = req.headers['x-2fa-token'] as string;
    
    if (!twoFactorToken) {
      res.status(403).json({
        success: false,
        message: 'Token 2FA requis',
        requires2FA: true
      });
      return;
    }

    // Vérifier le token 2FA avec votre AuthService
    try {
      const { AuthService } = require('../services/auth.service');
      const isValid = await AuthService.verifyTwoFactorToken(req.user.userId, twoFactorToken);
      
      if (!isValid) {
        res.status(403).json({
          success: false,
          message: 'Token 2FA invalide'
        });
        return;
      }
    } catch (error) {
      res.status(403).json({
        success: false,
        message: 'Erreur de vérification 2FA'
      });
      return;
    }
  }

  next();
};

// Middleware combiné pour les routes sensibles
export const requireSecureAccess = [
  authenticate,
  requireEmailVerified,
  check2FA
];

// Middleware pour les investissements
export const requireInvestorAccess = [
  authenticate,
  requireRole(['INVESTOR', 'USER']),
  requireKycStatus(['VERIFIED']),
  requireEmailVerified
];

// Middleware pour les startups
export const requireStartupAccess = [
  authenticate,
  requireRole(['STARTUP']),
  requireEmailVerified
];

// Middleware pour les admins
export const requireAdminAccess = [
  authenticate,
  requireRole(['ADMIN']),
  check2FA
];