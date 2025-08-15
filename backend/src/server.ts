


#


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Charger les variables d'environnement en premier
dotenv.config();

// Imports internes avec gestion d'erreur
import routes from './routes';
import { prisma, checkDatabaseConnection } from './config/database';
import { redis } from './config/redis';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { NewsWebSocketServer } from './websocket/newsSocket';
import { newsService } from './services/newsService';
import { logger } from './utils/logger';
import newsRoutes from './routes/news.routes';

// Créer l'application Express
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Configuration CORS améliorée
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Si vous utilisez Vite
      'http://100.105.207.193:3000', // Frontend web
      'http://100.105.207.193:5001', // API directe
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Permettre les requêtes sans origine (ex: Postman, apps mobiles)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS: Origin non autorisée:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 heures
};

// Middlewares de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Pour permettre les ressources cross-origin
}));
app.use(cors(corsOptions));

// Middleware pour logger les requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middlewares généraux
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour ajouter des headers de sécurité supplémentaires
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Ajoutez ce code APRÈS les middlewares généraux et AVANT le rate limiter

// Middleware de logging pour toutes les requêtes
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers.origin);

  // Logger le body pour les POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }

  // Logger la réponse - IMPORTANT : utiliser res.on('finish')
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.path} - Status: ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Vérifier que les routes sont bien montées
console.log('🔧 Montage des routes...');

// Rate limiting global (votre code existant)
app.use('/api/', apiLimiter);

// Rate limiting global
app.use('/api/', apiLimiter);

// Route de test simple
app.get('/', (req, res) => {
  res.json({
    message: 'AfriStocks API',
    version: '1.0.0',
    status: 'running'
  });
});

// Route de santé (health check)
app.get('/health', async (req, res) => {
  try {
    // Vérifier la base de données
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = 'connected';

    // Vérifier Redis
    const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        redis: redis.status
      }
    });
  }
});

// Monter les routes API
app.use('/api', routes);

// Routes news
app.use('/api/v1/news', newsRoutes);
app.use('/api/news', newsRoutes); // Pour compatibilité

// Route catch-all pour le debug en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`Route non trouvée: ${req.method} ${req.path}`);
    next();
  });
}

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.path} n'existe pas`,
    timestamp: new Date().toISOString()
  });
});

// Gestion globale des erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur globale:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      message: err.message,
      details: err.errors
    });
  }

  // Erreur d'authentification
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé',
      message: 'Token invalide ou expiré'
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
    message: 'Une erreur inattendue s\'est produite',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
});

// Socket.io pour les notifications temps réel
io.on('connection', (socket) => {
  console.log('Nouvelle connexion Socket.io:', socket.id);

  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion Socket.io:', socket.id);
  });
});

// Exporter io pour l'utiliser dans d'autres modules
export { io };

// Configuration du port (Render fournit PORT)
const PORT = parseInt(process.env.PORT || '5001');
const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 permet les connexions externes



// Fonction de démarrage du serveur
async function startServer() {
  try {
    // Vérifier les variables d'environnement critiques
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
    }

    // Vérifier les connexions
    await checkDatabaseConnection();
    console.log('✅ Base de données connectée');

    // Attendre que Redis soit prêt
    if (redis.status !== 'ready') {
      await new Promise((resolve) => {
        redis.once('ready', resolve);
      });
    }
    console.log('✅ Redis connecté');

    // Initialiser WebSocket pour les news
    const newsWS = new NewsWebSocketServer(httpServer);

    // Passer l'instance Socket.io au service de news
    newsService.setSocketServer(newsWS.getIO());



    console.log('✅ WebSocket news initialisé');

    // Démarrer le serveur HTTP
    httpServer.listen(PORT, HOST, () => {
      // Obtenir l'IP locale pour l'accès mobile
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      let localIP = 'localhost';

      // Chercher l'IP locale (pas localhost)
      Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((netInterface: any) => {
          if (netInterface.family === 'IPv4' && !netInterface.internal) {
            localIP = netInterface.address;
          }
        });
      });

      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    🚀 AfriStocks API v1.0.0                   ║
╠═══════════════════════════════════════════════════════════════╣
║  Statut      : ✅ En ligne                                    ║
║  Port        : ${PORT}                                        ║
║  Environnement: ${process.env.NODE_ENV || 'development'}      ║
║  URL Frontend : ${process.env.FRONTEND_URL || 'http://localhost:3000'} ║
║  URL API     : http://localhost:${PORT}                       ║
║  URL Mobile  : http://${localIP}:${PORT}                      ║
║  WebSocket   : ws://localhost:${PORT}/news                    ║
║  WS Mobile   : ws://${localIP}:${PORT}/news                   ║
╠═══════════════════════════════════════════════════════════════╣
║                    📍 Routes principales                       ║
╠═══════════════════════════════════════════════════════════════╣
║  GET    /                     - Info API                      ║
║  GET    /health               - Health check                  ║
║  POST   /api/auth/register    - Inscription                   ║
║  POST   /api/auth/login       - Connexion                     ║
║  POST   /api/auth/logout      - Déconnexion                   ║
║  POST   /api/auth/refresh     - Refresh token                 ║
║  GET    /api/startups         - Liste des startups            ║
║  GET    /api/portfolio        - Portfolio utilisateur          ║
║  GET    /api/news             - Actualités                    ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });

    // Gérer les erreurs du serveur
    httpServer.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ Le port ${PORT} nécessite des privilèges élevés`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ Le port ${PORT} est déjà utilisé`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} reçu: fermeture gracieuse du serveur...`);

  // Arrêter d'accepter de nouvelles connexions
  httpServer.close(() => {
    console.log('✅ Serveur HTTP fermé');
  });

  // Fermer les connexions Socket.io
  io.close(() => {
    console.log('✅ Connexions Socket.io fermées');
  });

  try {
    // Déconnecter Prisma
    await prisma.$disconnect();
    console.log('✅ Base de données déconnectée');

    // Déconnecter Redis
    redis.disconnect();
    console.log('✅ Redis déconnecté');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
    process.exit(1);
  }
}

// Écouter les signaux de fermeture
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Démarrer le serveur
startServer();