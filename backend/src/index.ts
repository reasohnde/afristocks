import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', async (_req, res) => {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
        if (process.env.DATABASE_URL) {
            // Simple ping DB
            // @ts-ignore - template string raw for Prisma
            await prisma.$queryRaw`SELECT 1`;
            dbStatus = 'connected';
        }
    } catch (e) {
        dbStatus = 'disconnected';
    }

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'AfriStocks API (TS) is running',
        services: { database: dbStatus }
    });
});

app.get('/api/stocks', (_req, res) => {
    res.json({
        success: true,
        data: [
            { symbol: 'AFRI', name: 'Afri Index', price: 100, currency: 'XOF' },
            { symbol: 'NGX', name: 'Nigerian Growth', price: 245.5, currency: 'NGN' },
            { symbol: 'BVM', name: 'Bourse Régionale', price: 78.2, currency: 'XOF' }
        ]
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`TS server running on port ${PORT}`);
});


