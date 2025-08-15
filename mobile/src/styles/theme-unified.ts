// src/styles/theme-unified.ts

// Palette de couleurs unifiée avec l'application web
export const unifiedColors = {
  // Couleurs primaires
  primary: {
    emerald: '#10B981',      // Vert émeraude - Croissance et confiance
    emeraldDark: '#059669',
    emeraldLight: '#34D399',
    gold: '#FBBF24',         // Or lumineux - Ambition et succès
    goldDark: '#F59E0B',
    goldLight: '#FCD34D',
    gradient: ['#10B981', '#059669'],
  },
  
  // Fond principal aligné avec le web
  background: {
    primary: '#0F172A',      // Bleu nuit profond - Sérieux et professionnel
    secondary: '#1E293B',    // Slate 800
    tertiary: '#334155',     // Slate 700
  },
  
  // Textes
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',    // Gris perle - Élégance et lisibilité
    tertiary: '#9CA3AF',
    disabled: '#6B7280',
  },
  
  // Glass effects (Liquid Glass)
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.05)',
    heavy: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.2)',
    // Effets Liquid Glass
    liquidLight: 'rgba(255, 255, 255, 0.08)',
    liquidMedium: 'rgba(255, 255, 255, 0.12)',
    shimmer: 'rgba(255, 255, 255, 0.25)',
  },
  
  // États
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#FBBF24',
    info: '#3B82F6',
  },
  
  // Legacy - Anciennes couleurs orange pour rétrocompatibilité
  legacy: {
    orange: '#F97316',
    orangeDark: '#EA580C',
    orangeLight: '#FB923C',
    amber: '#F59E0B',
  }
};

// Configuration complète du thème
export const theme = {
  colors: unifiedColors,
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
    label: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
    liquidGlass: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    }
  },
  
  // Animations pour effets Liquid Glass
  animations: {
    liquidGlass: {
      duration: 2000,
      shimmerDuration: 3000,
    }
  }
};

// Export par défaut pour compatibilité
export default theme;