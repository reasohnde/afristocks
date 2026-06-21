import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  twoFactorValidator,
} from '../validators/auth.validator';

const router = Router();

// Route de test
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Auth routes are working!' });
});

// Register
router.post('/register', registerValidator, validateRequest, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', loginValidator, validateRequest, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

// Logout — l'identité provient du token, pas du body (anti-IDOR)
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { refreshToken } = req.body;
    await AuthService.logout(userId, refreshToken);
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Refresh Token — le refresh token (secret porté par le client) suffit à prouver l'identité
router.post('/refresh-token', refreshTokenValidator, validateRequest, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

// 2FA Generate — protégé : l'utilisateur ne configure le 2FA QUE pour lui-même
router.post('/2fa/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await AuthService.generateTwoFactorSecret(userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 2FA Verify — protégé : userId issu du token (anti-IDOR)
router.post('/2fa/verify', authenticateToken, twoFactorValidator, validateRequest, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { token } = req.body;
    const isValid = await AuthService.verifyTwoFactorToken(userId, token);
    res.json({ success: true, data: { verified: isValid } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export { router as authRoutes };
