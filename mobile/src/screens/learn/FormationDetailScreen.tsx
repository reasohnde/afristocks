// src/screens/learn/FormationDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: any;
}

export const FormationDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('program');
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const formation = route?.params?.formation || {
    id: '1',
    title: 'Introduction à l\'investissement',
    category: 'investment',
    description: 'Ce cours complet vous guidera à travers les fondamentaux de l\'investissement, de la compréhension des marchés financiers à la construction d\'un portfolio diversifié.',
    duration: '2h 30min',
    level: 'Débutant',
    modules: 8,
    students: 1234,
    rating: 4.8,
    instructor: 'Dr. Jean Kouamé',
    price: 0,
    image: '📈',
    color: theme.colors.primary.emerald,
  };

  const modules = [
    {
      id: '1',
      title: 'Introduction aux marchés financiers',
      duration: '15 min',
      lessons: 3,
      completed: true,
    },
    {
      id: '2',
      title: 'Types d\'investissements',
      duration: '20 min',
      lessons: 4,
      completed: true,
    },
    {
      id: '3',
      title: 'Analyse fondamentale',
      duration: '25 min',
      lessons: 5,
      completed: false,
    },
    {
      id: '4',
      title: 'Gestion des risques',
      duration: '18 min',
      lessons: 3,
      completed: false,
    },
    {
      id: '5',
      title: 'Construction d\'un portfolio',
      duration: '22 min',
      lessons: 4,
      completed: false,
    },
    {
      id: '6',
      title: 'Stratégies d\'investissement',
      duration: '20 min',
      lessons: 4,
      completed: false,
    },
    {
      id: '7',
      title: 'Fiscalité et investissement',
      duration: '15 min',
      lessons: 3,
      completed: false,
    },
    {
      id: '8',
      title: 'Projet final et certification',
      duration: '25 min',
      lessons: 2,
      completed: false,
    },
  ];

  const reviews = [
    {
      id: '1',
      name: 'Fatou Diallo',
      rating: 5,
      date: 'Il y a 2 semaines',
      comment: 'Excellent cours ! Les explications sont claires et les exemples pratiques très utiles.',
    },
    {
      id: '2',
      name: 'Amadou Sow',
      rating: 4,
      date: 'Il y a 1 mois',
      comment: 'Très bon contenu, j\'aurais aimé plus d\'exercices pratiques.',
    },
    {
      id: '3',
      name: 'Marie Kouassi',
      rating: 5,
      date: 'Il y a 2 mois',
      comment: 'Parfait pour débuter dans l\'investissement. Je recommande vivement !',
    },
  ];

  const handleEnroll = () => {
    if (formation.price > 0) {
      Alert.alert(
        'Inscription',
        `Cette formation coûte ${formation.price.toLocaleString()} XOF. Voulez-vous procéder au paiement ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Payer', 
            onPress: () => {
              // Navigation vers le paiement
              Alert.alert('Succès', 'Redirection vers le paiement...');
              setIsEnrolled(true);
            }
          }
        ]
      );
    } else {
      setIsEnrolled(true);
      Alert.alert('Succès', 'Vous êtes maintenant inscrit à cette formation !');
    }
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

        {/* Hero Section */}
        <LinearGradient
          colors={[`${formation.color}30`, `${formation.color}10`]}
          style={styles.heroSection}
        >
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>{formation.image}</Text>
          </View>
          <Text style={styles.title}>{formation.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.metaText}>{formation.instructor}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={theme.colors.primary.gold} />
              <Text style={styles.metaText}>{formation.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.metaText}>{formation.students} étudiants</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <GlassContainer style={styles.statCard}>
            <Ionicons name="time" size={20} color={theme.colors.primary.emerald} />
            <Text style={styles.statValue}>{formation.duration}</Text>
            <Text style={styles.statLabel}>Durée totale</Text>
          </GlassContainer>
          <GlassContainer style={styles.statCard}>
            <Ionicons name="book" size={20} color={theme.colors.primary.gold} />
            <Text style={styles.statValue}>{formation.modules}</Text>
            <Text style={styles.statLabel}>Modules</Text>
          </GlassContainer>
          <GlassContainer style={styles.statCard}>
            <Ionicons name="trophy" size={20} color={theme.colors.status.info} />
            <Text style={styles.statValue}>Certificat</Text>
            <Text style={styles.statLabel}>À la fin</Text>
          </GlassContainer>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'program' && styles.activeTab]}
            onPress={() => setActiveTab('program')}
          >
            <Text style={[styles.tabText, activeTab === 'program' && styles.activeTabText]}>
              Programme
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              À propos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Avis ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'program' && (
            <View>
              <Text style={styles.sectionTitle}>Contenu du cours</Text>
              {modules.map((module, index) => (
                <GlassContainer key={module.id} style={styles.moduleCard}>
                  <View style={styles.moduleHeader}>
                    <View style={styles.moduleNumber}>
                      {module.completed ? (
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.status.success} />
                      ) : (
                        <Text style={styles.moduleNumberText}>{index + 1}</Text>
                      )}
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                      <View style={styles.moduleMeta}>
                        <Text style={styles.moduleMetaText}>{module.lessons} leçons</Text>
                        <Text style={styles.moduleMetaText}>•</Text>
                        <Text style={styles.moduleMetaText}>{module.duration}</Text>
                      </View>
                    </View>
                    {isEnrolled && (
                      <TouchableOpacity>
                        <Ionicons name="play-circle" size={32} color={theme.colors.primary.emerald} />
                      </TouchableOpacity>
                    )}
                  </View>
                </GlassContainer>
              ))}
            </View>
          )}

          {activeTab === 'about' && (
            <View>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{formation.description}</Text>
              
              <Text style={styles.sectionTitle}>Ce que vous apprendrez</Text>
              <View style={styles.learningPoints}>
                <View style={styles.learningPoint}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.status.success} />
                  <Text style={styles.learningPointText}>
                    Les bases de l'investissement et des marchés financiers
                  </Text>
                </View>
                <View style={styles.learningPoint}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.status.success} />
                  <Text style={styles.learningPointText}>
                    Comment analyser et évaluer les opportunités d'investissement
                  </Text>
                </View>
                <View style={styles.learningPoint}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.status.success} />
                  <Text style={styles.learningPointText}>
                    Construire et gérer un portfolio diversifié
                  </Text>
                </View>
                <View style={styles.learningPoint}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.status.success} />
                  <Text style={styles.learningPointText}>
                    Stratégies de gestion des risques
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Prérequis</Text>
              <Text style={styles.description}>
                Aucun prérequis nécessaire. Ce cours est conçu pour les débutants complets.
              </Text>

              <Text style={styles.sectionTitle}>À propos de l'instructeur</Text>
              <GlassContainer style={styles.instructorCard}>
                <View style={styles.instructorAvatar}>
                  <Text style={styles.instructorInitials}>JK</Text>
                </View>
                <View style={styles.instructorInfo}>
                  <Text style={styles.instructorName}>{formation.instructor}</Text>
                  <Text style={styles.instructorTitle}>Expert en Finance & Investissement</Text>
                  <Text style={styles.instructorBio}>
                    15 ans d'expérience dans les marchés financiers africains. PhD en Finance de l'Université de Paris.
                  </Text>
                </View>
              </GlassContainer>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              <View style={styles.reviewsHeader}>
                <View style={styles.ratingOverview}>
                  <Text style={styles.ratingValue}>{formation.rating}</Text>
                  <View>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= Math.round(formation.rating) ? 'star' : 'star-outline'}
                          size={16}
                          color={theme.colors.primary.gold}
                        />
                      ))}
                    </View>
                    <Text style={styles.totalReviews}>{reviews.length} avis</Text>
                  </View>
                </View>
              </View>

              {reviews.map((review) => (
                <GlassContainer key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerInitials}>
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewerName}>{review.name}</Text>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                    </View>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={14}
                          color={theme.colors.primary.gold}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </GlassContainer>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <View style={styles.priceInfo}>
          {formation.price > 0 ? (
            <>
              <Text style={styles.price}>{formation.price.toLocaleString()} XOF</Text>
              <Text style={styles.priceLabel}>Prix total</Text>
            </>
          ) : (
            <>
              <Text style={styles.price}>GRATUIT</Text>
              <Text style={styles.priceLabel}>Accès illimité</Text>
            </>
          )}
        </View>
        <TouchableOpacity 
          style={styles.enrollButton}
          onPress={handleEnroll}
          disabled={isEnrolled}
        >
          <LinearGradient
            colors={isEnrolled ? [theme.colors.glass.medium, theme.colors.glass.medium] : 
                               [theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
            style={styles.enrollButtonGradient}
          >
            <Text style={styles.enrollButtonText}>
              {isEnrolled ? 'Déjà inscrit' : 'S\'inscrire maintenant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.emerald,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary.emerald,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
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
    marginBottom: theme.spacing.xl,
  },
  moduleCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  moduleNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  moduleMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  moduleMetaText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  learningPoints: {
    marginBottom: theme.spacing.xl,
  },
  learningPoint: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  learningPointText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  instructorCard: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  instructorInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  instructorTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginVertical: 4,
  },
  instructorBio: {
    fontSize: 13,
    color: theme.colors.text.tertiary,
    lineHeight: 18,
  },
  reviewsHeader: {
    marginBottom: theme.spacing.lg,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  totalReviews: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  reviewCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  reviewerInitials: {
    color: 'white',
    fontWeight: '600',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glass.border,
  },
  priceInfo: {
    marginRight: theme.spacing.lg,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  enrollButton: {
    flex: 1,
  },
  enrollButtonGradient: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default FormationDetailScreen;