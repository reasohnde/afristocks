import { Router } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();

// Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Register
router.post('/register', async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { userId, refreshToken } = req.body;
    await AuthService.logout(userId, refreshToken);
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);
    res.json({
      success: true,
      data: tokens
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// 2FA Generate
router.post('/2fa/generate', async (req, res) => {
  try {
    const { userId } = req.body; // Temporaire, sera remplacé par req.user
    const result = await AuthService.generateTwoFactorSecret(userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 2FA Verify
router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, token } = req.body; // Temporaire
    const isValid = await AuthService.verifyTwoFactorToken(userId, token);
    res.json({
      success: true,
      data: { verified: isValid }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export { router as authRoutes };
