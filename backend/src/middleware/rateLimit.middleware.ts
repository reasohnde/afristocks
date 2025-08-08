import rateLimit from 'express-rate-limit';

// Vérifier si on est en développement
const isDevelopment = process.env.NODE_ENV === 'development';

// Limite générale pour l'API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 1000, // Limite très haute en dev
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDevelopment ? () => true : undefined, // Skip complètement en dev
});

// Limite stricte pour l'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 5, // Plus de tentatives en dev
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
  skipSuccessfulRequests: true, // Ne compte que les échecs
  skip: isDevelopment ? () => true : undefined, // Skip complètement en dev
});

// Limite pour la création de compte
export const createAccountLimiter = rateLimit({
  windowMs: isDevelopment ? 60 * 1000 : 60 * 60 * 1000, // 1 minute en dev, 1 heure en prod
  max: isDevelopment ? 100 : 3, // 100 en dev, 3 en prod
  message: 'Trop de créations de compte, veuillez réessayer plus tard.',
  skip: isDevelopment ? () => true : undefined, // Skip complètement en dev
});

// Log pour confirmer le mode
console.log(`🔒 Rate limiting en mode: ${isDevelopment ? 'DEVELOPMENT (désactivé)' : 'PRODUCTION (activé)'}`);