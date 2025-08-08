// src/types/auth.types.ts
import { UserRole, WalletType, Currency } from '@prisma/client';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  id?: string; // Doublon pour compatibilité
  email: string;
  role: UserRole;
  name?: string; // Ajouter le nom pour le debug
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface WalletInfo {
  balance: number;
  locked?: number;
  currency: string;
  type: WalletType;
  isPrimary?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  phone_number?: string;
  verified: boolean;
  wallets: Record<string, WalletInfo>;  // { eur: {...}, btc: {...}, xof: {...} }
  totalBalance: number;  // Solde total converti en devise de référence
  // Pour la compatibilité avec l'ancien système
  balance: number;
  portfolio: number;
  returns: number;
  currency: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface CreateWalletRequest {
  walletType: WalletType;
  currency: Currency;
  mobileNumber?: string;
}

export interface TransferRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export interface WalletResponse {
  id: string;
  currency: string;
  type: WalletType;
  balance: number;
  lockedBalance: number;
  isPrimary: boolean;
  isActive: boolean;
  walletAddress?: string;
  mobileNumber?: string;
  iban?: string;
  createdAt: string;
}

// Étendre les types Express
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }

  export interface TokenPayload {
    userId: string;
    id?: string; // Doublon pour compatibilité
    email: string;
    role: UserRole;
    name?: string; // Ajouter le nom pour le debug
    type?: 'access' | 'refresh' | '2fa_pending';
  }

  export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    phone_number?: string;
    role?: 'USER' | 'STARTUP' | 'ADMIN' | 'INVESTOR';
    sector?: string;      // Ajout
    country?: string;     // Ajout
    city?: string;        // Ajout
  }

  export interface LoginDTO {
    email: string;
    password: string;
  }

  export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    from?: string;
    template?: string;
    data?: Record<string, any>;
  }
}
