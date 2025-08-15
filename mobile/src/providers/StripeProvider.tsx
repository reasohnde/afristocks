// src/providers/StripeProvider.tsx
import React from 'react';
import { StripeProvider as BaseStripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_CONFIG } from '../config/stripe';

interface Props {
    children: React.ReactNode;
}

export const StripeProvider: React.FC<Props> = ({ children }) => {
    return (
        <BaseStripeProvider
            publishableKey={STRIPE_CONFIG.publishableKey}
            merchantIdentifier={STRIPE_CONFIG.merchantIdentifier}
            urlScheme={STRIPE_CONFIG.urlScheme}
        >
            {children}
        </BaseStripeProvider>
    );
}; 