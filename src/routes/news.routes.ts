import { Router, Request, Response } from 'express';

const router = Router();

// Actualités statiques pour le MVP (pas de table news en base)
const NEWS_DATA = [
  {
    id: '1',
    title: 'AfriStocks lance sa plateforme d\'investissement',
    summary: 'La nouvelle plateforme permet aux investisseurs d\'accéder facilement aux startups africaines les plus prometteuses.',
    content: 'AfriStocks révolutionne l\'investissement en Afrique en offrant une plateforme accessible à tous.',
    image: '/images/news/launch.jpg',
    category: 'plateforme',
    author: 'Équipe AfriStocks',
    publishedAt: new Date('2026-01-15').toISOString(),
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: '2',
    title: 'EduConnect lève 5 millions XOF sur AfriStocks',
    summary: 'La startup edtech ivoirienne atteint son objectif de financement en seulement 2 semaines.',
    content: 'EduConnect, pionnière de l\'éducation numérique en Côte d\'Ivoire, a réussi sa levée de fonds.',
    image: '/images/news/educonnect.jpg',
    category: 'startups',
    author: 'Équipe AfriStocks',
    publishedAt: new Date('2026-01-20').toISOString(),
    createdAt: new Date('2026-01-20').toISOString()
  },
  {
    id: '3',
    title: 'L\'Afrique, nouvel eldorado des investisseurs tech',
    summary: 'Les investissements dans les startups africaines ont augmenté de 40% en 2025.',
    content: 'Le continent africain attire de plus en plus d\'investisseurs grâce à son écosystème tech dynamique.',
    image: '/images/news/africa-tech.jpg',
    category: 'marché',
    author: 'Équipe AfriStocks',
    publishedAt: new Date('2026-02-01').toISOString(),
    createdAt: new Date('2026-02-01').toISOString()
  },
  {
    id: '4',
    title: 'AgriTech Sahel : transformer l\'agriculture par la technologie',
    summary: 'Une nouvelle startup rejoint la plateforme AfriStocks avec un projet innovant pour les agriculteurs sahéliens.',
    content: 'AgriTech Sahel propose des solutions IoT pour optimiser l\'irrigation et les rendements agricoles.',
    image: '/images/news/agritech.jpg',
    category: 'startups',
    author: 'Équipe AfriStocks',
    publishedAt: new Date('2026-02-05').toISOString(),
    createdAt: new Date('2026-02-05').toISOString()
  },
  {
    id: '5',
    title: 'Guide : Comment bien investir dans les startups africaines',
    summary: 'Nos conseils pour diversifier votre portefeuille et maximiser vos rendements.',
    content: 'Découvrez les meilleures pratiques pour investir intelligemment dans l\'écosystème startup africain.',
    image: '/images/news/guide.jpg',
    category: 'éducation',
    author: 'Équipe AfriStocks',
    publishedAt: new Date('2026-02-08').toISOString(),
    createdAt: new Date('2026-02-08').toISOString()
  }
];

/**
 * GET /api/v1/news
 * Retourne les actualités (données statiques pour le MVP)
 */
router.get('/', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;
  const category = req.query.category as string;

  let filtered = [...NEWS_DATA];

  if (category) {
    filtered = filtered.filter(n => n.category === category);
  }

  const paginated = filtered.slice(offset, offset + limit);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + limit < filtered.length
    }
  });
});

/**
 * GET /api/v1/news/:id
 * Retourne un article spécifique
 */
router.get('/:id', (req: Request, res: Response) => {
  const article = NEWS_DATA.find(n => n.id === req.params.id);

  if (!article) {
    return res.status(404).json({
      success: false,
      message: 'Article non trouvé'
    });
  }

  res.json({
    success: true,
    data: article
  });
});

export { router as newsRoutes };
