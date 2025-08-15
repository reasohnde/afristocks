// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'STARTUP' | 'ADMIN';
  balance?: number;
  portfolio?: number;
  returns?: number;
  verified?: boolean;
  sector?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
}

export interface Startup {
  id: string;
  name: string;
  sector: string;
  country: string;
  valuation: number;
  sharePrice: number;
  availableShares: number;
  minInvestment: number;
  description: string;
  growth: number;
  verified?: boolean;
  logo?: string;
  founded?: string;
  employees?: number;
  revenue?: number;
  website?: string;
}

export interface Investment {
  id: string;
  startupId: string;
  startupName: string;
  shares: number;
  investedAmount: number;
  currentValue: number;
  returnPercentage: number;
  date: string;
}