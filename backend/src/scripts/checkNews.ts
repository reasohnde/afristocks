// backend/src/scripts/checkNews.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNews() {
    try {
        console.log('🔍 Vérification de la table news...\n');

        // 1. Récupérer toutes les news
        const allNews = await prisma.news.findMany({
            include: {
                author: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        console.log(`📊 Total des news: ${allNews.length}\n`);

        // 2. Vérifier chaque news
        for (const news of allNews) {
            console.log(`📰 News ID: ${news.id}`);
            console.log(`   Titre: ${news.title}`);
            console.log(`   isActive: ${news.isActive} ${news.isActive ? '✅' : '❌'}`);
            console.log(`   publishedAt: ${news.publishedAt ? '✅ Défini' : '❌ NULL'}`);
            console.log(`   authorId: ${news.authorId}`);
            console.log(`   Auteur: ${news.author ? `${news.author.name} (${news.author.email})` : '❌ Auteur introuvable'}`);

            // Vérifications spécifiques
            const issues = [];
            if (!news.isActive) issues.push('isActive = false');
            if (!news.publishedAt) issues.push('publishedAt = NULL');
            if (!news.author) issues.push('Auteur introuvable');

            if (issues.length > 0) {
                console.log(`   ⚠️  Problèmes détectés: ${issues.join(', ')}`);
            } else {
                console.log(`   ✅ Tous les champs sont corrects`);
            }
            console.log('');
        }

        // 3. Statistiques
        const activeNews = allNews.filter(n => n.isActive);
        const publishedNews = allNews.filter(n => n.publishedAt);
        const newsWithAuthor = allNews.filter(n => n.author);

        console.log('📈 Statistiques:');
        console.log(`   News actives: ${activeNews.length}/${allNews.length}`);
        console.log(`   News publiées: ${publishedNews.length}/${allNews.length}`);
        console.log(`   News avec auteur: ${newsWithAuthor.length}/${allNews.length}`);

        // 4. News qui devraient s'afficher (isActive=true ET publishedAt!=null)
        const displayableNews = allNews.filter(n => n.isActive && n.publishedAt);
        console.log(`\n🎯 News qui devraient s'afficher: ${displayableNews.length}`);

        if (displayableNews.length === 0) {
            console.log('❌ Aucune news ne devrait s\'afficher !');
        } else {
            console.log('✅ News qui devraient s\'afficher:');
            displayableNews.forEach(n => {
                console.log(`   - ${n.title} (${n.category})`);
            });
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNews(); 