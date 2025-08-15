// middleware/security.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token expiré' });
                }
                return res.status(403).json({ error: 'Token invalide' });
            }

            // Vérifier que l'utilisateur existe toujours
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    isActive: true,
                },
            });

            if (!user || !user.isActive) {
                return res.status(403).json({ error: 'Utilisateur non autorisé' });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Middleware de vérification des rôles
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Permissions insuffisantes',
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
};

// Validation et sanitization des inputs
const validateInput = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];

            // Vérifier si le champ est requis
            if (rules.required && !value) {
                errors.push({ field, message: `${field} est requis` });
                continue;
            }

            // Si le champ est optionnel et vide, passer
            if (!rules.required && !value) continue;

            // Validation selon le type
            switch (rules.type) {
                case 'email':
                    if (!validator.isEmail(value)) {
                        errors.push({ field, message: 'Email invalide' });
                    }
                    break;

                case 'password':
                    if (!validator.isStrongPassword(value, {
                        minLength: 8,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1,
                        minSymbols: 1,
                    })) {
                        errors.push({
                            field,
                            message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole'
                        });
                    }
                    break;

                case 'username':
                    if (!validator.isAlphanumeric(value) || value.length < 3 || value.length > 20) {
                        errors.push({
                            field,
                            message: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères alphanumériques'
                        });
                    }
                    break;

                case 'number':
                    if (!validator.isNumeric(value.toString())) {
                        errors.push({ field, message: `${field} doit être un nombre` });
                    }
                    if (rules.min !== undefined && Number(value) < rules.min) {
                        errors.push({ field, message: `${field} doit être supérieur à ${rules.min}` });
                    }
                    if (rules.max !== undefined && Number(value) > rules.max) {
                        errors.push({ field, message: `${field} doit être inférieur à ${rules.max}` });
                    }
                    break;

                case 'string':
                    if (typeof value !== 'string') {
                        errors.push({ field, message: `${field} doit être une chaîne de caractères` });
                    }
                    if (rules.minLength && value.length < rules.minLength) {
                        errors.push({ field, message: `${field} doit contenir au moins ${rules.minLength} caractères` });
                    }
                    if (rules.maxLength && value.length > rules.maxLength) {
                        errors.push({ field, message: `${field} ne doit pas dépasser ${rules.maxLength} caractères` });
                    }
                    break;

                case 'uuid':
                    if (!validator.isUUID(value)) {
                        errors.push({ field, message: `${field} doit être un UUID valide` });
                    }
                    break;

                case 'url':
                    if (!validator.isURL(value)) {
                        errors.push({ field, message: `${field} doit être une URL valide` });
                    }
                    break;

                case 'date':
                    if (!validator.isISO8601(value)) {
                        errors.push({ field, message: `${field} doit être une date valide` });
                    }
                    break;
            }

            // Sanitization
            if (rules.sanitize) {
                switch (rules.type) {
                    case 'email':
                        req.body[field] = validator.normalizeEmail(value);
                        break;
                    case 'string':
                        req.body[field] = validator.escape(value);
                        break;
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation échouée',
                details: errors
            });
        }

        next();
    };
};

// Protection contre les attaques par force brute
const loginAttempts = new Map();

const bruteForceProtection = (req, res, next) => {
    const ip = req.ip;
    const key = `${ip}:${req.body.email || req.body.username}`;

    if (!loginAttempts.has(key)) {
        loginAttempts.set(key, { count: 0, firstAttempt: Date.now() });
    }

    const attempts = loginAttempts.get(key);

    // Reset après 15 minutes
    if (Date.now() - attempts.firstAttempt > 15 * 60 * 1000) {
        loginAttempts.set(key, { count: 0, firstAttempt: Date.now() });
    }

    if (attempts.count >= 5) {
        return res.status(429).json({
            error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
        });
    }

    attempts.count++;
    next();
};

// Middleware de logging des requêtes sensibles
const auditLog = async (action) => {
    return async (req, res, next) => {
        try {
            const logEntry = {
                action,
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                method: req.method,
                path: req.path,
                body: req.body,
                timestamp: new Date(),
            };

            // Enlever les données sensibles
            if (logEntry.body?.password) {
                logEntry.body.password = '[REDACTED]';
            }

            // Sauvegarder dans la base de données ou fichier log
            console.log('AUDIT:', JSON.stringify(logEntry));

            // Optionnel: sauvegarder dans une table AuditLog
            // await prisma.auditLog.create({ data: logEntry });

            next();
        } catch (error) {
            console.error('Audit log error:', error);
            next(); // Continue même si le log échoue
        }
    };
};

// Middleware de vérification CSRF (pour les formulaires)
const csrfProtection = (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const token = req.headers['x-csrf-token'] || req.body._csrf;
        const sessionToken = req.session?.csrfToken;

        if (!token || token !== sessionToken) {
            return res.status(403).json({ error: 'Token CSRF invalide' });
        }
    }
    next();
};

// Génération de tokens sécurisés
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    return { accessToken, refreshToken };
};

// Hachage sécurisé des mots de passe
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Vérification des mots de passe
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Export des middlewares et fonctions utilitaires
module.exports = {
    authenticateToken,
    requireRole,
    validateInput,
    bruteForceProtection,
    auditLog,
    csrfProtection,
    generateTokens,
    hashPassword,
    verifyPassword,
};