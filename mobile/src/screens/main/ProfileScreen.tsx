// src/screens/main/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateUser } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'SUPPRIMER') {
      Alert.alert('Erreur', 'Veuillez taper SUPPRIMER pour confirmer');
      return;
    }

    try {
      await client.delete('/api/auth/account');
      Alert.alert(
        'Compte supprimé',
        'Votre compte a été supprimé avec succès.',
        [{ text: 'OK', onPress: () => logout() }]
      );
      setShowDeleteModal(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le compte');
    }
  };

  const menuSections = [
    {
      title: 'Compte',
      items: [
        {
          icon: 'person-outline',
          label: 'Informations personnelles',
          onPress: () => navigation.navigate('PersonalInfo'),
        },
        {
          icon: 'key-outline',
          label: 'Changer le mot de passe',
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Authentification à deux facteurs',
          rightComponent: (
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: theme.colors.glass.medium, true: theme.colors.primary.emerald }}
              thumbColor={twoFactorEnabled ? theme.colors.primary.emeraldLight : '#f4f3f4'}
            />
          ),
        },
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifications push',
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.glass.medium, true: theme.colors.primary.emerald }}
              thumbColor={notificationsEnabled ? theme.colors.primary.emeraldLight : '#f4f3f4'}
            />
          ),
        },
        {
          icon: 'mail-outline',
          label: 'Notifications par email',
          rightComponent: (
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: theme.colors.glass.medium, true: theme.colors.primary.emerald }}
              thumbColor={emailNotifications ? theme.colors.primary.emeraldLight : '#f4f3f4'}
            />
          ),
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Centre d\'aide',
          onPress: () => navigation.navigate('HelpCenter'),
        },
        {
          icon: 'chatbubbles-outline',
          label: 'Contacter le support',
          onPress: () => Linking.openURL('mailto:support@afristocks.com'),
        },
        {
          icon: 'bug-outline',
          label: 'Signaler un bug',
          onPress: () => navigation.navigate('ReportBug'),
        },
      ]
    },
    {
      title: 'Légal',
      items: [
        {
          icon: 'document-text-outline',
          label: 'Conditions d\'utilisation',
          onPress: () => navigation.navigate('Terms'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Politique de confidentialité',
          onPress: () => navigation.navigate('Privacy'),
        },
        {
          icon: 'information-circle-outline',
          label: 'À propos',
          onPress: () => navigation.navigate('About'),
        },
      ]
    },
    {
      title: 'Danger',
      items: [
        {
          icon: 'trash-outline',
          label: 'Supprimer mon compte',
          color: theme.colors.status.error,
          onPress: () => setShowDeleteModal(true),
        },
      ]
    },
  ];

  // Modal de suppression de compte
  const DeleteAccountModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <GlassContainer style={styles.modalContent} variant="heavy">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Supprimer le compte</Text>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={48} color={theme.colors.status.error} />
            <Text style={styles.warningTitle}>Attention ! Cette action est irréversible</Text>
            <Text style={styles.warningText}>
              La suppression de votre compte entraînera :
            </Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• La perte définitive de toutes vos données</Text>
              <Text style={styles.warningItem}>• L'annulation de tous vos investissements en cours</Text>
              <Text style={styles.warningItem}>• La suppression de votre historique de transactions</Text>
              <Text style={styles.warningItem}>• L'impossibilité de récupérer votre compte</Text>
            </View>
          </View>

          <Text style={styles.confirmText}>
            Pour confirmer, tapez <Text style={styles.confirmHighlight}>SUPPRIMER</Text> ci-dessous :
          </Text>

          <TextInput
            style={styles.confirmInput}
            value={deleteConfirmation}
            onChangeText={setDeleteConfirmation}
            placeholder="Tapez SUPPRIMER"
            placeholderTextColor={theme.colors.text.tertiary}
            autoCapitalize="characters"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation('');
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, deleteConfirmation !== 'SUPPRIMER' && styles.deleteButtonDisabled]}
              onPress={handleDeleteAccount}
              disabled={deleteConfirmation !== 'SUPPRIMER'}
            >
              <Text style={styles.deleteButtonText}>Supprimer définitivement</Text>
            </TouchableOpacity>
          </View>
        </GlassContainer>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <GlassContainer style={styles.profileCard} variant="liquid" animated>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          
          <View style={styles.roleBadge}>
            <Ionicons 
              name={user?.role === 'STARTUP' ? 'business' : 'person'} 
              size={14} 
              color={theme.colors.primary.emerald} 
            />
            <Text style={styles.userRole}>
              {user?.role === 'STARTUP' ? 'Compte Startup' : 'Compte Investisseur'}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {user?.role === 'STARTUP' ? '5' : '12'}
              </Text>
              <Text style={styles.statLabel}>
                {user?.role === 'STARTUP' ? 'Investisseurs' : 'Investissements'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Années</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
          </View>
        </GlassContainer>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <View key={index} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.color || theme.colors.text.primary} 
                  />
                  <Text style={[styles.menuText, item.color && { color: item.color }]}>
                    {item.label}
                  </Text>
                </View>
                {item.rightComponent ? (
                  item.rightComponent
                ) : (
                  <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={[theme.colors.status.error, '#DC2626']}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>AfriStocks v2.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 AfriStocks. Tous droits réservés.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountModal />
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background.primary,
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
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary.emerald}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  userRole: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.glass.border,
  },
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  logoutButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  warningContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.status.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  warningList: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.glass.light,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  warningItem: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  confirmText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  confirmHighlight: {
    color: theme.colors.status.error,
    fontWeight: '700',
  },
  confirmInput: {
    backgroundColor: theme.colors.glass.light,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.glass.light,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: theme.colors.status.error,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default ProfileScreen;