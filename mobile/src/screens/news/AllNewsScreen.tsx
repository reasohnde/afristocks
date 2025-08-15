// src/screens/news/AllNewsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useNews } from '../../hooks/useNews';
import { testBackendConnection } from '../../utils/testConnection';
import { debugNewsAPI } from '../../utils/debugNews';

const AllNewsScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { news, loading, error, refresh } = useNews();

  // Fonction de test de connexion
  const handleTestConnection = async () => {
    try {
      const result = await testBackendConnection();

      if (result.success) {
        Alert.alert(
          '✅ Connexion réussie',
          `Backend accessible\nActualités trouvées: ${result.data?.data?.length || 0}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Erreur de connexion',
          `Erreur: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Erreur',
        `Erreur lors du test: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Fonction de debug des actualités
  const handleDebugNews = async () => {
    try {
      console.log('🔍 Debug des actualités...');
      const result = await debugNewsAPI();

      if (result.success) {
        Alert.alert(
          '✅ Debug réussi',
          `Tests: ${result.basicTest ? '✅' : '❌'} Basic, ${result.authTest ? '✅' : '❌'} Auth, ${result.filterTest ? '✅' : '❌'} Filter\nActualités: ${result.data?.data?.length || 0}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Erreur debug',
          `Erreur: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Erreur debug',
        `Erreur: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: 'apps' },
    { id: 'funding', name: 'Levées', icon: 'cash' },
    { id: 'market', name: 'Marché', icon: 'trending-up' },
    { id: 'new', name: 'Nouvelles', icon: 'add-circle' },
    { id: 'regulation', name: 'Régulation', icon: 'document-text' },
  ];

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Il y a 1j';
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  // Fonction pour obtenir la catégorie
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'STARTUP_NEWS': return 'startup';
      case 'MARKET_UPDATE': return 'market';
      case 'INVESTMENT_NEWS': return 'funding';
      case 'REGULATORY_NEWS': return 'regulation';
      case 'TECH_NEWS': return 'tech';
      default: return 'other';
    }
  };

  // Filtrer les news selon la catégorie sélectionnée
  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(item => getCategoryName(item.category) === selectedCategory);

  const renderNewsItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('NewsDetail', { news: item })}
      activeOpacity={0.8}
    >
      <GlassContainer style={[
        styles.newsCard,
        item.importance === 'URGENT' && styles.urgentCard
      ]}>
        {item.importance === 'URGENT' && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}

        <View style={styles.newsContent}>
          <View style={styles.newsIcon}>
            <Text style={styles.newsEmoji}>
              {item.category === 'STARTUP_NEWS' ? '🚀' :
                item.category === 'MARKET_UPDATE' ? '📈' :
                  item.category === 'INVESTMENT_NEWS' ? '💰' :
                    item.category === 'REGULATORY_NEWS' ? '📋' :
                      item.category === 'TECH_NEWS' ? '💻' : '📰'}
            </Text>
          </View>

          <View style={styles.newsInfo}>
            <Text style={styles.newsTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.newsDescription} numberOfLines={3}>
              {item.summary || item.content?.substring(0, 120) + '...'}
            </Text>

            <View style={styles.newsMeta}>
              <Text style={styles.newsAuthor}>
                {item.author?.name || 'AfriStocks'}
              </Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.newsTime}>{formatDate(item.publishedAt)}</Text>
              {item.viewCount && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.readTime}>{item.viewCount} vues</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </GlassContainer>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actualités</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleDebugNews} style={styles.testButton}>
            <Ionicons name="bug" size={20} color={theme.colors.warning} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTestConnection} style={styles.testButton}>
            <Ionicons name="wifi" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={selectedCategory === category.id ? 'white' : theme.colors.text.tertiary}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des actualités...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur de connexion</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune actualité disponible</Text>
              <Text style={styles.emptySubtext}>Les actualités apparaîtront ici</Text>
            </View>
          }
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary.emerald,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  newsCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    position: 'relative',
  },
  urgentCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary.gold,
  },
  urgentBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.primary.gold,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.background.primary,
  },
  newsContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  newsIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsEmoji: {
    fontSize: 28,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  newsDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsAuthor: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  newsTime: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  readTime: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  metaDot: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AllNewsScreen;