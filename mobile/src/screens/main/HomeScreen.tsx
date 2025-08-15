// src/screens/main/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

import { InvestmentFundCard } from '../../components/InvestmentFundCard';



const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Définir le message de bienvenue selon l'heure
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simuler le rechargement des données
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Données mockées pour l'exemple
  const marketStats = {
    totalVolume: '12.5M XOF',
    activeInvestors: '2,847',
    newStartups: 12,
    avgReturn: '+15.3%'
  };

  const portfolioSummary = {
    totalValue: 1250000,
    todayChange: 25000,
    changePercent: 2.04,
    totalInvestments: 5
  };

  const trendingStartups = [
    {
      id: '1',
      name: 'AgroTech Solutions',
      sector: 'AgriTech',
      logo: '🌾',
      growth: 45.2,
      raised: '2.5M XOF',
      investors: 124,
      daysLeft: 15,
      progress: 75
    },
    {
      id: '2',
      name: 'HealthPlus Africa',
      sector: 'HealthTech',
      logo: '🏥',
      growth: 32.5,
      raised: '5M XOF',
      investors: 230,
      daysLeft: 8,
      progress: 92
    },
    {
      id: '3',
      name: 'EduTech Mali',
      sector: 'EdTech',
      logo: '📚',
      growth: 28.7,
      raised: '1.8M XOF',
      investors: 89,
      daysLeft: 21,
      progress: 60
    },
  ];

  const latestNews = [
    {
      id: '1',
      type: 'funding',
      title: 'TechFinance Rwanda lève 10M€',
      description: 'La fintech rwandaise finalise sa série A avec des investisseurs internationaux.',
      time: 'Il y a 2h',
      image: '💰',
      urgent: true,
    },
    {
      id: '2',
      type: 'market',
      title: 'Le marché AgriTech en hausse de 23%',
      description: 'Les startups agricoles connaissent une croissance record ce trimestre.',
      time: 'Il y a 5h',
      image: '📈',
      urgent: false,
    },
    {
      id: '3',
      type: 'new',
      title: 'Nouvelle startup : SolarTech Kenya',
      description: 'Une startup d\'énergie solaire ouvre ses investissements sur la plateforme.',
      time: 'Il y a 1 jour',
      image: '☀️',
      urgent: false,
    },
    {
      id: '4',
      type: 'regulation',
      title: 'Nouvelle réglementation CEMAC',
      description: 'Les autorités facilitent l\'investissement transfrontalier dans la zone.',
      time: 'Il y a 2 jours',
      image: '📋',
      urgent: false,
    },
  ];

  const opportunities = [
    {
      id: '1',
      title: 'Clôture imminente',
      description: 'FinTech Solutions ferme ses investissements dans 48h',
      type: 'urgent',
      icon: 'time-outline',
      color: theme.colors.status.error,
    },
    {
      id: '2',
      title: 'Bonus early bird',
      description: '10% de bonus pour les 50 premiers investisseurs',
      type: 'bonus',
      icon: 'gift-outline',
      color: theme.colors.primary.gold,
    },
    {
      id: '3',
      title: 'Nouvelle évaluation',
      description: 'MobilePay valorisée à 20M XOF (+40%)',
      type: 'valuation',
      icon: 'trending-up-outline',
      color: theme.colors.status.success,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.emerald}
          />
        }
      >
        {/* Header personnalisé */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user?.name || 'Investisseur'} 👋</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio rapide (seulement pour les investisseurs) */}
        {user?.role !== 'STARTUP' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Portfolio')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
              style={styles.portfolioCard}
            >
              <View style={styles.portfolioHeader}>
                <Text style={styles.portfolioLabel}>Valeur du portfolio</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
              <Text style={styles.portfolioValue}>
                {portfolioSummary.totalValue.toLocaleString()} XOF
              </Text>
              <View style={styles.portfolioChange}>
                <Ionicons
                  name={portfolioSummary.todayChange >= 0 ? "trending-up" : "trending-down"}
                  size={16}
                  color="white"
                />
                <Text style={styles.portfolioChangeText}>
                  {portfolioSummary.todayChange >= 0 ? '+' : ''}{portfolioSummary.changePercent}% aujourd'hui
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {/* Opportunités du jour */}
        <InvestmentFundCard onPress={() => navigation.navigate('InvestmentFund')} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Opportunités du jour</Text>
          </View>
          <ScrollView
          
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.opportunitiesContainer}
            
          >
            {opportunities.map((opp) => (
              <TouchableOpacity key={opp.id} activeOpacity={0.8}>
                <GlassContainer style={styles.opportunityCard} variant="liquid" animated>
                  <View style={[styles.opportunityIcon, { backgroundColor: `${opp.color}20` }]}>
                    <Ionicons name={opp.icon as any} size={24} color={opp.color} />
                  </View>
                  <Text style={styles.opportunityTitle}>{opp.title}</Text>
                  <Text style={styles.opportunityDesc} numberOfLines={2}>
                    {opp.description}
                  </Text>
                </GlassContainer>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Statistiques du marché */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Aperçu du marché</Text>
          <View style={styles.statsGrid}>
            <GlassContainer style={styles.statCard}>
              <Text style={styles.statValue}>{marketStats.totalVolume}</Text>
              <Text style={styles.statLabel}>Volume total</Text>
            </GlassContainer>
            <GlassContainer style={styles.statCard}>
              <Text style={styles.statValue}>{marketStats.activeInvestors}</Text>
              <Text style={styles.statLabel}>Investisseurs actifs</Text>
            </GlassContainer>
            <GlassContainer style={styles.statCard}>
              <Text style={styles.statValue}>{marketStats.newStartups}</Text>
              <Text style={styles.statLabel}>Nouvelles startups</Text>
            </GlassContainer>
            <GlassContainer style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.colors.status.success }]}>
                {marketStats.avgReturn}
              </Text>
              <Text style={styles.statLabel}>Rendement moyen</Text>
            </GlassContainer>
          </View>
        </View>

        {/* Actualités importantes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Actualités</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllNews')}>
              <Text style={styles.viewAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {latestNews.map((news, index) => (
            <TouchableOpacity
              key={news.id}
              onPress={() => navigation.navigate('NewsDetail', { news })}
              activeOpacity={0.8}
            >
              <GlassContainer style={[
                styles.newsCard,
                index === 0 && news.urgent ? styles.urgentNewsCard : {}
              ]}>
                {news.urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>URGENT</Text>
                  </View>
                )}
                <View style={styles.newsContent}>
                  <View style={styles.newsIcon}>
                    <Text style={styles.newsEmoji}>{news.image}</Text>
                  </View>
                  <View style={styles.newsInfo}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {news.title}
                    </Text>
                    <Text style={styles.newsDescription} numberOfLines={2}>
                      {news.description}
                    </Text>
                    <Text style={styles.newsTime}>{news.time}</Text>
                  </View>
                </View>
              </GlassContainer>
            </TouchableOpacity>
          ))}
        </View>

        {/* Startups en tendance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Levées de fonds actives</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Startups')}>
              <Text style={styles.viewAllText}>Explorer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.startupsList}
          >
            {trendingStartups.map((startup) => (
              <TouchableOpacity
                key={startup.id}
                onPress={() => navigation.navigate('StartupDetail', { startup })}
                activeOpacity={0.8}
              >
                <GlassContainer style={styles.startupCard} variant="liquid" animated>
                  <View style={styles.startupHeader}>
                    <View style={styles.startupLogo}>
                      <Text style={styles.startupEmoji}>{startup.logo}</Text>
                    </View>
                    <View style={styles.startupTimer}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                      <Text style={styles.startupDays}>{startup.daysLeft}j</Text>
                    </View>
                  </View>

                  <Text style={styles.startupName}>{startup.name}</Text>
                  <Text style={styles.startupSector}>{startup.sector}</Text>

                  <View style={styles.startupProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${startup.progress}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>{startup.progress}% levé</Text>
                  </View>

                  <View style={styles.startupStats}>
                    <View style={styles.startupStat}>
                      <Text style={styles.startupStatValue}>{startup.raised}</Text>
                      <Text style={styles.startupStatLabel}>levés</Text>
                    </View>
                    <View style={styles.startupStatDivider} />
                    <View style={styles.startupStat}>
                      <Text style={styles.startupStatValue}>{startup.investors}</Text>
                      <Text style={styles.startupStatLabel}>investisseurs</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.investButton}>
                    <LinearGradient
                      colors={[theme.colors.primary.gold, theme.colors.primary.goldDark]}
                      style={styles.investButtonGradient}
                    >
                      <Text style={styles.investButtonText}>Investir</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </GlassContainer>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Actions rapides */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Formations')}
          >
            <LinearGradient
              colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="school-outline" size={24} color="white" />
              <Text style={styles.quickActionText}>Formations financières</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <View style={[styles.quickActionGradient, styles.quickActionOutline]}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary.emerald} />
              <Text style={[styles.quickActionText, { color: theme.colors.primary.emerald }]}>
                Centre d'aide
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Padding bottom pour la tab bar */}
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
    paddingBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: theme.colors.primary.gold,
    borderRadius: 4,
  },
  portfolioCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  portfolioLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  portfolioChangeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
    fontWeight: '500',
  },
  opportunitiesContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  opportunityCard: {
    width: 160,
    padding: theme.spacing.lg,
  },
  opportunityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  opportunityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  opportunityDesc: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  newsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  urgentNewsCard: {
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
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsEmoji: {
    fontSize: 24,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  newsTime: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  startupsList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  startupCard: {
    width: 280,
    padding: theme.spacing.lg,
  },
  startupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  startupLogo: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startupEmoji: {
    fontSize: 28,
  },
  startupTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  startupDays: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  startupName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  startupSector: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  startupProgress: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.glass.medium,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.emerald,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },
  startupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  startupStat: {
    flex: 1,
    alignItems: 'center',
  },
  startupStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  startupStatLabel: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  startupStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.glass.border,
  },
  investButton: {
    width: '100%',
  },
  investButtonGradient: {
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  investButtonText: {
    color: theme.colors.background.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickActionButton: {
    flex: 1,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  quickActionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary.emerald,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;