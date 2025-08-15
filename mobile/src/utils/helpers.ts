import { VALIDATION } from '../config/constants';

// Formatage des nombres
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (
  number: number,
  decimals: number = 2
): string => {
  return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatPercentage = (value: number): string => {
  const formatted = value.toFixed(2);
  return `${value > 0 ? '+' : ''}${formatted}%`;
};

// Formatage des dates
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
  
  return formatDate(date);
};

// Validation
export const validateEmail = (email: string): boolean => {
  return VALIDATION.email.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < VALIDATION.password.minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${VALIDATION.password.minLength} caractères`);
  }
  
  if (VALIDATION.password.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (VALIDATION.password.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (VALIDATION.password.requireSpecialChar && !/[!@#$%^&*]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Calculs pour le portfolio
export const calculatePortfolioChange = (holdings: any[]): {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
} => {
  let totalValue = 0;
  let totalCost = 0;
  
  holdings.forEach(holding => {
    totalValue += holding.value;
    totalCost += holding.quantity * holding.averagePrice;
  });
  
  const totalChange = totalValue - totalCost;
  const totalChangePercent = totalCost > 0 ? (totalChange / totalCost) * 100 : 0;
  
  return {
    totalValue,
    totalChange,
    totalChangePercent,
  };
};

// Gestion des erreurs API
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message === 'Network Error') {
    return 'Erreur de connexion. Vérifiez votre connexion internet.';
  }
  
  return 'Une erreur est survenue. Veuillez réessayer.';
};

// Débounce pour optimiser les recherches
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Stockage sécurisé des tokens
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  },
  
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  },
  
  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  },
  
  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },
  
  async getUser(): Promise<any | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'user']);
  },
};