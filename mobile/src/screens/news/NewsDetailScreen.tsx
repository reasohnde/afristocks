// src/screens/news/NewsDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const NewsDetailScreen = ({ navigation, route }: any) => {
  const news = route?.params?.news || {
    title: 'Actualité',
    description: 'Description de l\'actualité',
    content: 'Contenu détaillé de l\'actualité...',
    image: '📰',
    time: 'Il y a 2h',
    author: 'AfriStocks News',
    readTime: '5 min',
    category: 'market',
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${news.title}\n\n${news.description}\n\nLu sur AfriStocks`,
        title: news.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Contenu complet de l'article (mockup)
  const fullContent = `
${news.description}

Les marchés financiers africains connaissent une transformation sans précédent. Cette évolution est portée par plusieurs facteurs clés qui méritent notre attention.

## Contexte du marché

L'écosystème des startups africaines a connu une croissance remarquable ces dernières années. Les investissements dans les startups technologiques ont atteint des niveaux records, avec une augmentation de 45% par rapport à l'année précédente.

## Points clés à retenir

• Innovation technologique : Les startups africaines innovent dans des secteurs clés comme la FinTech, l'AgriTech et la HealthTech.

• Investissements internationaux : De plus en plus d'investisseurs internationaux s'intéressent au marché africain.

• Impact social : Ces startups ne cherchent pas seulement le profit, mais aussi à résoudre des problèmes sociaux majeurs.

## Perspectives d'avenir

L'avenir s'annonce prometteur pour l'écosystème startup africain. Avec l'amélioration de l'infrastructure technologique et l'augmentation du nombre d'investisseurs locaux, nous pouvons nous attendre à une croissance continue.

Les experts prévoient que le marché pourrait doubler de taille d'ici 2027, créant ainsi de nouvelles opportunités pour les investisseurs et les entrepreneurs.
  `;

  const relatedNews = [
    {
      id: '1',
      title: 'Impact de la FinTech sur l\'inclusion financière',
      time: 'Il y a 1 jour',
      image: '💳',
    },
    {
      id: '2',
      title: 'Top 10 des startups à suivre en 2025',
      time: 'Il y a 3 jours',
      image: '🚀',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-social" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Ionicons name="bookmark-outline" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Article Header */}
        <View style={styles.articleHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {news.category === 'funding' ? 'Levée de fonds' : 
               news.category === 'market' ? 'Marché' :
               news.category === 'new' ? 'Nouvelle' : 'Régulation'}
            </Text>
          </View>
          
          <Text style={styles.title}>{news.title}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.author}>{news.author}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.time}>{news.time}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.readTime}>{news.readTime} de lecture</Text>
          </View>
        </View>

        {/* Featured Image */}
        <View style={styles.featuredImage}>
          <Text style={styles.imageEmoji}>{news.image}</Text>
        </View>

        {/* Article Content */}
        <View style={styles.content}>
          <Text style={styles.contentText}>{fullContent}</Text>
        </View>

        {/* Call to Action */}
        <GlassContainer style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Prêt à investir ?</Text>
          <Text style={styles.ctaDescription}>
            Découvrez les opportunités d'investissement disponibles sur AfriStocks
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Startups')}>
            <LinearGradient
              colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>Explorer les startups</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </GlassContainer>

        {/* Related Articles */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Articles similaires</Text>
          {relatedNews.map((article) => (
            <TouchableOpacity key={article.id}>
              <GlassContainer style={styles.relatedCard}>
                <View style={styles.relatedIcon}>
                  <Text style={styles.relatedEmoji}>{article.image}</Text>
                </View>
                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedArticleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={styles.relatedTime}>{article.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </GlassContainer>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleHeader: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary.emerald,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    lineHeight: 36,
    marginBottom: theme.spacing.md,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  author: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  time: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
  },
  readTime: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
  },
  metaDot: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginHorizontal: 6,
  },
  featuredImage: {
    height: 200,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: {
    fontSize: 80,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  contentText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  ctaCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  ctaDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  relatedSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  relatedIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  relatedEmoji: {
    fontSize: 20,
  },
  relatedInfo: {
    flex: 1,
  },
  relatedArticleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  relatedTime: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
});

export default NewsDetailScreen;