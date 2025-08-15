// src/screens/main/StartupsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const StartupsScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Carte spéciale pour le fonds d'investissement
  const InvestmentFundCard = () => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('InvestmentFund')}
      style={styles.fundCard}
    >
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.15)', 'rgba(251, 191, 36, 0.15)']}
        style={styles.fundCardGradient}
      >
        {/* Badge Premium */}
        <View style={styles.fundBadge}>
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text style={styles.fundBadgeText}>Opportunité Exclusive</Text>
        </View>

        <View style={styles.fundHeader}>
          <View style={styles.fundLogo}>
            <Ionicons name="trending-up" size={32} color="#10B981" />
          </View>
          <View style={styles.fundInfo}>
            <Text style={styles.fundName}>AfriStocks Capital Fund</Text>
            <Text style={styles.fundTagline}>Notre fonds d'investissement</Text>
          </View>
        </View>

        <Text style={styles.fundDescription}>
          Investissez dans l'avenir de l'Afrique dès aujourd'hui ! Diversifiez votre portfolio avec une sélection rigoureuse d'entreprises innovantes.
        </Text>

        <View style={styles.fundStats}>
          <View style={styles.fundStat}>
            <Ionicons name="people" size={16} color="#10B981" />
            <Text style={styles.fundStatText}>127 investisseurs</Text>
          </View>
          <View style={styles.fundStat}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.fundStatText}>15-25% rendement</Text>
          </View>
          <View style={styles.fundStat}>
            <Ionicons name="time" size={16} color="#10B981" />
            <Text style={styles.fundStatText}>3-5 ans</Text>
          </View>
        </View>

        {/* Graphique de progression */}
        <View style={styles.fundProgress}>
          <View style={styles.fundProgressHeader}>
            <Text style={styles.fundProgressLabel}>Objectif: 50 000€</Text>
            <Text style={styles.fundProgressValue}>15 000€ collectés</Text>
          </View>
          <View style={styles.fundProgressBar}>
            <View style={[styles.fundProgressFill, { width: '30%' }]} />
          </View>
          <Text style={styles.fundProgressPercent}>30% de l'objectif atteint</Text>
        </View>

        <View style={styles.fundCTA}>
          <Text style={styles.fundCTAText}>Investir dans le fonds</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const startups = [
    {
      id: '1',
      name: 'TechFinance Rwanda',
      sector: 'FinTech',
      country: 'Rwanda',
      valuation: 5000000,
      sharePrice: 100,
      growth: 45.2,
      logo: '💳',
      description: 'Révolutionne les paiements mobiles en Afrique de l\'Est',
      verified: true,
    },
    {
      id: '2',
      name: 'AgroTech Kenya',
      sector: 'AgriTech',
      country: 'Kenya',
      valuation: 3500000,
      sharePrice: 75,
      growth: 32.5,
      logo: '🌾',
      description: 'Solutions innovantes pour l\'agriculture moderne',
      verified: true,
    },
    {
      id: '3',
      name: 'HealthPlus Nigeria',
      sector: 'HealthTech',
      country: 'Nigeria',
      valuation: 8000000,
      sharePrice: 150,
      growth: 65.8,
      logo: '🏥',
      description: 'Télémédecine accessible pour tous',
      verified: false,
    },
  ];

  const renderStartupCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('StartupDetail', { startup: item })}
    >
      <GlassContainer style={styles.startupCard}>
        <View style={styles.cardHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>{item.logo}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.startupName}>{item.name}</Text>
              {item.verified && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.status.success} />
              )}
            </View>
            <Text style={styles.startupLocation}>
              {item.sector} • {item.country}
            </Text>
          </View>
          <View style={styles.growthContainer}>
            <Text style={styles.growthValue}>+{item.growth}%</Text>
            <Text style={styles.growthLabel}>Croissance</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Prix/Action</Text>
            <Text style={styles.metricValue}>€{item.sharePrice}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Valorisation</Text>
            <Text style={styles.metricValue}>€{(item.valuation / 1000000).toFixed(1)}M</Text>
          </View>
        </View>
      </GlassContainer>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorer les Startups</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <GlassContainer style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une startup..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </GlassContainer>
      </View>

      {/* Carte Fonds d'Investissement */}
      <InvestmentFundCard />

      {/* Startups List */}
      <FlatList
        data={startups}
        renderItem={renderStartupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  // Styles pour la carte du fonds d'investissement
  fundCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  fundCardGradient: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  fundBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  fundBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FBBF24',
    marginLeft: 4,
  },
  fundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  fundLogo: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  fundInfo: {
    flex: 1,
  },
  fundName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  fundTagline: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
  },
  fundDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  fundStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  fundStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fundStatText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  fundProgress: {
    marginBottom: theme.spacing.lg,
  },
  fundProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  fundProgressLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  fundProgressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.status.success,
  },
  fundProgressBar: {
    height: 6,
    backgroundColor: theme.colors.glass.medium,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  fundProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.status.success,
    borderRadius: 3,
  },
  fundProgressPercent: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  fundCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  fundCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // Styles existants pour les cartes de startups
  listContent: {
    padding: theme.spacing.lg,
  },
  startupCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  logo: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  startupName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  startupLocation: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
  },
  growthContainer: {
    alignItems: 'center',
    backgroundColor: `${theme.colors.status.success}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  growthValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.status.success,
  },
  growthLabel: {
    fontSize: 10,
    color: theme.colors.status.success,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
});

export default StartupsScreen;