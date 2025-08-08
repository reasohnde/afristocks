import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.utils';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Étend l'objet Request pour inclure l'utilisateur décodé
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        kycStatus: string;
      };
    }
  }
}

// Middleware pour vérifier si l'utilisateur est admin
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant',
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Accès administrateur requis',
      });
    }

    // Injecte l'utilisateur dans req.user
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    };

    next();
  } catch (error) {
    console.error('Erreur dans requireAdmin:', error);
    res.status(403).json({
      success: false,
      message: 'Token invalide ou erreur d’authentification',
    });
  }
};
