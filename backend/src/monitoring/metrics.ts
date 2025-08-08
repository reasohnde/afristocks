// backend/src/monitoring/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Métriques métier
export const metrics = {
  // Compteurs
  userRegistrations: new Counter({
    name: 'afristocks_user_registrations_total',
    help: 'Total des inscriptions utilisateurs',
    labelNames: ['type'] // investor, startup
  }),
  
  investments: new Counter({
    name: 'afristocks_investments_total',
    help: 'Total des investissements',
    labelNames: ['startup', 'status']
  }),
  
  // Histogrammes
  investmentAmount: new Histogram({
    name: 'afristocks_investment_amount',
    help: 'Montant des investissements',
    buckets: [1000, 5000, 10000, 50000, 100000, 500000, 1000000]
  }),
  
  apiResponseTime: new Histogram({
    name: 'afristocks_api_response_time',
    help: 'Temps de réponse API',
    labelNames: ['method', 'route', 'status_code']
  }),
  
  // Jauges
  activeUsers: new Gauge({
    name: 'afristocks_active_users',
    help: 'Utilisateurs actifs'
  }),
  
  totalPortfolioValue: new Gauge({
    name: 'afristocks_total_portfolio_value',
    help: 'Valeur totale des portfolios',
    labelNames: ['currency']
  })
};

// Endpoint Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});