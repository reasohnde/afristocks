import { UserRole } from '@prisma/client';


export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type?: 'access' | 'refresh' | '2fa_pending';
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role: 'USER' | 'STARTUP';
  type?: 'access' | 'refresh' | '2fa_pending';
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
