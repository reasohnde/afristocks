import { body, param, query, ValidationChain } from 'express-validator';

export const depositValidator: ValidationChain[] = [
  body('amount')
    .isFloat({ min: 1000 })
    .withMessage('Le montant minimum est de 1000 XOF')
    .isFloat({ max: 10000000 })
    .withMessage('Le montant maximum est de 10,000,000 XOF'),
  
  body('paymentMethod')
    .isIn(['MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'])
    .withMessage('Méthode de paiement invalide')
];

export const withdrawValidator: ValidationChain[] = [
  body('amount')
    .isFloat({ min: 1000 })
    .withMessage('Le montant minimum est de 1000 XOF'),
  
  body('bankDetails.accountNumber')
    .notEmpty()
    .withMessage('Le numéro de compte est requis'),
  
  body('bankDetails.bankName')
    .notEmpty()
    .withMessage('Le nom de la banque est requis'),
  
  body('bankDetails.accountName')
    .notEmpty()
    .withMessage('Le nom du titulaire est requis')
];

export const transferValidator: ValidationChain[] = [
  body('recipientEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email du destinataire invalide'),
  
  body('amount')
    .isFloat({ min: 100 })
    .withMessage('Le montant minimum est de 100 XOF'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La description ne peut pas dépasser 200 caractères')
];

export const transactionQueryValidator: ValidationChain[] = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être positif')
];
