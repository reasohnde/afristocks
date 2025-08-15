// src/screens/learn/LearnTradingScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '@/components/common/GlassContainer';
import { theme } from '@/styles/theme';

interface Props {
  navigation: any;
}

export const LearnTradingScreen: React.FC<Props> = ({ navigation }) => {
  const lessons = [
    {
      id: 1,
      title: 'Bases du trading d’actions privées',
      description: 'Comprendre les ordres, carnets et exécutions',
      duration: '12 min',
      level: 'Débutant',
      icon: 'swap-vertical',
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Lecture des graphiques et chandeliers',
      description: 'Identifier tendances et retournements',
      duration: '20 min',
      level: 'Intermédiaire',
      icon: 'bar-chart',
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'Gestion des risques & money management',
      description: 'Limiter vos pertes, laisser courir vos gains',
      duration: '18 min',
      level: 'Intermédiaire',
      icon: 'shield-checkmark',
      color: '#F97316',
    },
    {
      id: 4,
      title: 'Stratégies avancées (swing, scalping)',
      description: 'Adapter votre approche au marché secondaire',
      duration: '25 min',
      level: 'Avancé',
      icon: 'flash',
      color: '#8B5CF6',
    },
  ];

  const tips = [
    {
      icon: 'checkmark-circle',
      text: 'Utilisez des stop‑loss pour chaque ordre',
    },
    {
      icon: 'checkmark-circle',
      text: 'N’investissez jamais sous effet de levier excessif',
    },
    {
      icon: 'checkmark-circle',
      text: 'Tenez un journal de trading pour analyser vos décisions',
    },
    {
      icon: 'checkmark-circle',
      text: 'Ne laissez pas les émotions guider vos positions',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cours de trading</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Apprenez à trader des actions privées comme un pro</Text>

        <Text style={styles.sectionTitle}>Leçons disponibles</Text>
        {lessons.map((lesson) => (
          <TouchableOpacity key={lesson.id /* TODO : navigate to lesson detail */}>
            <GlassContainer style={styles.lessonCard}>
              <View style={[styles.lessonIcon, { backgroundColor: `${lesson.color}20` }]}>
                <Ionicons name={lesson.icon as any} size={28} color={lesson.color} />
              </View>
              <View style={styles.lessonContent}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDescription}>{lesson.description}</Text>
                <View style={styles.lessonMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.text.tertiary} />
                    <Text style={styles.metaText}>{lesson.duration}</Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: `${lesson.color}20` }]}>
                    <Text style={[styles.levelText, { color: lesson.color }]}>{lesson.level}</Text>
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
          <Ionicons name="school" size={48} color={theme.colors.primary.orange} />
          <Text style={styles.ctaTitle}>Rejoignez notre webinaire en direct</Text>
          <Text style={styles.ctaDescription}>
            Séance de questions‑réponses avec un trader senior vendredi 19h GMT
          </Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>S’inscrire gratuitement</Text>
          </TouchableOpacity>
        </GlassContainer>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// ───────────────────────── Styles ──────────────────────────── //
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
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  lessonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  lessonContent: { flex: 1 },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  lessonMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.md },
  metaText: { fontSize: 12, color: theme.colors.text.tertiary, marginLeft: 4 },
  levelBadge: { paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: theme.borderRadius.sm },
  levelText: { fontSize: 11, fontWeight: '600' },
  tipsCard: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xl, padding: theme.spacing.lg },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  tipText: { flex: 1, fontSize: 14, color: theme.colors.text.secondary, marginLeft: theme.spacing.sm, lineHeight: 20 },
  ctaCard: { marginHorizontal: theme.spacing.lg, padding: theme.spacing.xl, alignItems: 'center' },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text.primary, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  ctaDescription: { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.lg },
  joinButton: { backgroundColor: theme.colors.primary.orange, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.md },
  joinButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});

export default LearnTradingScreen;
