// monitoring/setup.js

// 1. Configuration Sentry (Monitoring d'erreurs - Gratuit jusqu'à 5k events/mois)
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

const initSentry = (app) => {
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            integrations: [
                new Sentry.Integrations.Http({ tracing: true }),
                new Sentry.Integrations.Express({ app }),
                new ProfilingIntegration(),
            ],
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            profilesSampleRate: 0.1,
            environment: process.env.NODE_ENV,
        });

        // Middleware Sentry
        app.use(Sentry.Handlers.requestHandler());
        app.use(Sentry.Handlers.tracingHandler());
    }
};

// 2. Métriques personnalisées
class MetricsCollector {
    constructor() {
        this.metrics = {
            requests: { total: 0, success: 0, error: 0 },
            responseTime: [],
            activeUsers: new Set(),
            dbQueries: { total: 0, slow: 0 },
            cache: { hits: 0, misses: 0 },
        };
    }

    recordRequest(success = true) {
        this.metrics.requests.total++;
        if (success) {
            this.metrics.requests.success++;
        } else {
            this.metrics.requests.error++;
        }
    }

    recordResponseTime(time) {
        this.metrics.responseTime.push(time);
        // Garder seulement les 1000 dernières mesures
        if (this.metrics.responseTime.length > 1000) {
            this.metrics.responseTime.shift();
        }
    }

    recordActiveUser(userId) {
        this.metrics.activeUsers.add(userId);
    }

    recordDbQuery(time) {
        this.metrics.dbQueries.total++;
        if (time > 1000) { // Plus de 1 seconde = lent
            this.metrics.dbQueries.slow++;
        }
    }

    recordCache(hit = true) {
        if (hit) {
            this.metrics.cache.hits++;
        } else {
            this.metrics.cache.misses++;
        }
    }

    getMetrics() {
        const avgResponseTime = this.metrics.responseTime.length > 0
            ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
            : 0;

        return {
            ...this.metrics,
            avgResponseTime: Math.round(avgResponseTime),
            activeUsersCount: this.metrics.activeUsers.size,
            successRate: this.metrics.requests.total > 0
                ? ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2)
                : 100,
            cacheHitRate: (this.metrics.cache.hits + this.metrics.cache.misses) > 0
                ? ((this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses)) * 100).toFixed(2)
                : 0,
        };
    }

    reset() {
        this.metrics = {
            requests: { total: 0, success: 0, error: 0 },
            responseTime: [],
            activeUsers: new Set(),
            dbQueries: { total: 0, slow: 0 },
            cache: { hits: 0, misses: 0 },
        };
    }
}

const metricsCollector = new MetricsCollector();

// 3. Middleware de monitoring des performances
const performanceMonitoring = (req, res, next) => {
    const startTime = Date.now();

    // Override de res.end pour capturer le temps de réponse
    const originalEnd = res.end;
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;

        // Enregistrer les métriques
        metricsCollector.recordResponseTime(responseTime);
        metricsCollector.recordRequest(res.statusCode < 400);

        // Logger les requêtes lentes
        if (responseTime > 3000) {
            console.warn(`Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
        }

        // Ajouter les headers de performance
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        res.setHeader('X-Request-Id', req.id || 'unknown');

        originalEnd.apply(res, args);
    };

    next();
};

// 4. Health Check avancé
const advancedHealthCheck = async (prisma) => {
    const checks = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        checks: {},
    };

    // Check Database
    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        checks.checks.database = {
            status: 'healthy',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        checks.checks.database = {
            status: 'unhealthy',
            error: error.message,
        };
        checks.status = 'degraded';
    }

    // Check Memory
    const memUsage = process.memoryUsage();
    const maxMemory = 512 * 1024 * 1024; // 512MB pour le plan gratuit
    checks.checks.memory = {
        status: memUsage.heapUsed < maxMemory * 0.9 ? 'healthy' : 'warning',
        usage: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
        },
        percentage: ((memUsage.heapUsed / maxMemory) * 100).toFixed(2),
    };

    // Check Disk (si applicable)
    // const diskUsage = await checkDiskUsage();
    // checks.checks.disk = diskUsage;

    // Check External Services
    try {
        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/cloud_name/ping');
        checks.checks.cloudinary = {
            status: cloudinaryResponse.ok ? 'healthy' : 'unhealthy',
        };
    } catch (error) {
        checks.checks.cloudinary = {
            status: 'unhealthy',
            error: error.message,
        };
    }

    // Métriques actuelles
    checks.metrics = metricsCollector.getMetrics();

    return checks;
};

// 5. Route de monitoring
const setupMonitoringRoutes = (app, prisma) => {
    // Health check simple (pour Render)
    app.get('/health', async (req, res) => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            res.status(200).json({ status: 'ok' });
        } catch (error) {
            res.status(503).json({ status: 'error', message: error.message });
        }
    });

    // Health check détaillé
    app.get('/health/detailed', async (req, res) => {
        const healthData = await advancedHealthCheck(prisma);
        const statusCode = healthData.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthData);
    });

    // Métriques
    app.get('/metrics', (req, res) => {
        // Protection basique
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== process.env.METRICS_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        res.json(metricsCollector.getMetrics());
    });

    // Reset des métriques
    app.post('/metrics/reset', (req, res) => {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== process.env.METRICS_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        metricsCollector.reset();
        res.json({ message: 'Metrics reset successfully' });
    });
};

// 6. Logger personnalisé
const createLogger = () => {
    const winston = require('winston');

    const logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
        ),
        defaultMeta: {
            service: 'afristocks-api',
            environment: process.env.NODE_ENV,
        },
        transports: [
            // Console pour développement
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
            }),
            // Fichier pour production
            ...(process.env.NODE_ENV === 'production' ? [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ] : []),
        ],
    });

    return logger;
};

// 7. Optimisation de la base de données
const optimizeDatabase = async (prisma) => {
    // Créer les index nécessaires
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON "User"(email)',
        'CREATE INDEX IF NOT EXISTS idx_orders_status ON "Order"(status)',
        'CREATE INDEX IF NOT EXISTS idx_orders_created ON "Order"("createdAt")',
        'CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON "Stock"(symbol)',
        'CREATE INDEX IF NOT EXISTS idx_portfolio_user ON "Portfolio"("userId")',
    ];

    for (const index of indexes) {
        try {
            await prisma.$executeRawUnsafe(index);
            console.log(`✅ Index created: ${index.split(' ')[5]}`);
        } catch (error) {
            console.log(`ℹ️ Index might already exist: ${index.split(' ')[5]}`);
        }
    }

    // Analyser les tables pour optimiser les requêtes
    try {
        await prisma.$executeRaw`ANALYZE`;
        console.log('✅ Database analyzed and optimized');
    } catch (error) {
        console.error('❌ Database optimization failed:', error);
    }
};

module.exports = {
    initSentry,
    metricsCollector,
    performanceMonitoring,
    advancedHealthCheck,
    setupMonitoringRoutes,
    createLogger,
    optimizeDatabase,
};