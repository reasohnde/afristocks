// backend/src/services/news-ai.service.ts
import { OpenAI } from 'openai';
import Parser from 'rss-parser';
import { prisma } from '../config/database';
import { redis } from '../config/redis';

export class NewsAIService {
  private openai: OpenAI;
  private parser: Parser;
  private sources: NewsSource[];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.parser = new Parser();
    
    // Sources d'actualités africaines
    this.sources = [
      { name: 'African Business', url: 'https://african.business/feed/', lang: 'en' },
      { name: 'Jeune Afrique', url: 'https://www.jeuneafrique.com/feed/', lang: 'fr' },
      { name: 'Bloomberg Africa', url: 'https://www.bloomberg.com/africa/rss', lang: 'en' },
      { name: 'Reuters Africa', url: 'https://www.reuters.com/africa/rss', lang: 'en' },
      { name: 'Financial Afrik', url: 'https://www.financialafrik.com/feed/', lang: 'fr' },
      { name: 'TechCrunch Africa', url: 'https://techcrunch.com/category/africa/feed/', lang: 'en' }
    ];
  }

  // Collecter les actualités
  async collectNews() {
    console.log('🔍 Collecte des actualités...');
    const allArticles = [];

    for (const source of this.sources) {
      try {
        const feed = await this.parser.parseURL(source.url);
        const articles = feed.items.slice(0, 10).map(item => ({
          title: item.title,
          description: item.contentSnippet || item.content,
          url: item.link,
          pubDate: new Date(item.pubDate || Date.now()),
          source: source.name,
          language: source.lang,
          categories: item.categories || []
        }));
        
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Erreur collecte ${source.name}:`, error);
      }
    }

    return allArticles;
  }

  // Analyser et enrichir avec l'IA
  async analyzeAndEnrich(articles: any[]) {
    const enrichedArticles = [];

    for (const article of articles) {
      try {
        // Analyse par GPT-4
        const analysis = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: `Tu es un analyste financier spécialisé dans les marchés africains. 
                      Analyse cet article et fournis:
                      1. Un résumé en français (max 100 mots)
                      2. Les secteurs concernés (fintech, agritech, etc.)
                      3. Les pays mentionnés
                      4. L'impact potentiel sur les investissements (note 1-10)
                      5. Les startups ou entreprises mentionnées
                      6. Le sentiment (positif/neutre/négatif)
                      7. Les mots-clés principaux
                      Format JSON uniquement.`
          }, {
            role: "user",
            content: `Titre: ${article.title}\nContenu: ${article.description}`
          }],
          temperature: 0.3,
          max_tokens: 500
        });

        const aiAnalysis = JSON.parse(analysis.choices[0].message.content);
        
        enrichedArticles.push({
          ...article,
          analysis: {
            summary: aiAnalysis.summary,
            sectors: aiAnalysis.sectors,
            countries: aiAnalysis.countries,
            impactScore: aiAnalysis.impact,
            companies: aiAnalysis.companies,
            sentiment: aiAnalysis.sentiment,
            keywords: aiAnalysis.keywords,
            relevanceScore: this.calculateRelevance(aiAnalysis)
          }
        });

      } catch (error) {
        console.error('Erreur analyse IA:', error);
        enrichedArticles.push(article);
      }
    }

    return enrichedArticles;
  }

  // Calculer la pertinence
  calculateRelevance(analysis: any): number {
    let score = 0;
    
    // Critères de pertinence
    if (analysis.sectors?.includes('fintech')) score += 3;
    if (analysis.sectors?.includes('investment')) score += 3;
    if (analysis.impactScore > 7) score += 2;
    if (analysis.sentiment === 'positif') score += 1;
    if (analysis.companies?.length > 0) score += 2;
    
    return Math.min(score, 10);
  }

  // Sauvegarder en base
  async saveToDatabase(articles: any[]) {
    const saved = [];
    
    for (const article of articles) {
      try {
        // Vérifier les doublons
        const exists = await prisma.newsArticle.findFirst({
          where: { url: article.url }
        });
        
        if (!exists) {
          const created = await prisma.newsArticle.create({
            data: {
              title: article.title,
              description: article.description,
              url: article.url,
              source: article.source,
              publishedAt: article.pubDate,
              summary: article.analysis?.summary,
              sectors: article.analysis?.sectors || [],
              countries: article.analysis?.countries || [],
              impactScore: article.analysis?.impactScore || 0,
              sentiment: article.analysis?.sentiment || 'neutre',
              keywords: article.analysis?.keywords || [],
              relevanceScore: article.analysis?.relevanceScore || 0
            }
          });
          saved.push(created);
        }
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
      }
    }
    
    return saved;
  }

  // Pipeline complet
  async updateNews() {
    try {
      // 1. Collecter
      const rawArticles = await this.collectNews();
      console.log(`📰 ${rawArticles.length} articles collectés`);
      
      // 2. Analyser avec IA
      const enrichedArticles = await this.analyzeAndEnrich(rawArticles);
      console.log(`🤖 ${enrichedArticles.length} articles analysés`);
      
      // 3. Sauvegarder
      const saved = await this.saveToDatabase(enrichedArticles);
      console.log(`💾 ${saved.length} nouveaux articles sauvegardés`);
      
      // 4. Mettre en cache pour l'API
      await redis.setex(
        'news:latest', 
        3600, // 1 heure
        JSON.stringify(saved.slice(0, 20))
      );
      
      // 5. Notifier les clients WebSocket
      io.emit('news:update', {
        count: saved.length,
        articles: saved.slice(0, 5)
      });
      
      return saved;
    } catch (error) {
      console.error('Erreur pipeline news:', error);
      throw error;
    }
  }

  // API pour le frontend
  async getLatestNews(filters?: any) {
    // Vérifier le cache
    const cached = await redis.get('news:latest');
    if (cached && !filters) {
      return JSON.parse(cached);
    }
    
    // Requête DB
    const news = await prisma.newsArticle.findMany({
      where: {
        ...(filters?.sector && { sectors: { has: filters.sector } }),
        ...(filters?.country && { countries: { has: filters.country } }),
        ...(filters?.sentiment && { sentiment: filters.sentiment }),
        relevanceScore: { gte: filters?.minRelevance || 5 }
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: filters?.limit || 20
    });
    
    return news;
  }
}

// Cron job pour mise à jour automatique
import cron from 'node-cron';

// Toutes les 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('⏰ Mise à jour automatique des news...');
  const newsService = new NewsAIService();
  await newsService.updateNews();
});