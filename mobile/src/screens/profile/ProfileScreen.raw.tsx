// src/screens/main/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          onPress: async () => {
            await logout();
            // Pas besoin de naviguer, le rendu conditionnel dans AppNavigator
            // affichera automatiquement l'écran Auth après la déconnexion
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
        </View>

        {/* Profile Card */}
        <GlassContainer style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={theme.colors.primary.emerald} />
          </View>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'STARTUP' ? 'Compte Startup' : 
             user?.role === 'ADMIN' ? 'Administrateur' : 'Compte Investisseur'}
          </Text>
          {user?.role === 'ADMIN' && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield" size={14} color={theme.colors.primary.gold} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </GlassContainer>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.text.primary} />
            <Text style={styles.menuText}>Vérification KYC</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
            <Text style={styles.menuText}>Paramètres</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color={theme.colors.text.primary} />
            <Text style={styles.menuText}>Support</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          {/* Bouton Dashboard Fonds pour les admins */}
          {user?.role === 'ADMIN' && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('FundAdminDashboard')}
            >
              <Ionicons name="bar-chart" size={24} color={theme.colors.text.primary} />
              <Text style={styles.menuText}>Dashboard Fonds</Text>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.status.error} />
            <Text style={[styles.menuText, styles.logoutText]}>Déconnexion</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  profileCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  userRole: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
    fontWeight: '600',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary.gold,
  },
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  menuText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  logoutText: {
    color: theme.colors.status.error,
  },
});

export default ProfileScreen;