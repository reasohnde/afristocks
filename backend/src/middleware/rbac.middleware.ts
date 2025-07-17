import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

// Middleware pour vérifier les rôles
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Rôle insuffisant.'
      });
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur est le propriétaire
export const requireOwnership = (getUserId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const resourceUserId = getUserId(req);
    
    if (req.user.userId !== resourceUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.'
      });
    }

    next();
  };
};

// Raccourcis pour les rôles courants
export const requireAdmin = requireRole('ADMIN');
export const requireStartup = requireRole('STARTUP', 'ADMIN');
export const requireUser = requireRole('USER', 'STARTUP', 'ADMIN');
