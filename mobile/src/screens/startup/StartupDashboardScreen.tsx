import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

interface Document {
  id: string;
  name: string;
  uri: string;
  uploadDate: Date;
}

const StartupDashboardScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEmissionModal, setShowEmissionModal] = useState(false);
  const [currentUploadCategory, setCurrentUploadCategory] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [profileCompletion, setProfileCompletion] = useState(65);
  const [shareData, setShareData] = useState({
    totalShares: '',
    pricePerShare: '',
    minInvestment: '',
    maxInvestment: '',
    description: ''
  });
  
  const [documents, setDocuments] = useState<{
    administrative: Document[];
    financial: Document[];
    activity: Document[];
    other: Document[];
  }>({
    administrative: [],
    financial: [],
    activity: [],
    other: []
  });

  const stats = {
    raised: 750000,
    target: 1000000,
    investors: 247,
    sharesAvailable: 2500,
    growth: 23.5,
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'bar-chart' },
    { id: 'documents', label: 'Documents', icon: 'document-text' },
    { id: 'emissions', label: 'Émissions d\'actions', icon: 'cash' },
    { id: 'investors', label: 'Investisseurs', icon: 'people' },
  ];

  useEffect(() => {
    loadUserData();
    loadDocuments();
  }, []);

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const loadDocuments = async () => {
    // Charger les documents depuis AsyncStorage
    const savedDocs = await AsyncStorage.getItem('startup_documents');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadUserData();
    loadDocuments();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleDocumentUpload = async () => {
    try {
      // Version temporaire sans expo-document-picker
      Alert.alert(
        'Upload de document',
        'La fonctionnalité d\'upload sera disponible après installation d\'expo-document-picker',
        [
          {
            text: 'OK',
            onPress: () => {
              // Simuler un upload pour test
              const newDoc: Document = {
                id: Date.now().toString(),
                name: 'Document test.pdf',
                uri: 'file://test',
                uploadDate: new Date(),
              };
              
              // Simuler le progrès d'upload
              setUploadProgress({ [newDoc.id]: 0 });
              
              const interval = setInterval(() => {
                setUploadProgress(prev => {
                  const progress = (prev[newDoc.id] || 0) + 10;
                  if (progress >= 100) {
                    clearInterval(interval);
                    // Ajouter le document à la catégorie
                    if (currentUploadCategory) {
                      setDocuments(prev => {
                        const updated = {
                          ...prev,
                          [currentUploadCategory]: [...prev[currentUploadCategory as keyof typeof prev], newDoc]
                        };
                        // Sauvegarder dans AsyncStorage
                        AsyncStorage.setItem('startup_documents', JSON.stringify(updated));
                        return updated;
                      });
                    }
                    setShowUploadModal(false);
                    Alert.alert('Succès', 'Document uploadé avec succès (simulation)');
                    return { ...prev, [newDoc.id]: 100 };
                  }
                  return { ...prev, [newDoc.id]: progress };
                });
              }, 200);
            }
          }
        ]
      );
      
      /* Code original avec DocumentPicker - à décommenter après installation
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        const newDoc: Document = {
          id: Date.now().toString(),
          name: result.name,
          uri: result.uri,
          uploadDate: new Date(),
        };
        
        // ... reste du code
      }
      */
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'uploader le document');
    }
  };

  const handleShareEmission = () => {
    if (!shareData.totalShares || !shareData.pricePerShare || !shareData.minInvestment) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    Alert.alert(
      'Confirmation',
      'Voulez-vous soumettre cette émission d\'actions pour validation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: () => {
            setShowEmissionModal(false);
            Alert.alert('Succès', 'Votre émission d\'actions a été soumise pour validation');
            // Reset form
            setShareData({
              totalShares: '',
              pricePerShare: '',
              minInvestment: '',
              maxInvestment: '',
              description: ''
            });
          }
        }
      ]
    );
  };

  // Section Actualités
  const NewsSection = () => (
    <View style={styles.newsSection}>
      <Text style={styles.sectionTitle}>Actualités récentes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          {
            id: 1,
            title: 'Nouvel investisseur',
            description: 'Jean Dupont a investi 50,000 XOF',
            time: 'Il y a 2h',
            icon: 'person-add',
            color: theme.colors.status.success,
          },
          {
            id: 2,
            title: 'Document validé',
            description: 'Votre business plan a été approuvé',
            time: 'Il y a 5h',
            icon: 'checkmark-circle',
            color: theme.colors.status.info,
          },
          {
            id: 3,
            title: 'Nouvelle évaluation',
            description: 'Vous avez reçu une note de 4.8/5',
            time: 'Il y a 1 jour',
            icon: 'star',
            color: theme.colors.primary.gold,
          },
        ].map((news) => (
          <GlassContainer key={news.id} style={styles.newsCard} variant="liquid" animated>
            <View style={[styles.newsIcon, { backgroundColor: news.color + '20' }]}>
              <Ionicons name={news.icon as any} size={24} color={news.color} />
            </View>
            <Text style={styles.newsTitle}>{news.title}</Text>
            <Text style={styles.newsDescription}>{news.description}</Text>
            <Text style={styles.newsTime}>{news.time}</Text>
          </GlassContainer>
        ))}
      </ScrollView>
    </View>
  );

  // Header amélioré
  const HeaderSection = () => (
    <GlassContainer style={styles.companyCard} variant="liquid" animated>
      <View style={styles.companyHeader}>
        <TouchableOpacity style={styles.companyLogoContainer}>
          <View style={styles.companyLogo}>
            <Ionicons name="business" size={32} color={theme.colors.primary.emerald} />
          </View>
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{user?.name || 'Ma Startup'}</Text>
          <Text style={styles.companySector}>
            {user?.sector || 'FinTech'} • {user?.country || 'Côte d\'Ivoire'} • {user?.city || 'Abidjan'}
          </Text>
          
          <View style={styles.badges}>
            <View style={[styles.badge, styles.badgeVerified]}>
              <Ionicons name="shield-checkmark" size={14} color={theme.colors.status.success} />
              <Text style={styles.badgeText}>Profil vérifié</Text>
            </View>
            <View style={[styles.badge, styles.badgeDocuments]}>
              <Ionicons name="document-text" size={14} color={theme.colors.status.warning} />
              <Text style={styles.badgeText}>Documents 80%</Text>
            </View>
            <View style={[styles.badge, styles.badgeEligible]}>
              <Ionicons name="trophy" size={14} color={theme.colors.primary.gold} />
              <Text style={styles.badgeText}>Éligible</Text>
            </View>
            <View style={[styles.badge, styles.badgeOnline]}>
              <Ionicons name="globe" size={14} color={theme.colors.primary.emerald} />
              <Text style={styles.badgeText}>En ligne</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => Alert.alert('Aperçu', 'Aperçu public de votre profil')}
          >
            <Ionicons name="eye-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Profil complété</Text>
          <Text style={styles.progressPercentage}>{profileCompletion}%</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
            style={[styles.progressFill, { width: `${profileCompletion}%` }]}
          />
        </View>
      </View>
    </GlassContainer>
  );

  // Actions rapides
  const QuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowUploadModal(true)}
        >
          <LinearGradient
            colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="cloud-upload" size={32} color="white" />
            <Text style={styles.quickActionText}>Uploader document</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowEmissionModal(true)}
        >
          <LinearGradient
            colors={[theme.colors.primary.gold, theme.colors.primary.goldDark]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="trending-up" size={32} color="white" />
            <Text style={styles.quickActionText}>Émettre des actions</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Inviter', 'Fonction d\'invitation en cours de développement')}
        >
          <View style={[styles.quickActionGradient, styles.quickActionOutline]}>
            <Ionicons name="people" size={32} color={theme.colors.primary.emerald} />
            <Text style={[styles.quickActionText, { color: theme.colors.primary.emerald }]}>
              Inviter investisseurs
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Rapport', 'Génération de rapport en cours')}
        >
          <View style={[styles.quickActionGradient, styles.quickActionOutline]}>
            <Ionicons name="document-text" size={32} color={theme.colors.primary.emerald} />
            <Text style={[styles.quickActionText, { color: theme.colors.primary.emerald }]}>
              Générer rapport
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Modal Upload
  const UploadModal = () => (
    <Modal
      visible={showUploadModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowUploadModal(false)}
    >
      <View style={styles.modalOverlay}>
        <GlassContainer style={styles.modalContent} variant="heavy">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Uploader un document</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.uploadArea} onPress={handleDocumentUpload}>
            <Ionicons name="cloud-upload" size={48} color={theme.colors.text.tertiary} />
            <Text style={styles.uploadText}>Glissez-déposez vos fichiers ici</Text>
            <Text style={styles.uploadSubtext}>ou</Text>
            <View style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Parcourir les fichiers</Text>
            </View>
            <Text style={styles.uploadFormats}>PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</Text>
          </TouchableOpacity>
          
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <View key={id} style={styles.uploadProgressContainer}>
              <Text style={styles.uploadProgressText}>Upload en cours... {progress}%</Text>
              <View style={styles.uploadProgressBar}>
                <View style={[styles.uploadProgressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          ))}
        </GlassContainer>
      </View>
    </Modal>
  );

  // Modal Émission d'actions
  const EmissionModal = () => (
    <Modal
      visible={showEmissionModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEmissionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <GlassContainer style={styles.modalContent} variant="heavy">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle émission d'actions</Text>
              <TouchableOpacity onPress={() => setShowEmissionModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre total d'actions *</Text>
                <TextInput
                  style={styles.formInput}
                  value={shareData.totalShares}
                  onChangeText={(text) => setShareData({...shareData, totalShares: text})}
                  placeholder="Ex: 10000"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Prix par action (XOF) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={shareData.pricePerShare}
                  onChangeText={(text) => setShareData({...shareData, pricePerShare: text})}
                  placeholder="Ex: 1000"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Investissement minimum (XOF) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={shareData.minInvestment}
                  onChangeText={(text) => setShareData({...shareData, minInvestment: text})}
                  placeholder="Ex: 50000"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Investissement maximum (XOF)</Text>
                <TextInput
                  style={styles.formInput}
                  value={shareData.maxInvestment}
                  onChangeText={(text) => setShareData({...shareData, maxInvestment: text})}
                  placeholder="Ex: 5000000"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description de l'offre</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  value={shareData.description}
                  onChangeText={(text) => setShareData({...shareData, description: text})}
                  placeholder="Décrivez votre offre d'actions..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <TouchableOpacity style={styles.submitButton} onPress={handleShareEmission}>
                <LinearGradient
                  colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>Soumettre pour validation</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <Text style={styles.formNote}>
                * Les actions seront publiées après validation par l'administrateur
              </Text>
            </View>
          </GlassContainer>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard Startup</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Company Info avec badges */}
        <HeaderSection />

        {/* Stats rapides */}
        <View style={styles.statsGrid}>
          <GlassContainer style={styles.statCard} variant="liquid" animated>
            <Ionicons name="people" size={24} color={theme.colors.status.success} />
            <Text style={styles.statNumber}>{stats.investors}</Text>
            <Text style={styles.statLabel}>Investisseurs intéressés</Text>
            <Text style={styles.statChange}>+12% ce mois</Text>
          </GlassContainer>

          <GlassContainer style={styles.statCard} variant="liquid" animated>
            <Ionicons name="cash" size={24} color={theme.colors.primary.gold} />
            <Text style={styles.statNumber}>{stats.raised.toLocaleString()} XOF</Text>
            <Text style={styles.statLabel}>Sur {stats.target.toLocaleString()} XOF</Text>
            <Text style={styles.statChange}>75% atteint</Text>
          </GlassContainer>
        </View>

        {/* Actualités */}
        <NewsSection />

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? theme.colors.primary.emerald : theme.colors.text.tertiary}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Contenu des tabs */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <QuickActions />
            
            {/* Graphique */}
            <GlassContainer style={styles.chartCard}>
              <Text style={styles.chartTitle}>Évolution de la levée de fonds</Text>
              <LineChart
                data={{
                  labels: ['J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Auj'],
                  datasets: [{ 
                    data: [200000, 350000, 450000, 500000, 650000, 750000],
                    color: () => theme.colors.primary.emerald,
                  }],
                }}
                width={screenWidth - theme.spacing.lg * 2 - theme.spacing.lg}
                height={220}
                chartConfig={{
                  backgroundGradientFrom: theme.colors.background.primary,
                  backgroundGradientTo: theme.colors.background.secondary,
                  decimalPlaces: 0,
                  color: () => theme.colors.primary.emerald,
                  labelColor: () => theme.colors.text.secondary,
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: theme.colors.primary.emerald
                  },
                }}
                bezier
                style={{ borderRadius: theme.borderRadius.md }}
              />
            </GlassContainer>

            {/* Conseil du jour */}
            <GlassContainer style={styles.tipCard} variant="liquid" animated>
              <View style={styles.tipHeader}>
                <Ionicons name="sparkles" size={20} color={theme.colors.primary.gold} />
                <Text style={styles.tipTitle}>Conseil du jour</Text>
              </View>
              <Text style={styles.tipText}>
                Complétez votre pitch deck pour augmenter vos chances de 40% d'attirer des investisseurs qualifiés.
              </Text>
              <TouchableOpacity style={styles.tipButton}>
                <Text style={styles.tipButtonText}>En savoir plus</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary.gold} />
              </TouchableOpacity>
            </GlassContainer>
          </View>
        )}

        {activeTab === 'documents' && (
          <View style={styles.tabContent}>
            {[
              {
                id: 'administrative',
                title: 'Documents administratifs',
                icon: 'shield-checkmark',
                color: theme.colors.primary.emerald,
                required: ['Registre de commerce', 'Statuts', 'Pièce d\'identité', 'Numéro fiscal'],
                documents: documents.administrative,
              },
              {
                id: 'financial',
                title: 'Documents financiers',
                icon: 'cash',
                color: theme.colors.primary.gold,
                required: ['Bilans (3 ans)', 'Comptes de résultats', 'Prévisions financières'],
                documents: documents.financial,
              },
              {
                id: 'activity',
                title: 'Documents d\'activité',
                icon: 'analytics',
                color: theme.colors.status.info,
                required: ['Pitch deck', 'Business plan', 'Rapport d\'activité'],
                documents: documents.activity,
              },
              {
                id: 'other',
                title: 'Autres justificatifs',
                icon: 'document-text',
                color: theme.colors.status.warning,
                required: ['Cap table', 'Contrats clés', 'Lettre d\'intention'],
                documents: documents.other,
              },
            ].map((category) => (
              <GlassContainer key={category.id} style={styles.documentCategory}>
                <View style={styles.documentCategoryHeader}>
                  <View style={styles.documentCategoryInfo}>
                    <View style={[styles.documentIcon, { backgroundColor: category.color + '20' }]}>
                      <Ionicons name={category.icon as any} size={20} color={category.color} />
                    </View>
                    <Text style={styles.documentCategoryTitle}>{category.title}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addDocumentButton}
                    onPress={() => {
                      setCurrentUploadCategory(category.id);
                      setShowUploadModal(true);
                    }}
                  >
                    <Ionicons name="add" size={20} color={theme.colors.text.primary} />
                    <Text style={styles.addDocumentText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.documentsList}>
                  {category.required.map((doc, index) => {
                    const isUploaded = category.documents.some(d => d.name === doc);
                    return (
                      <View
                        key={index}
                        style={[styles.documentItem, isUploaded && styles.documentItemUploaded]}
                      >
                        <View style={styles.documentItemInfo}>
                          {isUploaded ? (
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.status.success} />
                          ) : (
                            <Ionicons name="alert-circle" size={20} color={theme.colors.text.tertiary} />
                          )}
                          <Text style={[styles.documentName, isUploaded && styles.documentNameUploaded]}>
                            {doc}
                          </Text>
                        </View>
                        {isUploaded && (
                          <TouchableOpacity>
                            <Ionicons name="download" size={20} color={theme.colors.primary.emerald} />
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </GlassContainer>
            ))}
          </View>
        )}

        {activeTab === 'emissions' && (
          <View style={styles.tabContent}>
            <TouchableOpacity 
              style={styles.newEmissionButton}
              onPress={() => setShowEmissionModal(true)}
            >
              <LinearGradient
                colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
                style={styles.newEmissionGradient}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.newEmissionText}>Nouvelle émission d'actions</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <GlassContainer style={styles.emissionCard}>
              <View style={styles.emissionHeader}>
                <Text style={styles.emissionTitle}>Série A - 2024</Text>
                <View style={styles.emissionBadge}>
                  <Text style={styles.emissionBadgeText}>Active</Text>
                </View>
              </View>
              <Text style={styles.emissionInfo}>10,000 actions à 1,000 XOF</Text>
              <View style={styles.emissionProgress}>
                <View style={styles.emissionProgressBar}>
                  <View style={[styles.emissionProgressFill, { width: '75%' }]} />
                </View>
                <View style={styles.emissionStats}>
                  <Text style={styles.emissionStat}>Vendues: 7,500</Text>
                  <Text style={styles.emissionPercent}>75%</Text>
                </View>
              </View>
            </GlassContainer>
          </View>
        )}

        {activeTab === 'investors' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Liste des investisseurs</Text>
            {[1, 2, 3, 4, 5].map((i) => (
              <GlassContainer key={i} style={styles.investorCard}>
                <View style={styles.investorAvatar}>
                  <Text style={styles.investorInitials}>JD</Text>
                </View>
                <View style={styles.investorInfo}>
                  <Text style={styles.investorName}>John Doe</Text>
                  <Text style={styles.investorDate}>Investi le 15 Nov 2024</Text>
                </View>
                <View style={styles.investorAmount}>
                  <Text style={styles.investorAmountValue}>250,000 XOF</Text>
                  <Text style={styles.investorShares}>250 actions</Text>
                </View>
              </GlassContainer>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <UploadModal />
      <EmissionModal />
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  companyLogoContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary.emerald}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  companySector: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  badgeVerified: {
    backgroundColor: `${theme.colors.status.success}20`,
  },
  badgeDocuments: {
    backgroundColor: `${theme.colors.status.warning}20`,
  },
  badgeEligible: {
    backgroundColor: `${theme.colors.primary.gold}20`,
  },
  badgeOnline: {
    backgroundColor: `${theme.colors.primary.emerald}20`,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    backgroundColor: theme.colors.primary.emerald,
  },
  progressSection: {
    marginTop: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary.emerald,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.glass.medium,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
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
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  statChange: {
    fontSize: 10,
    color: theme.colors.primary.emerald,
    fontWeight: '600',
    marginTop: 4,
  },
  newsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  newsCard: {
    width: 200,
    padding: theme.spacing.lg,
    marginLeft: theme.spacing.lg,
    marginRight: theme.spacing.sm,
  },
  newsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  newsTime: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
  },
  tabsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.primary.emerald,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  quickActions: {
    marginBottom: theme.spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
  },
  quickActionGradient: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  quickActionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary.emerald,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  chartCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  tipCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tipButtonText: {
    fontSize: 14,
    color: theme.colors.primary.gold,
    fontWeight: '600',
  },
  documentCategory: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  documentCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  documentCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  addDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  addDocumentText: {
    fontSize: 12,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  documentsList: {
    gap: theme.spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  documentItemUploaded: {
    backgroundColor: `${theme.colors.status.success}10`,
    borderColor: `${theme.colors.status.success}30`,
  },
  documentItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  documentName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  documentNameUploaded: {
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  newEmissionButton: {
    marginBottom: theme.spacing.lg,
  },
  newEmissionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  newEmissionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emissionCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  emissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  emissionBadge: {
    backgroundColor: `${theme.colors.primary.emerald}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  emissionBadgeText: {
    fontSize: 10,
    color: theme.colors.primary.emerald,
    fontWeight: '600',
  },
  emissionInfo: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  emissionProgress: {
    gap: theme.spacing.sm,
  },
  emissionProgressBar: {
    height: 6,
    backgroundColor: theme.colors.glass.medium,
    borderRadius: 3,
    overflow: 'hidden',
  },
  emissionProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.emerald,
    borderRadius: 3,
  },
  emissionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emissionStat: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  emissionPercent: {
    fontSize: 12,
    color: theme.colors.primary.emerald,
    fontWeight: '600',
  },
  investorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  investorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  investorInitials: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  investorInfo: {
    flex: 1,
  },
  investorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  investorDate: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  investorAmount: {
    alignItems: 'flex-end',
  },
  investorAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  investorShares: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    maxHeight: '90%',
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
  uploadArea: {
    borderWidth: 2,
    borderColor: theme.colors.glass.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
  },
  uploadText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  uploadSubtext: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginVertical: theme.spacing.sm,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary.emerald,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  uploadFormats: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.md,
  },
  uploadProgressContainer: {
    marginTop: theme.spacing.lg,
  },
  uploadProgressText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  uploadProgressBar: {
    height: 4,
    backgroundColor: theme.colors.glass.medium,
    borderRadius: 2,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.emerald,
  },
  form: {
    gap: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: theme.colors.glass.light,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  formTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  formNote: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});

export default StartupDashboardScreen;