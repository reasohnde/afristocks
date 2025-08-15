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
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const StartupsScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = React.useState('');

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
    <TouchableOpacity>
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

      {/* Startups List */}
      <FlatList
        data={startups}
        renderItem={renderStartupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
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