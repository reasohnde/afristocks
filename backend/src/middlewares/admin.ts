import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        next();
    };
}; 