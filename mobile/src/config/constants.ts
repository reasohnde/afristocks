// Hôte du backend. En production: définir API_URL.
// Dev: iOS simulateur => http://localhost:5002 ; émulateur Android => http://10.0.2.2:5002 ;
// appareil physique => http://<IP-de-la-machine>:5002
export const API_URL = process.env.API_URL || 'http://localhost:5002';
export const APP_NAME = 'AfriStocks';
