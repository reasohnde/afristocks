// backend/src/scripts/createTestNews.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestNews() {
    try {
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            console.error('❌ Pas d\'admin trouvé');
            return;
        }

        // Supprimer les anciennes news de test (optionnel)
        await prisma.news.deleteMany({
            where: {
                title: { contains: '[TEST]' }
            }
        });

        const testNews = await prisma.news.create({
            data: {
                title: "[TEST] Actualité de test - " + new Date().toLocaleTimeString(),
                summary: "Ceci est une actualité de test créée automatiquement",
                content: "Contenu détaillé de l'actualité de test. Cette actualité a été créée pour vérifier que le système fonctionne correctement.",
                category: 'MARKET_UPDATE',
                importance: 'HIGH',
                tags: ['test', 'demo'],
                authorId: admin.id,
                isActive: true,
                publishedAt: new Date(),
                imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop'
            }
        });

        console.log('✅ News de test créée avec succès !');
        console.log('📰 ID:', testNews.id);
        console.log('📅 PublishedAt:', testNews.publishedAt);
        console.log('✓ IsActive:', testNews.isActive);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestNews(); 