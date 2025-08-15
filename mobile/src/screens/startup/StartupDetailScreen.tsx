// src/screens/startup/StartupDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const StartupDetailScreen = ({ navigation, route }: any) => {
  const startup = route?.params?.startup || {
    name: 'TechFinance Rwanda',
    sector: 'FinTech',
    country: 'Rwanda',
    logo: '💳',
    description: 'TechFinance révolutionne les paiements mobiles en Afrique de l\'Est avec une solution innovante.',
    valuation: 5000000,
    sharePrice: 100,
    minInvestment: 50000,
    growth: 45.2,
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Startup Info */}
        <View style={styles.startupInfo}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>{startup.logo}</Text>
          </View>
          <Text style={styles.startupName}>{startup.name}</Text>
          <Text style={styles.startupMeta}>{startup.sector} • {startup.country}</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <GlassContainer style={styles.metricCard}>
            <Text style={styles.metricValue}>{(startup.valuation / 1000000).toFixed(1)}M XOF</Text>
            <Text style={styles.metricLabel}>Valorisation</Text>
          </GlassContainer>
          <GlassContainer style={styles.metricCard}>
            <Text style={styles.metricValue}>{startup.sharePrice} XOF</Text>
            <Text style={styles.metricLabel}>Prix/Action</Text>
          </GlassContainer>
          <GlassContainer style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: theme.colors.status.success }]}>
              +{startup.growth}%
            </Text>
            <Text style={styles.metricLabel}>Croissance</Text>
          </GlassContainer>
        </View>

        {/* Description */}
        <GlassContainer style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{startup.description}</Text>
        </GlassContainer>

        {/* Investment Section */}
        <GlassContainer style={styles.investmentCard}>
          <Text style={styles.sectionTitle}>Investir</Text>
          <View style={styles.investmentInfo}>
            <Text style={styles.investmentLabel}>Investissement minimum</Text>
            <Text style={styles.investmentValue}>{startup.minInvestment.toLocaleString()} XOF</Text>
          </View>
          <TouchableOpacity>
            <LinearGradient
              colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
              style={styles.investButton}
            >
              <Text style={styles.investButtonText}>Investir maintenant</Text>
            </LinearGradient>
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startupInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  logo: {
    fontSize: 48,
  },
  startupName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  startupMeta: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  descriptionCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  investmentCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  investmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  investmentLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  investmentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  investButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  investButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default StartupDetailScreen;