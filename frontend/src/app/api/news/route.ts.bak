// src/app/api/news/route.ts
import { NextResponse } from 'next/server';

// ISR : rafraîchissement toutes les heures
export const revalidate = 3600;

// Données mockées pour éviter les limites API en dev
const MOCK_NEWS = [
  {
    title: "La BAD investit 500 millions $ dans les infrastructures numériques",
    description: "La Banque Africaine de Développement lance un nouveau programme d'investissement pour accélérer la transformation digitale du continent africain.",
    url: "https://example.com/news/1",
    urlToImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop"
  },
  {
    title: "Croissance record : le PIB africain progresse de 4.2% en 2024",
    description: "Les économies africaines montrent une résilience remarquable avec une croissance supérieure aux prévisions initiales du FMI.",
    url: "https://example.com/news/2",
    urlToImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop"
  },
  {
    title: "Fintech : Flutterwave lève 250M$ et devient la 4e licorne africaine",
    description: "La startup nigériane de paiement électronique confirme sa position de leader avec cette nouvelle levée de fonds record.",
    url: "https://example.com/news/3",
    urlToImage: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop"
  },
  {
    title: "Énergie solaire : le Kenya lance le plus grand parc d'Afrique de l'Est",
    description: "Avec une capacité de 300MW, cette installation permettra d'alimenter plus de 500 000 foyers kenyans en électricité propre.",
    url: "https://example.com/news/4",
    urlToImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=400&fit=crop"
  },
  {
    title: "Agriculture 4.0 : les drones révolutionnent les cultures en Côte d'Ivoire",
    description: "L'adoption de technologies de précision permet d'augmenter les rendements de 30% dans les plantations de cacao ivoiriennes.",
    url: "https://example.com/news/5",
    urlToImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop"
  },
  {
    title: "Zone de libre-échange : la ZLECAf dépasse les 2 milliards $ d'échanges",
    description: "Le commerce intra-africain atteint des niveaux historiques grâce à la zone de libre-échange continentale africaine.",
    url: "https://example.com/news/6",
    urlToImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop"
  }
];

export async function GET() {
  try {
    // En production, remplacer par un vrai appel API
    // const apiKey = process.env.NEWS_API_KEY;
    // const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=fr&pageSize=6&apiKey=${apiKey}`);
    // const data = await response.json();
    
    return NextResponse.json(MOCK_NEWS);
  } catch (error) {
    console.error('Erreur lors de la récupération des news:', error);
    return NextResponse.json(MOCK_NEWS); // Fallback sur les données mockées
  }
}