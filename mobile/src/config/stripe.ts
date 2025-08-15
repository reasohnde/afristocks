// src/config/stripe.ts
export const STRIPE_CONFIG = {
    // Clé publique Stripe (pk_test_... pour le test, pk_live_... pour la production)
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_Vpk_live_51Rs2dhQ77ACef2h1nex8X20e2yVOfpxnKw7z4X1FGgdVBYBg6AJo2uOJNAyG5K3fiYkqssZKpzU6r2HQ34THcH0H00PyK8zjhh',

    // Options de configuration
    merchantIdentifier: 'merchant.com.afristocks', // Pour Apple Pay
    urlScheme: 'afristocks', // Pour les redirections
};