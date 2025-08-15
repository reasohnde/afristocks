// src/components/InvestmentFundCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export const InvestmentFundCard = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.fundCard} activeOpacity={0.93}>
    <LinearGradient
      colors={['rgba(16,185,129,0.15)', 'rgba(251,191,36,0.15)']}
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

const styles = StyleSheet.create({
  fundCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  fundCardGradient: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  fundBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251,191,36,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    zIndex: 2,
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
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  fundInfo: { flex: 1 },
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
    marginLeft: 4,
  },
  fundProgress: { marginBottom: theme.spacing.lg },
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
    backgroundColor: 'rgba(16,185,129,0.9)',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  fundCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginRight: 8,
  },
});
