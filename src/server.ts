import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Imports internes
import routes from './routes';
import { prisma, checkDatabaseConnection } from './config/database';
import { redis } from './config/redis';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { verifyAccessToken } from './utils/token.utils';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Charger les variables d'environnement
dotenv.config();

// Origines autorisées (CORS) — liste blanche via env (séparées par des virgules)
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3001')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Créer l'application Express
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Authentification des connexions Socket.io : un JWT valide est obligatoire.
// Le userId provient du token (jamais du client) pour empêcher l'écoute des rooms d'autrui.
io.use((socket, next) => {
  try {
    const raw =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.headers.authorization || '').split(' ')[1];
    if (!raw) return next(new Error('Authentification requise'));
    const decoded = verifyAccessToken(raw);
    (socket.data as any).userId = decoded.userId;
    return next();
  } catch {
    return next(new Error('Token invalide ou expiré'));
  }
});

// Middlewares de sécurité
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Autoriser les requêtes sans en-tête Origin (apps mobiles natives, curl, SSR)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origine non autorisée par CORS: ' + origin));
    },
    credentials: true
  })
);

// Middlewares généraux
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
app.use('/api/', apiLimiter);

// Documentation interactive de l'API (Swagger UI) — http://localhost:PORT/api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Monter les routes
app.use('/api', routes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Erreur serveur'
      : err.message
  });
});

// Socket.io pour les notifications temps réel
io.on('connection', (socket) => {
  const userId = (socket.data as any).userId as string;
  // Chaque socket rejoint UNIQUEMENT sa propre room (déterminée par le token, pas par le client)
  socket.join(`user:${userId}`);
  console.log('Nouvelle connexion Socket.io:', socket.id, '→ user:' + userId);

  socket.on('disconnect', () => {
    console.log('Déconnexion Socket.io:', socket.id);
  });
});

// Exporter io pour l'utiliser dans d'autres modules
export { io };

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Vérifier les connexions
    await checkDatabaseConnection();
    console.log('✅ Base de données connectée');

    // Redis est déjà connecté automatiquement
    console.log('✅ Redis connecté');

    httpServer.listen(PORT, () => {
      console.log(`
        🚀 Serveur démarré sur le port ${PORT}
        📊 Environnement: ${process.env.NODE_ENV || 'development'}
        🌍 Origines autorisées: ${allowedOrigins.join(', ')}
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

// Gérer l'arrêt propre
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu: fermeture du serveur');
  httpServer.close(() => {
    console.log('Serveur HTTP fermé');
  });
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
