// src/screens/auth/AuthScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';

const AuthScreen = ({ navigation }: any) => {
  const { login } = useAuth(); // Ajout du hook useAuth
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<'investor' | 'startup' | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    sector: '',
    country: 'Côte d\'Ivoire',
    city: '',
    companyDescription: '',
    website: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
    }
  });

  const sectors = [
    { id: 'fintech', name: 'FinTech', icon: 'card' },
    { id: 'healthtech', name: 'HealthTech', icon: 'heart' },
    { id: 'energy', name: 'Énergie', icon: 'flash' },
    { id: 'ecommerce', name: 'E-commerce', icon: 'cart' },
    { id: 'edtech', name: 'EdTech', icon: 'school' },
    { id: 'logistics', name: 'Logistique', icon: 'car' },
    { id: 'agritech', name: 'AgriTech', icon: 'leaf' },
    { id: 'tech', name: 'Tech', icon: 'hardware-chip' }
  ];

  const handleAuth = async () => {
    if (!isLogin && !selectedAccountType) {
      setShowAccountTypeModal(true);
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            ...formData,
            role: selectedAccountType === 'startup' ? 'STARTUP' : 'USER'
          };

      const response = await client.post(endpoint, payload);
      
      if (response.data.token) {
        // Utiliser le contexte pour la connexion au lieu de naviguer manuellement
        await login(response.data.token, response.data.user);
        // La navigation se fera automatiquement grâce au rendu conditionnel dans AppNavigator
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  const AccountTypeModal = () => (
    <Modal
      visible={showAccountTypeModal}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <GlassContainer style={styles.modalContent} variant="liquid" animated>
          <Text style={styles.modalTitle}>Choisissez votre type de compte</Text>
          <Text style={styles.modalSubtitle}>
            Sélectionnez le type de compte qui correspond à vos besoins
          </Text>

          <TouchableOpacity
            style={styles.accountTypeCard}
            onPress={() => {
              setSelectedAccountType('investor');
              setShowAccountTypeModal(false);
            }}
          >
            <View style={styles.accountTypeIcon}>
              <Ionicons name="person" size={32} color={theme.colors.status.success} />
            </View>
            <View style={styles.accountTypeInfo}>
              <Text style={styles.accountTypeTitle}>Investisseur</Text>
              <Text style={styles.accountTypeDescription}>
                Investissez dans des startups africaines prometteuses
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountTypeCard}
            onPress={() => {
              setSelectedAccountType('startup');
              setShowAccountTypeModal(false);
            }}
          >
            <View style={[styles.accountTypeIcon, { backgroundColor: `${theme.colors.primary.emerald}20` }]}>
              <Ionicons name="business" size={32} color={theme.colors.primary.emerald} />
            </View>
            <View style={styles.accountTypeInfo}>
              <Text style={styles.accountTypeTitle}>Startup / PME</Text>
              <Text style={styles.accountTypeDescription}>
                Levez des fonds pour développer votre entreprise
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowAccountTypeModal(false)}
          >
            <Text style={styles.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
        </GlassContainer>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${theme.colors.primary.emerald}10`, 'transparent']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <GlassContainer style={styles.logo} variant="liquid" animated>
              <Ionicons name="trending-up" size={60} color={theme.colors.primary.emerald} />
            </GlassContainer>
            <Text style={styles.title}>AfriStocks</Text>
            <Text style={styles.subtitle}>
              Investissez dans l'avenir de l'Afrique
            </Text>
          </View>

          <GlassContainer style={styles.formContainer} variant="liquid" animated>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => {
                  setIsLogin(true);
                  setSelectedAccountType(null);
                }}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  Connexion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  Inscription
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && selectedAccountType && (
              <TouchableOpacity
                style={styles.selectedTypeIndicator}
                onPress={() => setShowAccountTypeModal(true)}
              >
                <Ionicons 
                  name={selectedAccountType === 'investor' ? 'person' : 'business'} 
                  size={20} 
                  color={theme.colors.primary.emerald} 
                />
                <Text style={styles.selectedTypeText}>
                  {selectedAccountType === 'investor' ? 'Compte Investisseur' : 'Compte Startup/PME'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.primary.emerald} />
              </TouchableOpacity>
            )}

            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={selectedAccountType === 'startup' ? "Nom de l'entreprise" : "Nom complet"}
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Téléphone"
                    placeholderTextColor={theme.colors.text.tertiary}
                    keyboardType="phone-pad"
                    value={formData.phoneNumber}
                    onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  />
                </View>

                {selectedAccountType === 'startup' && (
                  <>
                    <Text style={styles.sectionTitle}>Secteur d'activité</Text>
                    <View style={styles.sectorGrid}>
                      {sectors.map(sector => (
                        <TouchableOpacity
                          key={sector.id}
                          style={[
                            styles.sectorButton,
                            formData.sector === sector.id && styles.sectorButtonActive
                          ]}
                          onPress={() => setFormData({ ...formData, sector: sector.id })}
                        >
                          <Ionicons 
                            name={sector.icon as any} 
                            size={24} 
                            color={formData.sector === sector.id ? '#FFF' : theme.colors.text.tertiary} 
                          />
                          <Text style={[
                            styles.sectorButtonText,
                            formData.sector === sector.id && styles.sectorButtonTextActive
                          ]}>
                            {sector.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.inputContainer}>
                      <Ionicons name="location-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ville"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={formData.city}
                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Ionicons name="document-text-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Description de l'entreprise"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={formData.companyDescription}
                        onChangeText={(text) => setFormData({ ...formData, companyDescription: text })}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Ionicons name="globe-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Site web (optionnel)"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={formData.website}
                        onChangeText={(text) => setFormData({ ...formData, website: text })}
                        keyboardType="url"
                        autoCapitalize="none"
                      />
                    </View>

                    <Text style={styles.sectionTitle}>Réseaux sociaux (optionnel)</Text>
                    
                    <View style={styles.inputContainer}>
                      <Ionicons name="logo-linkedin" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="LinkedIn"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={formData.socialMedia.linkedin}
                        onChangeText={(text) => setFormData({ 
                          ...formData, 
                          socialMedia: { ...formData.socialMedia, linkedin: text }
                        })}
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Ionicons name="logo-twitter" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Twitter"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={formData.socialMedia.twitter}
                        onChangeText={(text) => setFormData({ 
                          ...formData, 
                          socialMedia: { ...formData.socialMedia, twitter: text }
                        })}
                        autoCapitalize="none"
                      />
                    </View>
                  </>
                )}
              </>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
                style={styles.submitButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Se connecter' : 'S\'inscrire'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}
          </GlassContainer>
        </ScrollView>
      </KeyboardAvoidingView>

      <AccountTypeModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  formContainer: {
    padding: theme.spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary.emerald,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
  },
  activeTabText: {
    color: 'white',
  },
  selectedTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.primary.emerald}20`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  selectedTypeText: {
    color: theme.colors.primary.emerald,
    marginHorizontal: theme.spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  sectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: theme.spacing.md,
  },
  sectorButton: {
    width: '23%',
    margin: '1%',
    aspectRatio: 1,
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  sectorButtonActive: {
    backgroundColor: theme.colors.primary.emerald,
    borderColor: theme.colors.primary.emerald,
  },
  sectorButtonText: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  sectorButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  submitButtonGradient: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  accountTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  accountTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.status.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  accountTypeInfo: {
    flex: 1,
  },
  accountTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  accountTypeDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  modalCancelButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  modalCancelText: {
    fontSize: 16,
    color: theme.colors.text.tertiary,
  },
});

export default AuthScreen;