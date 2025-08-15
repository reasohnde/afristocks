// src/screens/learn/InvestmentGuideScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const InvestmentGuideScreen = ({ navigation }: any) => {
  const guides = [
    {
      id: 1,
      title: 'Introduction à l\'investissement',
      description: 'Les bases pour bien démarrer',
      duration: '15 min',
      level: 'Débutant',
      icon: 'school',
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Analyser une startup',
      description: 'Critères d\'évaluation essentiels',
      duration: '25 min',
      level: 'Intermédiaire',
      icon: 'analytics',
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'Diversification du portfolio',
      description: 'Réduire les risques, maximiser les gains',
      duration: '20 min',
      level: 'Avancé',
      icon: 'pie-chart',
      color: '#8B5CF6',
    },
    {
      id: 4,
      title: 'Les secteurs porteurs en Afrique',
      description: 'FinTech, AgriTech, HealthTech...',
      duration: '30 min',
      level: 'Tous niveaux',
      icon: 'globe',
      color: '#F97316',
    },
  ];

  const tips = [
    {
      icon: 'checkmark-circle',
      text: 'Ne jamais investir plus que ce que vous pouvez vous permettre de perdre',
    },
    {
      icon: 'checkmark-circle',
      text: 'Diversifiez votre portfolio entre plusieurs secteurs',
    },
    {
      icon: 'checkmark-circle',
      text: 'Faites vos propres recherches avant d\'investir',
    },
    {
      icon: 'checkmark-circle',
      text: 'Pensez à long terme, pas aux gains rapides',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guide d'investissement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Apprenez les meilleures pratiques pour investir intelligemment
        </Text>

        <Text style={styles.sectionTitle}>Guides disponibles</Text>

        {guides.map((guide) => (
          <TouchableOpacity key={guide.id}>
            <GlassContainer style={styles.guideCard}>
              <View style={[styles.guideIcon, { backgroundColor: `${guide.color}20` }]}>
                <Ionicons name={guide.icon as any} size={28} color={guide.color} />
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>{guide.title}</Text>
                <Text style={styles.guideDescription}>{guide.description}</Text>
                <View style={styles.guideMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.text.tertiary} />
                    <Text style={styles.metaText}>{guide.duration}</Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: `${guide.color}20` }]}>
                    <Text style={[styles.levelText, { color: guide.color }]}>{guide.level}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </GlassContainer>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Conseils essentiels</Text>

        <GlassContainer style={styles.tipsCard}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name={tip.icon as any} size={20} color="#10B981" />
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </GlassContainer>

        <GlassContainer style={styles.ctaCard}>
          <Ionicons name="document-text" size={48} color={theme.colors.primary.orange} />
          <Text style={styles.ctaTitle}>Téléchargez notre guide PDF</Text>
          <Text style={styles.ctaDescription}>
            Guide complet de 50 pages sur l'investissement en Afrique
          </Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Télécharger gratuitement</Text>
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
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  guideIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  guideMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  // Suite de InvestmentGuideScreen.tsx
  metaText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginLeft: 4,
  },
  levelBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tipsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  ctaCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  ctaDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default InvestmentGuideScreen;