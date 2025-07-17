// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this';

export const generateTokens = (payload: TokenPayload): TokenPair => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefreshToken: boolean = false): TokenPayload => {
  try {
    const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return verifyToken(token, false);
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return verifyToken(token, true);
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};

export const generateResetToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const verifyResetToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Token de réinitialisation invalide ou expiré');
  }
};
