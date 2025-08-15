// src/components/news/NewsSection.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../common/GlassContainer';
import { theme } from '../../styles/theme';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impactScore: number;
  source: string;
  publishedAt: string;
  sectors: string[];
}

const NewsSection = ({ navigation }: any) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchNews();
  }, [selectedFilter]);

  const fetchNews = async () => {
    // Simuler un appel API
    setTimeout(() => {
      setNews([
        {
          id: '1',
          title: 'Nouveau record de levée de fonds pour les startups africaines',
          summary: "Les startups africaines ont levé plus de 2 milliards de dollars au premier trimestre, marquant une croissance de 45% par rapport à l'année dernière.",
          category: 'Financement',
          sentiment: 'positive',
          impactScore: 8.5,
          source: 'TechCrunch Africa',
          publishedAt: new Date().toISOString(),
          sectors: ['FinTech', 'HealthTech']
        },
        {
          id: '2',
          title: 'La fintech nigériane Flutterwave valorisée à 3 milliards',
          summary: "Flutterwave devient la startup la plus valorisée d'Afrique après sa dernière levée de fonds Series D.",
          category: 'FinTech',
          sentiment: 'positive',
          impactScore: 9.2,
          source: 'Reuters',
          publishedAt: new Date().toISOString(),
          sectors: ['FinTech']
        },
        {
          id: '3',
          title: 'Régulation : Nouvelles directives pour les cryptomonnaies en Afrique',
          summary: "L'Union Africaine propose un cadre réglementaire harmonisé pour les actifs numériques.",
          category: 'Régulation',
          sentiment: 'neutral',
          impactScore: 7.0,
          source: 'African Business',
          publishedAt: new Date().toISOString(),
          sectors: ['FinTech', 'Crypto']
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'trending-up';
      case 'negative': return 'trending-down';
      default: return 'remove';
    }
  };

  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'fintech', label: 'FinTech' },
    { id: 'agritech', label: 'AgriTech' },
    { id: 'healthtech', label: 'HealthTech' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Actualités du marché</Text>
          <Text style={styles.subtitle}>Analysées par IA • Temps réel</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AllNews')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.newsScroll}
      >
        {news.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.newsCard}
            onPress={() => navigation.navigate('NewsDetail', { news: item })}
          >
            <GlassContainer style={styles.newsCardContent}>
              <View style={styles.newsHeader}>
                <View style={styles.newsCategoryBadge}>
                  <Text style={styles.newsCategoryText}>{item.category}</Text>
                </View>
                <View style={styles.impactScore}>
                  <Text style={styles.impactScoreText}>{item.impactScore}/10</Text>
                  <Text style={styles.impactLabel}>Impact</Text>
                </View>
              </View>

              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.newsSummary} numberOfLines={3}>
                {item.summary}
              </Text>

              <View style={styles.newsSectors}>
                {item.sectors.map((sector, index) => (
                  <View key={index} style={styles.sectorBadge}>
                    <Text style={styles.sectorText}>{sector}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.newsFooter}>
                <View style={styles.newsSource}>
                  <Text style={styles.sourceText}>{item.source}</Text>
                  <Text style={styles.dateText}>Il y a 2h</Text>
                </View>
                <View style={[
                  styles.sentimentBadge,
                  { backgroundColor: `${getSentimentColor(item.sentiment)}20` }
                ]}>
                  <Ionicons 
                    name={getSentimentIcon(item.sentiment) as any} 
                    size={16} 
                    color={getSentimentColor(item.sentiment)} 
                  />
                  <Text style={[
                    styles.sentimentText,
                    { color: getSentimentColor(item.sentiment) }
                  ]}>
                    {item.sentiment}
                  </Text>
                </View>
              </View>
            </GlassContainer>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary.orange,
    fontWeight: '600',
  },
  filtersScroll: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary.orange,
    borderColor: theme.colors.primary.orange,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  newsScroll: {
    paddingLeft: theme.spacing.lg,
  },
  newsCard: {
    width: 320,
    marginRight: theme.spacing.md,
  },
  newsCardContent: {
    padding: theme.spacing.lg,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  newsCategoryBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  newsCategoryText: {
    fontSize: 12,
    color: theme.colors.primary.orange,
    fontWeight: '600',
  },
  impactScore: {
    alignItems: 'center',
  },
  impactScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  impactLabel: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  newsSectors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  sectorBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  sectorText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    flex: 1,
  },
  sourceText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default NewsSection;