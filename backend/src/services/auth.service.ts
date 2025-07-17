import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { sendEmail, emailTemplates } from '../utils/email';
import { generateTokens, verifyRefreshToken } from '../utils/token.utils';
import { UserRole } from '@prisma/client';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role?: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterData) {
    const { email, password, name, phoneNumber, role = 'USER' } = data;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phoneNumber,
        role,
      },
    });

    // Créer un wallet pour l'utilisateur
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        lockedBalance: 0,
        currency: 'XOF',
      },
    });

    // Envoyer email de bienvenue
    try {
      await sendEmail({
        to: user.email,
        ...emailTemplates.welcome(user.name)
      });
    } catch (error) {
      console.error('Erreur envoi email de bienvenue:', error);
      // Ne pas bloquer l'inscription si l'email échoue
    }

    // Générer les tokens
    const tokens = generateTokens(user);

    // Sauvegarder la session dans Redis
    await redis.setex(
      `session:${user.id}:${tokens.refreshToken}`,
      7 * 24 * 60 * 60, // 7 jours
      JSON.stringify({
        userId: user.id,
        refreshToken: tokens.refreshToken,
      })
    );

    // Sauvegarder aussi dans la DB (refreshToken)
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async login(data: LoginData) {
    const { email, password } = data;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer les tokens
    const tokens = generateTokens(user);

    // Sauvegarder la session dans Redis
    await redis.setex(
      `session:${user.id}:${tokens.refreshToken}`,
      7 * 24 * 60 * 60, // 7 jours
      JSON.stringify({
        userId: user.id,
        refreshToken: tokens.refreshToken,
      })
    );

    // Utiliser upsert pour éviter les doublons
    await prisma.refreshToken.upsert({
      where: {
        token: tokens.refreshToken
      },
      update: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      create: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async logout(userId: string, refreshToken: string) {
    // Supprimer de Redis
    await redis.del(`session:${userId}:${refreshToken}`);

    // Supprimer de la DB (refreshToken)
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });
  }

  static async refreshToken(refreshToken: string) {
    try {
      // Vérifier le token
      const decoded = verifyRefreshToken(refreshToken);

      // Vérifier la session dans Redis
      const sessionKey = `session:${decoded.userId}:${refreshToken}`;
      const sessionData = await redis.get(sessionKey);

      let refreshTokenRecord = null;

      if (!sessionData) {
        // Si pas dans Redis, vérifier dans la DB (refreshToken)
        refreshTokenRecord = await prisma.refreshToken.findFirst({
          where: {
            userId: decoded.userId,
            token: refreshToken,
          },
        });

        if (!refreshTokenRecord) {
          throw new Error('Session invalide');
        }
      }

      // Récupérer l'utilisateur pour générer de nouveaux tokens
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Générer de nouveaux tokens
      const tokens = generateTokens(user);

      // Supprimer l'ancienne session/token
      await redis.del(sessionKey);

      // Créer la nouvelle session dans Redis
      await redis.setex(
        `session:${decoded.userId}:${tokens.refreshToken}`,
        7 * 24 * 60 * 60,
        JSON.stringify({
          userId: decoded.userId,
          refreshToken: tokens.refreshToken,
        })
      );

      // Mettre à jour dans la DB (refreshToken)
      await prisma.refreshToken.deleteMany({
        where: {
          userId: decoded.userId,
          token: refreshToken,
        },
      });

      await prisma.refreshToken.create({
        data: {
          userId: decoded.userId,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
        }
      });

      return tokens;
    } catch (error) {
      throw new Error('Token de rafraîchissement invalide');
    }
  }

  static async generateTwoFactorSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `AfriStocks (${userId})`,
      length: 32,
    });

    // Sauvegarder le secret temporairement dans Redis
    await redis.setex(
      `2fa_temp:${userId}`,
      10 * 60, // 10 minutes
      secret.base32
    );

    // Sauvegarder aussi dans la DB (champ user.twoFactorSecret)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32
      }
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url,
    };
  }

  static async verifyTwoFactorToken(userId: string, token: string) {
    // Récupérer le secret depuis Redis d'abord
    let secret = await redis.get(`2fa_secret:${userId}`);

    if (!secret) {
      // Si pas dans Redis, chercher dans la DB (champ user.twoFactorSecret)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true }
      });

      secret = user?.twoFactorSecret || null;

      if (!secret) {
        throw new Error('2FA non configuré');
      }

      // Sauvegarder en cache Redis
      if (secret) {
        await redis.setex(`2fa_secret:${userId}`, 3600, secret);
      }
    }

    const isValid = speakeasy.totp.verify({
      secret: secret || '',
      encoding: 'base32',
      token,
      window: 2,
    });

    return isValid;
  }
}
