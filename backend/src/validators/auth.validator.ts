import { body, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Numéro de téléphone invalide'),
  
  body('role')
    .optional()
    .isIn(['USER', 'STARTUP'])
    .withMessage('Rôle invalide')
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

export const refreshTokenValidator: ValidationChain[] = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Le refresh token est requis')
];

export const twoFactorValidator: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Le code 2FA est requis')
    .isLength({ min: 6, max: 6 })
    .withMessage('Le code 2FA doit contenir 6 chiffres')
    .isNumeric()
    .withMessage('Le code 2FA doit être numérique')
];
