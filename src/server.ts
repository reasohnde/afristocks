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

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
  }
});

// Middlewares de sécurité
app.use(helmet());
app.use(cors()); // Accepte toutes les origines temporairement

// Middlewares généraux
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
app.use('/api/', apiLimiter);

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
        🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}
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
