// src/screens/stubs.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

// Import des écrans réels
export { default as LearnTradingScreen } from './learn/LearnTradingScreen';
export { default as DepositScreen } from './wallet/DepositScreen';
export { default as WithdrawScreen } from './wallet/WithdrawScreen';

// Import des nouveaux écrans créés
export { FormationsScreen } from './learn/FormationsScreen';
export { FormationDetailScreen } from './learn/FormationDetailScreen';

// Composant générique pour les écrans en développement
const ComingSoonScreen = ({ title, navigation }: { title: string; navigation: any }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
    <View style={styles.content}>
      <Ionicons name="construct" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.title}>En développement</Text>
      <Text style={styles.subtitle}>Cette fonctionnalité sera bientôt disponible</Text>
    </View>
  </View>
);

// Écrans d'apprentissage
export const InvestmentGuideScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Guide d'investissement" navigation={navigation} />
);

export const FAQScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="FAQ" navigation={navigation} />
);

// Écrans news
export const AllNewsScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Actualités" navigation={navigation} />
);

export const NewsDetailScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Détail actualité" navigation={navigation} />
);

// Écrans profil
export const PersonalInfoScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Informations personnelles" navigation={navigation} />
);

export const ChangePasswordScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Changer le mot de passe" navigation={navigation} />
);

export const EditProfileScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Modifier le profil" navigation={navigation} />
);

// Écrans support
export const HelpCenterScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Centre d'aide" navigation={navigation} />
);

export const ReportBugScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Signaler un bug" navigation={navigation} />
);

// Écrans légaux
export const TermsScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Conditions d'utilisation" navigation={navigation} />
);

export const PrivacyScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="Politique de confidentialité" navigation={navigation} />
);

export const AboutScreen = ({ navigation }: any) => (
  <ComingSoonScreen title="À propos" navigation={navigation} />
);

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});