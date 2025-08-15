// src/screens/support/HelpCenterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const HelpCenterScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Pour commencer',
      icon: 'rocket',
      color: theme.colors.primary.emerald,
      articles: [
        { id: '1-1', title: 'Comment créer un compte ?', views: 1234 },
        { id: '1-2', title: 'Vérification d\'identité (KYC)', views: 987 },
        { id: '1-3', title: 'Comprendre les types de comptes', views: 765 },
        { id: '1-4', title: 'Premier investissement : guide pas à pas', views: 543 },
      ]
    },
    {
      id: 'investments',
      title: 'Investissements',
      icon: 'trending-up',
      color: theme.colors.primary.gold,
      articles: [
        { id: '2-1', title: 'Comment investir dans une startup ?', views: 2345 },
        { id: '2-2', title: 'Comprendre les risques', views: 1876 },
        { id: '2-3', title: 'Diversifier son portfolio', views: 1234 },
        { id: '2-4', title: 'Suivre ses investissements', views: 987 },
      ]
    },
    {
      id: 'payments',
      title: 'Paiements et retraits',
      icon: 'wallet',
      color: theme.colors.status.info,
      articles: [
        { id: '3-1', title: 'Méthodes de paiement acceptées', views: 3456 },
        { id: '3-2', title: 'Comment effectuer un dépôt ?', views: 2987 },
        { id: '3-3', title: 'Retirer ses gains', views: 2345 },
        { id: '3-4', title: 'Frais et commissions', views: 1876 },
      ]
    },
    {
      id: 'security',
      title: 'Sécurité et confidentialité',
      icon: 'shield-checkmark',
      color: theme.colors.status.success,
      articles: [
        { id: '4-1', title: 'Sécuriser son compte', views: 4567 },
        { id: '4-2', title: 'Authentification à deux facteurs', views: 3876 },
        { id: '4-3', title: 'Protection des données', views: 3234 },
        { id: '4-4', title: 'Que faire en cas de compte compromis ?', views: 2765 },
      ]
    },
    {
      id: 'startups',
      title: 'Pour les startups',
      icon: 'business',
      color: theme.colors.primary.emerald,
      articles: [
        { id: '5-1', title: 'Inscrire sa startup', views: 876 },
        { id: '5-2', title: 'Préparer sa levée de fonds', views: 765 },
        { id: '5-3', title: 'Documents requis', views: 654 },
        { id: '5-4', title: 'Communiquer avec les investisseurs', views: 543 },
      ]
    },
  ];

  const popularQuestions = [
    {
      id: 'q1',
      question: 'Quel est le montant minimum d\'investissement ?',
      answer: 'Le montant minimum varie selon les startups, généralement entre 50€ et 500€.',
    },
    {
      id: 'q2',
      question: 'Mes investissements sont-ils garantis ?',
      answer: 'Non, investir dans des startups comporte des risques. Vous pouvez perdre tout ou partie de votre capital.',
    },
    {
      id: 'q3',
      question: 'Combien de temps dure un investissement ?',
      answer: 'Les investissements sont généralement bloqués pour 3 à 5 ans, selon les conditions de chaque startup.',
    },
    {
      id: 'q4',
      question: 'Comment puis-je suivre mes investissements ?',
      answer: 'Vous pouvez suivre tous vos investissements dans votre portfolio, avec des mises à jour régulières.',
    },
  ];

  const contactOptions = [
    {
      id: 'chat',
      title: 'Chat en direct',
      description: 'Obtenez une réponse instantanée',
      icon: 'chatbubbles',
      available: true,
      action: () => navigation.navigate('LiveChat'),
    },
    {
      id: 'email',
      title: 'Email',
      description: 'Réponse sous 24h',
      icon: 'mail',
      available: true,
      action: () => Linking.openURL('mailto:support@afristocks.com'),
    },
    {
      id: 'phone',
      title: 'Téléphone',
      description: 'Lun-Ven 9h-18h',
      icon: 'call',
      available: true,
      action: () => Linking.openURL('tel:+22500000000'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Support instantané',
      icon: 'logo-whatsapp',
      available: true,
      action: () => Linking.openURL('https://wa.me/22500000000'),
    },
  ];

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => article.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Centre d'aide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={[`${theme.colors.primary.emerald}20`, 'transparent']}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Comment pouvons-nous vous aider ?</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher dans l'aide..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        {/* Quick Links */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickLinks}
        >
          {[
            { icon: 'flash', label: 'Guide rapide' },
            { icon: 'videocam', label: 'Tutoriels vidéo' },
            { icon: 'document-text', label: 'Documentation' },
            { icon: 'chatbubbles', label: 'FAQ' },
          ].map((link, index) => (
            <TouchableOpacity key={index} style={styles.quickLinkCard}>
              <View style={styles.quickLinkIcon}>
                <Ionicons name={link.icon as any} size={24} color={theme.colors.primary.emerald} />
              </View>
              <Text style={styles.quickLinkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions populaires</Text>
          {popularQuestions.map((q) => (
            <GlassContainer key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Ionicons name="help-circle" size={20} color={theme.colors.primary.gold} />
                <Text style={styles.questionText}>{q.question}</Text>
              </View>
              <Text style={styles.answerText}>{q.answer}</Text>
            </GlassContainer>
          ))}
        </View>

        {/* Help Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parcourir par catégorie</Text>
          {filteredCategories.map((category) => (
            <View key={category.id}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setExpandedCategory(
                  expandedCategory === category.id ? null : category.id
                )}
              >
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                  </View>
                  <View style={styles.categoryTitleContainer}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryCount}>{category.articles.length} articles</Text>
                  </View>
                </View>
                <Ionicons
                  name={expandedCategory === category.id ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={theme.colors.text.tertiary}
                />
              </TouchableOpacity>

              {expandedCategory === category.id && (
                <View style={styles.articlesList}>
                  {category.articles.map((article) => (
                    <TouchableOpacity key={article.id} style={styles.articleItem}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <View style={styles.articleMeta}>
                        <Ionicons name="eye" size={14} color={theme.colors.text.tertiary} />
                        <Text style={styles.articleViews}>{article.views} vues</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Besoin d'aide supplémentaire ?</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${theme.colors.primary.emerald}20` }]}>
                  <Ionicons name={option.icon as any} size={32} color={theme.colors.primary.emerald} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
                {option.available && (
                  <View style={styles.availableBadge}>
                    <View style={styles.availableDot} />
                    <Text style={styles.availableText}>Disponible</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Support */}
        <GlassContainer style={styles.emergencyCard}>
          <Ionicons name="warning" size={32} color={theme.colors.status.warning} />
          <Text style={styles.emergencyTitle}>Support d'urgence</Text>
          <Text style={styles.emergencyText}>
            Pour les problèmes urgents liés à la sécurité ou aux transactions, contactez-nous immédiatement.
          </Text>
          <TouchableOpacity style={styles.emergencyButton}>
            <LinearGradient
              colors={[theme.colors.status.error, '#DC2626']}
              style={styles.emergencyButtonGradient}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Appel d'urgence</Text>
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
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  quickLinks: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickLinkCard: {
    alignItems: 'center',
    width: 90,
  },
  quickLinkIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickLinkText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
  questionCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  answerText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  categoryCount: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  articlesList: {
    paddingLeft: theme.spacing.lg + 48 + theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  articleItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
  },
  articleTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleViews: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  contactCard: {
    width: '47%',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  contactIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.status.success,
  },
  availableText: {
    fontSize: 12,
    color: theme.colors.status.success,
  },
  emergencyCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.status.warning}30`,
    backgroundColor: `${theme.colors.status.warning}10`,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emergencyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emergencyButton: {
    width: '100%',
  },
  emergencyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default HelpCenterScreen;