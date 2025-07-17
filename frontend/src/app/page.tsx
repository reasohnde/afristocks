// src/app/page.tsx
'use client'

import dynamic from 'next/dynamic';

// Import dynamique (utile si tu veux désactiver SSR)
const AfriStocksApp = dynamic(() => import('@/components/AfriStocksApp'), { ssr: false });

export default function Home() {
  return <AfriStocksApp />;
}
