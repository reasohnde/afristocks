// Spécification OpenAPI 3.0 d'AfriStocks, servie via Swagger UI sur /api/docs.
const okMessage = {
  type: 'object',
  properties: { success: { type: 'boolean' }, message: { type: 'string' } },
};

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AfriStocks API',
    version: '1.0.0',
    description: "API de la plateforme d'investissement dans les startups africaines (wallet en XOF, investissements, authentification JWT + 2FA).",
  },
  servers: [{ url: '/api', description: 'Base des routes API' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['USER', 'STARTUP', 'ADMIN'] },
                },
              },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
      Error: okMessage,
    },
  },
  paths: {
    '/health': {
      get: { tags: ['Système'], summary: 'État de santé du service', responses: { 200: { description: 'OK' } } },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Créer un compte (crée aussi le wallet)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['email', 'password', 'name'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8, description: '≥8 car., 1 maj, 1 min, 1 chiffre' },
              name: { type: 'string' },
              phoneNumber: { type: 'string' },
              role: { type: 'string', enum: ['USER', 'STARTUP'] },
            },
          } } },
        },
        responses: { 201: { description: 'Compte créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 400: { description: 'Validation' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Se connecter',
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['email', 'password'],
          properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
        } } } },
        responses: { 200: { description: 'Connecté', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 401: { description: 'Identifiants invalides' } },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'], summary: 'Rafraîchir les tokens',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } } },
        responses: { 200: { description: 'Nouveaux tokens' }, 401: { description: 'Refresh invalide' } },
      },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Se déconnecter', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Déconnecté' }, 401: { description: 'Non authentifié' } } },
    },
    '/wallet/balance': {
      get: { tags: ['Wallet'], summary: 'Solde du portefeuille', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Solde' }, 401: { description: 'Non authentifié' } } },
    },
    '/wallet/deposit': {
      post: {
        tags: ['Wallet'], summary: 'Déposer des fonds', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['amount', 'paymentMethod'],
          properties: { amount: { type: 'number', minimum: 1000 }, paymentMethod: { type: 'string', enum: ['MOBILE_MONEY', 'BANK_TRANSFER', 'CARD'] } },
        } } } },
        responses: { 200: { description: 'Dépôt enregistré' }, 400: { description: 'Validation' } },
      },
    },
    '/wallet/withdraw': {
      post: {
        tags: ['Wallet'], summary: 'Retirer des fonds (frais 1%)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['amount', 'bankDetails'],
          properties: {
            amount: { type: 'number', minimum: 1000 },
            bankDetails: { type: 'object', required: ['accountNumber', 'bankName', 'accountName'],
              properties: { accountNumber: { type: 'string' }, bankName: { type: 'string' }, accountName: { type: 'string' } } },
          },
        } } } },
        responses: { 200: { description: 'Retrait en cours' }, 400: { description: 'Validation / solde insuffisant' } },
      },
    },
    '/wallet/transactions': {
      get: { tags: ['Wallet'], summary: 'Historique des transactions', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Liste' } } },
    },
    '/investments/startups': {
      get: { tags: ['Investissements'], summary: 'Liste des startups', responses: { 200: { description: 'Liste paginée' } } },
    },
    '/investments/invest/{startupId}': {
      post: {
        tags: ['Investissements'], summary: 'Investir dans une startup (min 1000 XOF)', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'startupId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', minimum: 1000 } } } } } },
        responses: { 200: { description: 'Investissement créé' }, 400: { description: 'Validation' }, 401: { description: 'Non authentifié' } },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentification & 2FA' },
    { name: 'Wallet', description: 'Portefeuille (XOF)' },
    { name: 'Investissements', description: 'Startups & investissements' },
    { name: 'Système', description: 'Santé & technique' },
  ],
};
