// src/styles/safeTheme.ts
import { theme } from './theme';

// Fonction helper pour accéder aux propriétés du thème en toute sécurité
export const getThemeColor = (path: string, defaultValue: string = '#000000') => {
  const keys = path.split('.');
  let value: any = theme;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Theme property not found: ${path}`);
      return defaultValue;
    }
  }
  
  return value;
};

// Export du thème avec vérification
export const safeTheme = {
  ...theme,
  getColor: (path: string) => getThemeColor(`colors.${path}`),
  getSpacing: (size: keyof typeof theme.spacing) => theme.spacing[size] || 0,
};