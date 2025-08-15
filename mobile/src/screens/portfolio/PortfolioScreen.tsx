// src/screens/portfolio/PortfolioScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const PortfolioScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  // Données mockées
  const portfolioData = {
    totalValue: 1250000,
    totalInvested: 1000000,
    totalReturn: 250000,
    returnPercentage: 25,
    investments: [
      {
        id: '1',
        name: 'AfriStocks Capital Fund',
        amount: 500000,
        currentValue: 625000,
        return: 125000,
        returnPercentage: 25,
        type: 'fund',
      },
      {
        id: '2',
        name: 'TechFinance Rwanda',
        amount: 300000,
        currentValue: 375000,
        return: 75000,
        returnPercentage: 25,
        type: 'startup',
      },
      {
        id: '3',
        name: 'AgroTech Kenya',
        amount: 200000,
        currentValue: 250000,
        return: 50000,
        returnPercentage: 25,
        type: 'startup',
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Portfolio</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary Card */}
        <LinearGradient
          colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryLabel}>Valeur totale du portfolio</Text>
          <Text style={styles.summaryValue}>
            {portfolioData.totalValue.toLocaleString()} XOF
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatLabel}>Investi</Text>
              <Text style={styles.summaryStatValue}>
                {portfolioData.totalInvested.toLocaleString()} XOF
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatLabel}>Retour</Text>
              <Text style={styles.summaryStatValue}>
                +{portfolioData.returnPercentage}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Investments List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes investissements</Text>
          
          {portfolioData.investments.map((investment) => (
            <GlassContainer key={investment.id} style={styles.investmentCard}>
              <View style={styles.investmentHeader}>
                <View style={styles.investmentInfo}>
                  <Text style={styles.investmentName}>{investment.name}</Text>
                  <Text style={styles.investmentType}>
                    {investment.type === 'fund' ? 'Fonds d\'investissement' : 'Startup'}
                  </Text>
                </View>
                <View style={[
                  styles.returnBadge,
                  investment.returnPercentage > 0 && styles.positiveReturn
                ]}>
                  <Text style={styles.returnBadgeText}>
                    +{investment.returnPercentage}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.investmentDetails}>
                <View style={styles.investmentDetail}>
                  <Text style={styles.detailLabel}>Investi</Text>
                  <Text style={styles.detailValue}>
                    {investment.amount.toLocaleString()} XOF
                  </Text>
                </View>
                <View style={styles.investmentDetail}>
                  <Text style={styles.detailLabel}>Valeur actuelle</Text>
                  <Text style={styles.detailValue}>
                    {investment.currentValue.toLocaleString()} XOF
                  </Text>
                </View>
                <View style={styles.investmentDetail}>
                  <Text style={styles.detailLabel}>Gain</Text>
                  <Text style={[styles.detailValue, styles.gainValue]}>
                    +{investment.return.toLocaleString()} XOF
                  </Text>
                </View>
              </View>
            </GlassContainer>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Startups')}
          >
            <LinearGradient
              colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.actionButtonText}>Nouvel investissement</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginVertical: theme.spacing.sm,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  investmentCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  investmentType: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  returnBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.glass.light,
  },
  positiveReturn: {
    backgroundColor: `${theme.colors.status.success}20`,
  },
  returnBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.status.success,
  },
  investmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investmentDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  gainValue: {
    color: theme.colors.status.success,
  },
  actions: {
    paddingHorizontal: theme.spacing.lg,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default PortfolioScreen;