// src/screens/about/AboutScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const AboutScreen = ({ navigation }: any) => {
  const teamMembers = [
    {
      id: '1',
      name: 'Jean-Claude Kouassi',
      role: 'CEO & Fondateur',
      image: '👨‍💼',
      bio: 'Visionnaire de la finance africaine avec 15 ans d\'expérience',
    },
    {
      id: '2',
      name: 'Aminata Diallo',
      role: 'CTO',
      image: '👩‍💻',
      bio: 'Experte en blockchain et systèmes distribués',
    },
    {
      id: '3',
      name: 'Mohamed Osman',
      role: 'CFO',
      image: '👨‍💼',
      bio: 'Ancien directeur financier chez une grande banque panafricaine',
    },
  ];

  const milestones = [
    { year: '2023', event: 'Création d\'AfriStocks', icon: 'rocket' },
    { year: '2024', event: 'Première levée de fonds réussie', icon: 'cash' },
    { year: '2024', event: '1000+ investisseurs actifs', icon: 'people' },
    { year: '2025', event: 'Expansion en Afrique de l\'Ouest', icon: 'globe' },
  ];

  const partners = [
    { name: 'TechHub Africa', type: 'Incubateur' },
    { name: 'BNP Paribas', type: 'Partenaire bancaire' },
    { name: 'Africa Finance Corporation', type: 'Investisseur' },
    { name: 'Orange Digital Ventures', type: 'Partenaire technologique' },
  ];

  const handleSocialLink = (platform: string) => {
    const links: { [key: string]: string } = {
      linkedin: 'https://linkedin.com/company/afristocks',
      twitter: 'https://twitter.com/afristocks',
      facebook: 'https://facebook.com/afristocks',
      instagram: 'https://instagram.com/afristocks',
    };
    Linking.openURL(links[platform]);
  };

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
          <Text style={styles.headerTitle}>À propos d'AfriStocks</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={[`${theme.colors.primary.emerald}20`, 'transparent']}
          style={styles.heroSection}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
              style={styles.logoGradient}
            >
              <Ionicons name="trending-up" size={48} color="white" />
            </LinearGradient>
          </View>
          
          <Text style={styles.tagline}>
            Connecter les investisseurs aux opportunités africaines
          </Text>
          
          <Text style={styles.version}>Version 2.0.0</Text>
        </LinearGradient>

        {/* Mission Section */}
        <GlassContainer style={styles.missionCard}>
          <Text style={styles.sectionTitle}>Notre Mission</Text>
          <Text style={styles.missionText}>
            AfriStocks a pour mission de démocratiser l'investissement en Afrique en connectant 
            les investisseurs du monde entier aux startups et PME africaines les plus prometteuses. 
            Nous croyons au potentiel illimité du continent et travaillons pour créer un écosystème 
            financier inclusif et transparent.
          </Text>
        </GlassContainer>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <GlassContainer style={styles.statCard}>
            <Text style={styles.statNumber}>2,500+</Text>
            <Text style={styles.statLabel}>Investisseurs</Text>
          </GlassContainer>
          <GlassContainer style={styles.statCard}>
            <Text style={styles.statNumber}>150+</Text>
            <Text style={styles.statLabel}>Startups</Text>
          </GlassContainer>
          <GlassContainer style={styles.statCard}>
            <Text style={styles.statNumber}>25M€</Text>
            <Text style={styles.statLabel}>Investis</Text>
          </GlassContainer>
        </View>

        {/* Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nos Valeurs</Text>
          <View style={styles.valuesGrid}>
            {[
              { icon: 'shield-checkmark', title: 'Transparence', desc: 'Information claire et honnête' },
              { icon: 'people', title: 'Inclusion', desc: 'Accès pour tous les investisseurs' },
              { icon: 'rocket', title: 'Innovation', desc: 'Technologies de pointe' },
              { icon: 'heart', title: 'Impact', desc: 'Développement durable de l\'Afrique' },
            ].map((value, index) => (
              <GlassContainer key={index} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Ionicons name={value.icon as any} size={32} color={theme.colors.primary.emerald} />
                </View>
                <Text style={styles.valueTitle}>{value.title}</Text>
                <Text style={styles.valueDesc}>{value.desc}</Text>
              </GlassContainer>
            ))}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre Parcours</Text>
          <View style={styles.timeline}>
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <Text style={styles.timelineYear}>{milestone.year}</Text>
                </View>
                <View style={styles.timelineDot}>
                  <View style={styles.timelineDotInner} />
                </View>
                <View style={styles.timelineRight}>
                  <View style={styles.timelineCard}>
                    <Ionicons name={milestone.icon as any} size={24} color={theme.colors.primary.emerald} />
                    <Text style={styles.timelineEvent}>{milestone.event}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre Équipe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {teamMembers.map((member) => (
              <GlassContainer key={member.id} style={styles.teamCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberEmoji}>{member.image}</Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
                <Text style={styles.memberBio}>{member.bio}</Text>
              </GlassContainer>
            ))}
          </ScrollView>
        </View>

        {/* Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nos Partenaires</Text>
          <View style={styles.partnersGrid}>
            {partners.map((partner, index) => (
              <GlassContainer key={index} style={styles.partnerCard}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerType}>{partner.type}</Text>
              </GlassContainer>
            ))}
          </View>
        </View>

        {/* Contact */}
        <GlassContainer style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contactez-nous</Text>
          
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.contactText}>contact@afristocks.com</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Ionicons name="call" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.contactText}>+225 XX XX XX XX XX</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Ionicons name="location" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.contactText}>Abidjan, Côte d'Ivoire</Text>
          </View>
          
          <View style={styles.socialLinks}>
            {['linkedin', 'twitter', 'facebook', 'instagram'].map((platform) => (
              <TouchableOpacity
                key={platform}
                style={styles.socialButton}
                onPress={() => handleSocialLink(platform)}
              >
                <Ionicons name={`logo-${platform}` as any} size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            ))}
          </View>
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
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  version: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
  },
  missionCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  missionText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary.emerald,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  valueCard: {
    width: '47%',
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  valueIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary.emerald}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  valueDesc: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  timeline: {
    marginTop: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  timelineLeft: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: theme.spacing.md,
  },
  timelineYear: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary.emerald,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.emerald,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: theme.spacing.md,
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timelineEvent: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  teamCard: {
    width: 200,
    padding: theme.spacing.lg,
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  memberEmoji: {
    fontSize: 40,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
    marginBottom: theme.spacing.sm,
  },
  memberBio: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  partnerCard: {
    width: '47%',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  partnerType: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  contactCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AboutScreen;