import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'AfriStocks API (TS) is running'
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


