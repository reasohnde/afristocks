// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
    user?: any;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        console.log('🔐 Auth middleware - Headers:', req.headers.authorization);

        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            console.log('❌ Pas de token trouvé');
            return res.status(401).json({
                error: 'Token requis',
                details: 'Authorization header manquant'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('✅ Token décodé:', {
            userId: decoded.userId || decoded.id,
            role: decoded.role,
            email: decoded.email
        });

        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Erreur vérification token:', error);
        return res.status(401).json({
            error: 'Token invalide',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
    console.log('👮 Admin check - User:', req.user);

    if (!req.user) {
        return res.status(401).json({
            error: 'Non authentifié',
            details: 'Utilisateur non trouvé'
        });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            error: 'Accès refusé',
            details: `Rôle actuel: ${req.user.role}, requis: ADMIN`
        });
    }

    next();
} 