/**
 * AfriStocks Mobile Application
 * Complete React Native implementation
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'INVESTOR' | 'STARTUP';
  walletBalance: number;
}

interface Startup {
  id: string;
  name: string;
  logo: string;
  sector: string;
  country: string;
  valuation: number;
  sharePrice: number;
  availableShares: number;
  minInvestment: number;
  description: string;
  growth: number;
}

interface Investment {
  id: string;
  startupId: string;
  startupName: string;
  shares: number;
  investedAmount: number;
  currentValue: number;
  returnPercentage: number;
  date: string;
}

// Mock Data
const mockStartups: Startup[] = [
  {
    id: '1',
    name: 'AgroTech Solutions',
    logo: '🌾',
    sector: 'Agriculture',
    country: 'Côte d\'Ivoire',
    valuation: 2500000,
    sharePrice: 100,
    availableShares: 10000,
    minInvestment: 5000,
    description: 'Plateforme digitale connectant agriculteurs et acheteurs',
    growth: 15.5,
  },
  {
    id: '2',
    name: 'MediConnect Africa',
    logo: '🏥',
    sector: 'Santé',
    country: 'Sénégal',
    valuation: 3200000,
    sharePrice: 150,
    availableShares: 8000,
    minInvestment: 7500,
    description: 'Télémédecine pour zones rurales',
    growth: 22.3,
  },
  {
    id: '3',
    name: 'EduTech Pro',
    logo: '📚',
    sector: 'Éducation',
    country: 'Ghana',
    valuation: 1800000,
    sharePrice: 80,
    availableShares: 12000,
    minInvestment: 4000,
    description: 'E-learning adapté au contexte africain',
    growth: 18.7,
  },
];

const mockInvestments: Investment[] = [
  {
    id: '1',
    startupId: '1',
    startupName: 'AgroTech Solutions',
    shares: 50,
    investedAmount: 5000,
    currentValue: 5775,
    returnPercentage: 15.5,
    date: '2024-01-15',
  },
  {
    id: '2',
    startupId: '2',
    startupName: 'MediConnect Africa',
    shares: 100,
    investedAmount: 15000,
    currentValue: 18345,
    returnPercentage: 22.3,
    date: '2024-02-20',
  },
];

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [user, setUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth Screen Component
  const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
      if (!email || !password || (!isLogin && !name)) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs');
        return;
      }

      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUser({
          id: '1',
          email,
          name: name || 'Investisseur Test',
          role: 'INVESTOR',
          walletBalance: 50000,
        });
        setIsAuthenticated(true);
        setLoading(false);
      }, 1500);
    };

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.authContainer}
        >
          <View style={styles.authHeader}>
            <Text style={styles.authLogo}>💹</Text>
            <Text style={styles.authTitle}>AfriStocks</Text>
            <Text style={styles.authSubtitle}>
              Investissez dans l'avenir de l'Afrique
            </Text>
          </View>

          <View style={styles.authForm}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Se connecter' : 'S\'inscrire'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              style={styles.switchAuthMode}
            >
              <Text style={styles.switchAuthText}>
                {isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  // Main App Screen
  const MainScreen = () => {
    const filteredStartups = mockStartups.filter(startup =>
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPortfolioValue = mockInvestments.reduce(
      (sum, inv) => sum + inv.currentValue,
      0
    );

    const totalInvested = mockInvestments.reduce(
      (sum, inv) => sum + inv.investedAmount,
      0
    );

    const onRefresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 2000);
    };

    const handleInvest = () => {
      if (!selectedStartup || !investmentAmount) return;

      const amount = parseFloat(investmentAmount);
      if (amount < selectedStartup.minInvestment) {
        Alert.alert(
          'Montant insuffisant',
          `Le montant minimum est ${formatCurrency(selectedStartup.minInvestment)}`
        );
        return;
      }

      if (amount > user!.walletBalance) {
        Alert.alert('Solde insuffisant', 'Veuillez recharger votre wallet');
        return;
      }

      Alert.alert(
        'Confirmer l\'investissement',
        `Investir ${formatCurrency(amount)} dans ${selectedStartup.name} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Confirmer',
            onPress: () => {
              Alert.alert('Succès', 'Investissement effectué avec succès !');
              setSelectedStartup(null);
              setInvestmentAmount('');
            },
          },
        ]
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bienvenue,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Solde Wallet</Text>
            <Text style={styles.walletBalance}>
              {formatCurrency(user?.walletBalance || 0)}
            </Text>
          </View>
        </View>

        {/* Tab Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'explore' && (
            <View>
              <TextInput
                style={styles.searchBar}
                placeholder="Rechercher une startup..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <Text style={styles.sectionTitle}>Opportunités d'investissement</Text>
              
              {filteredStartups.map((startup) => (
                <TouchableOpacity
                  key={startup.id}
                  style={styles.startupCard}
                  onPress={() => setSelectedStartup(startup)}
                >
                  <View style={styles.startupHeader}>
                    <Text style={styles.startupLogo}>{startup.logo}</Text>
                    <View style={styles.startupInfo}>
                      <Text style={styles.startupName}>{startup.name}</Text>
                      <Text style={styles.startupMeta}>
                        {startup.sector} • {startup.country}
                      </Text>
                    </View>
                    <View style={styles.growthBadge}>
                      <Text style={styles.growthText}>+{startup.growth}%</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.startupDescription} numberOfLines={2}>
                    {startup.description}
                  </Text>
                  
                  <View style={styles.startupStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Prix/Action</Text>
                      <Text style={styles.statValue}>
                        {formatCurrency(startup.sharePrice)}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Min. Invest</Text>
                      <Text style={styles.statValue}>
                        {formatCurrency(startup.minInvestment)}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Disponible</Text>
                      <Text style={styles.statValue}>
                        {startup.availableShares.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'portfolio' && (
            <View>
              <View style={styles.portfolioSummary}>
                <Text style={styles.portfolioTitle}>Valeur Totale</Text>
                <Text style={styles.portfolioValue}>
                  {formatCurrency(totalPortfolioValue)}
                </Text>
                <Text style={styles.portfolioReturn}>
                  +{formatCurrency(totalPortfolioValue - totalInvested)} (
                  {((totalPortfolioValue / totalInvested - 1) * 100).toFixed(1)}%)
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Mes Investissements</Text>
              
              {mockInvestments.map((investment) => (
                <View key={investment.id} style={styles.investmentCard}>
                  <View style={styles.investmentHeader}>
                    <Text style={styles.investmentName}>
                      {investment.startupName}
                    </Text>
                    <Text
                      style={[
                        styles.returnBadge,
                        investment.returnPercentage > 0
                          ? styles.positiveReturn
                          : styles.negativeReturn,
                      ]}
                    >
                      {investment.returnPercentage > 0 ? '+' : ''}
                      {investment.returnPercentage}%
                    </Text>
                  </View>
                  
                  <View style={styles.investmentDetails}>
                    <View style={styles.investmentStat}>
                      <Text style={styles.investmentLabel}>Actions</Text>
                      <Text style={styles.investmentValue}>
                        {investment.shares}
                      </Text>
                    </View>
                    <View style={styles.investmentStat}>
                      <Text style={styles.investmentLabel}>Investi</Text>
                      <Text style={styles.investmentValue}>
                        {formatCurrency(investment.investedAmount)}
                      </Text>
                    </View>
                    <View style={styles.investmentStat}>
                      <Text style={styles.investmentLabel}>Valeur</Text>
                      <Text style={styles.investmentValue}>
                        {formatCurrency(investment.currentValue)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'wallet' && (
            <View>
              <View style={styles.walletCard}>
                <Text style={styles.walletCardTitle}>Solde disponible</Text>
                <Text style={styles.walletCardBalance}>
                  {formatCurrency(user?.walletBalance || 0)}
                </Text>
                
                <View style={styles.walletActions}>
                  <TouchableOpacity style={styles.walletButton}>
                    <Text style={styles.walletButtonIcon}>↓</Text>
                    <Text style={styles.walletButtonText}>Déposer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.walletButton}>
                    <Text style={styles.walletButtonIcon}>↑</Text>
                    <Text style={styles.walletButtonText}>Retirer</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Historique des transactions</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Aucune transaction récente
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'profile' && (
            <View>
              <View style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {user?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <Text style={styles.profileRole}>Investisseur</Text>
              </View>

              <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Vérification KYC</Text>
                  <Text style={styles.menuItemIcon}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Paramètres</Text>
                  <Text style={styles.menuItemIcon}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Support</Text>
                  <Text style={styles.menuItemIcon}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Déconnexion',
                        onPress: () => {
                          setIsAuthenticated(false);
                          setUser(null);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={[styles.menuItemText, styles.logoutText]}>
                    Déconnexion
                  </Text>
                  <Text style={styles.menuItemIcon}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('explore')}
          >
            <Text style={[styles.navIcon, activeTab === 'explore' && styles.activeNav]}>
              🔍
            </Text>
            <Text style={[styles.navText, activeTab === 'explore' && styles.activeNav]}>
              Explorer
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.navIcon, activeTab === 'portfolio' && styles.activeNav]}>
              📊
            </Text>
            <Text style={[styles.navText, activeTab === 'portfolio' && styles.activeNav]}>
              Portfolio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('wallet')}
          >
            <Text style={[styles.navIcon, activeTab === 'wallet' && styles.activeNav]}>
              💳
            </Text>
            <Text style={[styles.navText, activeTab === 'wallet' && styles.activeNav]}>
              Wallet
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.navIcon, activeTab === 'profile' && styles.activeNav]}>
              👤
            </Text>
            <Text style={[styles.navText, activeTab === 'profile' && styles.activeNav]}>
              Profil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Investment Modal */}
        <Modal
          visible={!!selectedStartup}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedStartup(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Investir dans</Text>
                <TouchableOpacity onPress={() => setSelectedStartup(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedStartup && (
                <>
                  <View style={styles.modalStartupInfo}>
                    <Text style={styles.modalStartupLogo}>
                      {selectedStartup.logo}
                    </Text>
                    <Text style={styles.modalStartupName}>
                      {selectedStartup.name}
                    </Text>
                  </View>

                  <View style={styles.modalStats}>
                    <View style={styles.modalStat}>
                      <Text style={styles.modalStatLabel}>Prix par action</Text>
                      <Text style={styles.modalStatValue}>
                        {formatCurrency(selectedStartup.sharePrice)}
                      </Text>
                    </View>
                    <View style={styles.modalStat}>
                      <Text style={styles.modalStatLabel}>Actions disponibles</Text>
                      <Text style={styles.modalStatValue}>
                        {selectedStartup.availableShares.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.investmentForm}>
                    <Text style={styles.inputLabel}>Montant à investir (XOF)</Text>
                    <TextInput
                      style={styles.investmentInput}
                      placeholder={`Min: ${formatCurrency(selectedStartup.minInvestment)}`}
                      value={investmentAmount}
                      onChangeText={setInvestmentAmount}
                      keyboardType="numeric"
                    />
                    
                    {investmentAmount && (
                      <Text style={styles.shareCalculation}>
                        ≈ {Math.floor(parseFloat(investmentAmount) / selectedStartup.sharePrice)} actions
                      </Text>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.investButton,
                        !investmentAmount && styles.disabledButton,
                      ]}
                      onPress={handleInvest}
                      disabled={!investmentAmount}
                    >
                      <Text style={styles.investButtonText}>
                        Confirmer l'investissement
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

  return isAuthenticated ? <MainScreen /> : <AuthScreen />;
};

// Utility function
const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} XOF`;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Auth Styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authLogo: {
    fontSize: 60,
    marginBottom: 10,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  authForm: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  authButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  switchAuthMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthText: {
    color: '#2563eb',
    fontSize: 16,
  },
  // Main App Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  walletInfo: {
    alignItems: 'flex-end',
  },
  walletLabel: {
    fontSize: 12,
    color: '#666',
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  content: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    color: '#1a1a1a',
  },
  // Startup Card Styles
  startupCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  startupLogo: {
    fontSize: 40,
    marginRight: 15,
  },
  startupInfo: {
    flex: 1,
  },
  startupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  startupMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  growthBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  growthText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  startupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  startupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  // Portfolio Styles
  portfolioSummary: {
    backgroundColor: '#2563eb',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  portfolioTitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  portfolioValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  portfolioReturn: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '600',
  },
  investmentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  investmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  returnBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveReturn: {
    backgroundColor: '#d1fae5',
    color: '#10b981',
  },
  negativeReturn: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  investmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investmentStat: {
    alignItems: 'center',
  },
  investmentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  investmentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  // Wallet Styles
  walletCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletCardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  walletCardBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 20,
  },
  walletButton: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  walletButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  walletButtonText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  // Profile Styles
  profileCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuItemIcon: {
    fontSize: 18,
    color: '#9ca3af',
  },
  logoutText: {
    color: '#ef4444',
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
  },
  activeNav: {
    color: '#2563eb',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalStartupInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalStartupLogo: {
    fontSize: 60,
    marginBottom: 10,
  },
  modalStartupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  investmentForm: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 10,
  },
  investmentInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  shareCalculation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  investButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  investButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App;