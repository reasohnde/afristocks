// src/screens/learn/FormationsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

export const FormationsScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Toutes', icon: 'apps' },
    { id: 'basics', name: 'Bases', icon: 'book' },
    { id: 'investment', name: 'Investissement', icon: 'trending-up' },
    { id: 'wealth', name: 'Patrimoine', icon: 'wallet' },
    { id: 'advanced', name: 'Avancé', icon: 'rocket' },
  ];

  const formations = [
    // Formations de base
    {
      id: '1',
      category: 'basics',
      title: 'Introduction à l\'éducation financière',
      description: 'Apprenez les bases de la gestion financière personnelle, du budget à l\'épargne.',
      duration: '2h 30min',
      level: 'Débutant',
      modules: 8,
      students: 1234,
      rating: 4.8,
      icon: '💰',
      color: theme.colors.primary.emerald,
      featured: true,
      topics: ['Budget personnel', 'Épargne', 'Dettes', 'Objectifs financiers'],
    },
    {
      id: '2',
      category: 'basics',
      title: 'Comprendre les marchés financiers africains',
      description: 'Découvrez le fonctionnement des bourses africaines et les opportunités qu\'elles offrent.',
      duration: '3h',
      level: 'Débutant',
      modules: 10,
      students: 892,
      rating: 4.6,
      icon: '📊',
      color: theme.colors.status.info,
      topics: ['BRVM', 'NSE', 'JSE', 'Indices boursiers'],
    },
    
    // Formations investissement
    {
      id: '3',
      category: 'investment',
      title: 'Stratégies d\'investissement pour débutants',
      description: 'Maîtrisez les différentes stratégies d\'investissement adaptées au contexte africain.',
      duration: '4h',
      level: 'Intermédiaire',
      modules: 12,
      students: 756,
      rating: 4.9,
      icon: '📈',
      color: theme.colors.primary.gold,
      featured: true,
      topics: ['Actions', 'Obligations', 'ETF', 'Diversification'],
    },
    {
      id: '4',
      category: 'investment',
      title: 'Investir dans les startups africaines',
      description: 'Guide complet pour identifier et investir dans les startups prometteuses.',
      duration: '3h 45min',
      level: 'Intermédiaire',
      modules: 9,
      students: 543,
      rating: 4.7,
      icon: '🚀',
      color: theme.colors.status.success,
      topics: ['Due diligence', 'Valorisation', 'Exit strategies', 'Risques'],
    },
    {
      id: '5',
      category: 'investment',
      title: 'Crypto-monnaies et blockchain en Afrique',
      description: 'Comprendre et investir dans les crypto-monnaies de manière sécurisée.',
      duration: '5h',
      level: 'Intermédiaire',
      modules: 15,
      students: 1567,
      rating: 4.5,
      icon: '₿',
      color: '#FF9500',
      topics: ['Bitcoin', 'Ethereum', 'DeFi', 'Sécurité'],
    },
    
    // Formations création de patrimoine
    {
      id: '6',
      category: 'wealth',
      title: 'Créer et préserver son patrimoine',
      description: 'Stratégies pour construire un patrimoine durable et le transmettre.',
      duration: '6h',
      level: 'Avancé',
      modules: 18,
      students: 432,
      rating: 4.9,
      icon: '🏦',
      color: theme.colors.primary.emerald,
      featured: true,
      topics: ['Immobilier', 'Assurance-vie', 'Succession', 'Fiscalité'],
    },
    {
      id: '7',
      category: 'wealth',
      title: 'L\'immobilier comme outil de richesse',
      description: 'Investir dans l\'immobilier en Afrique : opportunités et stratégies.',
      duration: '4h 30min',
      level: 'Intermédiaire',
      modules: 11,
      students: 689,
      rating: 4.8,
      icon: '🏠',
      color: '#9C27B0',
      topics: ['Achat locatif', 'REITs', 'Financement', 'Gestion locative'],
    },
    {
      id: '8',
      category: 'wealth',
      title: 'Entrepreneuriat et création de richesse',
      description: 'Comment créer et développer une entreprise rentable en Afrique.',
      duration: '8h',
      level: 'Avancé',
      modules: 20,
      students: 890,
      rating: 4.7,
      icon: '💼',
      color: theme.colors.status.warning,
      topics: ['Business plan', 'Financement', 'Croissance', 'Exit'],
    },
    
    // Formations avancées
    {
      id: '9',
      category: 'advanced',
      title: 'Trading et analyse technique',
      description: 'Maîtrisez les techniques de trading professionnel sur les marchés africains.',
      duration: '10h',
      level: 'Expert',
      modules: 25,
      students: 234,
      rating: 4.6,
      icon: '📉',
      color: theme.colors.status.error,
      topics: ['Analyse technique', 'Gestion du risque', 'Psychologie', 'Stratégies'],
    },
    {
      id: '10',
      category: 'advanced',
      title: 'Fiscalité et optimisation patrimoniale',
      description: 'Optimisez votre fiscalité légalement dans le contexte africain.',
      duration: '7h',
      level: 'Expert',
      modules: 16,
      students: 178,
      rating: 4.8,
      icon: '📋',
      color: '#607D8B',
      topics: ['Impôts', 'Optimisation', 'International', 'Structures'],
    },
  ];

  const filteredFormations = selectedCategory === 'all' 
    ? formations 
    : formations.filter(f => f.category === selectedCategory);

  const featuredFormations = formations.filter(f => f.featured);

  const renderFormationCard = ({ item }: any) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('FormationDetail', { formation: item })}
      activeOpacity={0.8}
    >
      <GlassContainer style={styles.formationCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        
        <Text style={styles.formationTitle}>{item.title}</Text>
        <Text style={styles.formationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.formationMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.metaText}>{item.modules} modules</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={theme.colors.primary.gold} />
            <Text style={styles.metaText}>{item.rating}</Text>
          </View>
        </View>
        
        <View style={styles.formationFooter}>
          <View style={styles.studentsInfo}>
            <Ionicons name="people-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.studentsText}>{item.students} étudiants</Text>
          </View>
          <TouchableOpacity style={[styles.startButton, { backgroundColor: item.color }]}>
            <Text style={styles.startButtonText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Formations financières</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Maîtrisez vos finances</Text>
          <Text style={styles.heroSubtitle}>
            Découvrez nos formations pour apprendre à investir, créer de la richesse et gérer votre patrimoine
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>50+</Text>
              <Text style={styles.heroStatLabel}>Formations</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>10k+</Text>
              <Text style={styles.heroStatLabel}>Étudiants</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>4.8</Text>
              <Text style={styles.heroStatLabel}>Note moyenne</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Formations recommandées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Formations recommandées</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {featuredFormations.map((formation) => (
              <TouchableOpacity 
                key={formation.id}
                onPress={() => navigation.navigate('FormationDetail', { formation })}
                activeOpacity={0.8}
              >
                <GlassContainer style={styles.featuredCard} variant="liquid" animated>
                  <View style={[styles.featuredIcon, { backgroundColor: `${formation.color}20` }]}>
                    <Text style={styles.featuredEmoji}>{formation.icon}</Text>
                  </View>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {formation.title}
                  </Text>
                  <View style={styles.featuredMeta}>
                    <Text style={styles.featuredDuration}>{formation.duration}</Text>
                    <View style={styles.featuredRating}>
                      <Ionicons name="star" size={12} color={theme.colors.primary.gold} />
                      <Text style={styles.featuredRatingText}>{formation.rating}</Text>
                    </View>
                  </View>
                  <LinearGradient
                    colors={[formation.color, formation.color + 'DD']}
                    style={styles.featuredButton}
                  >
                    <Text style={styles.featuredButtonText}>Découvrir</Text>
                  </LinearGradient>
                </GlassContainer>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        {/* Toutes les formations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Toutes les formations' : 
             selectedCategory === 'basics' ? 'Formations de base' :
             selectedCategory === 'investment' ? 'Formations investissement' :
             selectedCategory === 'wealth' ? 'Création de patrimoine' :
             'Formations avancées'}
          </Text>
          
          <FlatList
            data={filteredFormations}
            renderItem={renderFormationCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.formationsList}
          />
        </View>

        {/* CTA Section */}
        <GlassContainer style={styles.ctaSection}>
          <Ionicons name="school" size={48} color={theme.colors.primary.emerald} />
          <Text style={styles.ctaTitle}>Devenez formateur</Text>
          <Text style={styles.ctaDescription}>
            Partagez votre expertise financière et aidez des milliers d'Africains à atteindre la liberté financière
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>En savoir plus</Text>
          </TouchableOpacity>
        </GlassContainer>

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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  heroSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  featuredCard: {
    width: 200,
    padding: theme.spacing.lg,
  },
  featuredIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  featuredEmoji: {
    fontSize: 28,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featuredDuration: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  featuredRatingText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  featuredButton: {
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  featuredButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  formationsList: {
    paddingHorizontal: theme.spacing.lg,
  },
  formationCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  levelBadge: {
    backgroundColor: theme.colors.glass.light,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  levelText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  formationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  formationDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  formationMeta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  formationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studentsText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  ctaDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary.emerald,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});