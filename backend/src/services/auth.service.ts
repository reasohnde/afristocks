// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { generateTokens, verifyRefreshToken } from '../utils/token.utils';
import { sendEmail, emailTemplates } from '../utils/email';
import { RegisterDto, LoginDto } from '../types/auth.types';
import { WalletType, Currency } from '@prisma/client';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  role?: 'USER' | 'STARTUP' | 'ADMIN' | 'INVESTOR';
  sector?: string;
  country?: string;
  city?: string;
}

export class AuthService {
  static async register(data: RegisterData) {
    const { name, email, password, phone_number, role = 'USER', sector, country, city } = data;
  
    console.log('🔍 AuthService.register - Start:', { email, name, role, sector, country, city });
  
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
  
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }
  
    // Hasher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(password, saltRounds);
  
    // Créer l'utilisateur, le wallet ET la startup dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone_number,
          role,
          email_verified: false,
          isActive: true,
          two_factor_enabled: false
        }
      });
  
      console.log('✅ User created:', user.id);
  
      // 2. Créer le wallet
      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          walletType: WalletType.FIAT,
          currency: Currency.XOF,
          balance: 0,
          lockedBalance: 0,
          isPrimary: true,
          isActive: true
        }
      });
  
      console.log('✅ Wallet created:', wallet.id);
  
      // 3. SI C'EST UNE STARTUP, créer l'enregistrement startup
      let startup = null;
      if (role === 'STARTUP') {
        startup = await tx.startup.create({
          data: {
            userId: user.id,
            registrationNumber: `REG-${Date.now()}`,
            companyName: name, // Utiliser le nom comme nom d'entreprise par défaut
            legalName: name,
            description: 'Description à compléter',
            sector: sector || 'tech',
            country: country || 'Côte d\'Ivoire',
            city: city || 'Abidjan',
            teamSize: 1,
            valuation: 0,
            totalShares: 0,
            availableShares: 0,
            sharePrice: 0,
            minInvestment: 0,
            raisedAmount: 0,
            targetAmount: 0,
            verified: false,
            isActive: true
          }
        });
  
        console.log('✅ Startup created:', startup.id);
      }
  
      // 4. Créer le profil utilisateur
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' ') || '',
          country: country || 'Côte d\'Ivoire',
          city: city || ''
        }
      });
  
      console.log('✅ Profile created:', profile.id);
  
      return { user, wallet, startup, profile };
    });
  
    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(result.user);
  
    console.log('✅ Tokens generated');
  
    // Sauvegarder le refresh token
    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  
    // Envoyer l'email de bienvenue
    sendEmail({
      to: result.user.email,
      ...emailTemplates.welcome(result.user.name)
    }).catch(err => console.error('Email error:', err));
  
    // Retourner la réponse avec les infos startup si applicable
    const response = {
      token: accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        phone_number: result.user.phone_number,
        verified: result.user.email_verified,
        balance: parseFloat(result.wallet.balance.toString()),
        portfolio: 0,
        returns: 0,
        currency: result.wallet.currency,
        // Ajouter les infos startup si c'est une startup
        ...(result.startup && {
          companyName: result.startup.companyName,
          sector: result.startup.sector,
          country: result.startup.country,
          city: result.startup.city
        })
      }
    };
  
    console.log('📤 AuthService.register - Response:', response);
  
    return response;
  }

  static async login(data: LoginDto) {
    const { email, password } = data;

    console.log('🔍 AuthService.login - Start:', email);

    // Rechercher l'utilisateur avec ses wallets et startup
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallets: true,
        startup: true  // Inclure la relation startup
      }
    });

    if (!user || !user.isActive) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Sauvegarder le refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Récupérer le wallet principal
    const primaryWallet = user.wallets.find(w => w.isPrimary) || user.wallets[0];

    // Calculer le portfolio et les retours
    const investments = await prisma.investment.findMany({
      where: { userId: user.id },
      select: { amount: true }
    });

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0);
    
    // Calculer les retours basés sur le total investi vs balance actuelle
    const currentBalance = primaryWallet ? parseFloat(primaryWallet.balance.toString()) : 0;
    const returns = totalInvested > 0 ? ((currentBalance - totalInvested) / totalInvested) * 100 : 0;

    // Retourner la structure attendue avec les infos startup
    const response = {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone_number: user.phone_number,
        verified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        balance: currentBalance,
        portfolio: totalInvested,
        returns: returns,
        currency: primaryWallet?.currency || 'XOF',
        // Ajouter les infos startup si applicable
        ...(user.startup && {
          companyName: user.startup.companyName,
          sector: user.startup.sector,
          country: user.startup.country,
          city: user.startup.city
        })
      }
    };

    console.log('📤 AuthService.login - Response:', response);

    return response;
  }

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId
        }
      });
    }
  }

  static async refreshToken(oldRefreshToken: string) {
    console.log('🔍 AuthService.refreshToken - Start');

    // Vérifier le token
    const payload = verifyRefreshToken(oldRefreshToken);

    // Vérifier dans la base
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: oldRefreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() }
      }
    });

    if (!storedToken) {
      throw new Error('Refresh token invalide');
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou inactif');
    }

    // Générer de nouveaux tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Remplacer l'ancien refresh token
    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: storedToken.id }
      }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    return {
      token: accessToken,      // Important: "token" pas "accessToken"
      refreshToken
    };
  }

  static async generateTwoFactorSecret(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Générer un secret
    const secret = speakeasy.generateSecret({
      name: `AfriStocks (${user.email})`,
      issuer: 'AfriStocks'
    });

    // Sauvegarder temporairement le secret
    await redis.setex(`2fa_temp:${userId}`, 300, secret.base32); // 5 minutes

    // Générer le QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    };
  }

  static async verifyTwoFactorToken(userId: string, token: string) {
    // Récupérer le secret temporaire
    const tempSecret = await redis.get(`2fa_temp:${userId}`);

    if (!tempSecret) {
      // Si pas de secret temporaire, vérifier avec le secret permanent
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.two_factor_secret) {
        throw new Error('2FA non configuré');
      }

      return speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token,
        window: 2
      });
    }

    // Vérifier avec le secret temporaire
    const isValid = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (isValid) {
      // Activer 2FA
      await prisma.user.update({
        where: { id: userId },
        data: {
          two_factor_secret: tempSecret,
          two_factor_enabled: true
        }
      });

      // Supprimer le secret temporaire
      await redis.del(`2fa_temp:${userId}`);
    }

    return isValid;
  }
}

// Export par défaut pour compatibilité
export default AuthService;