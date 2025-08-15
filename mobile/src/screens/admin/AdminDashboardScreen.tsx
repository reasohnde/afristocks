// src/screens/admin/AdminDashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
    Modal,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useFund } from '../../contexts/FundContext';
import { LineChart, PieChart } from 'react-native-chart-kit';

interface Props {
    navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const { fundData, updateFundData, investments, getTotalInvestors, isLoading, error, refreshData } = useFund();
    const [activeTab, setActiveTab] = useState('overview');
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempData, setTempData] = useState(fundData);
    const [refreshing, setRefreshing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Vérification des droits admin
    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            Alert.alert('Accès refusé', 'Vous n\'avez pas les droits d\'accès à cette page', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    }, [user]);

    // Gestion du chargement
    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={theme.colors.primary.emerald} />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    // Gestion des erreurs
    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Ionicons name="alert-circle" size={48} color={theme.colors.status.error} />
                <Text style={styles.errorText}>Erreur de chargement</Text>
                <Text style={styles.errorSubtext}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => refreshData()}
                >
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const handleSave = async (field: string) => {
        try {
            await updateFundData({ [field]: tempData[field as keyof typeof tempData] });
            Alert.alert('Succès', 'Les modifications ont été enregistrées');
            setEditingField(null);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible d\'enregistrer les modifications');
        }
    };

    const getInvestmentStats = () => {
        const completed = investments.filter((inv: any) => inv.status === 'completed').length;
        const pending = investments.filter((inv: any) => inv.status === 'pending').length;
        const failed = investments.filter((inv: any) => inv.status === 'failed').length;

        const byMethod = investments.reduce((acc: Record<string, number>, inv: any) => {
            acc[inv.paymentMethod] = (acc[inv.paymentMethod] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { completed, pending, failed, byMethod };
    };

    const stats = getInvestmentStats();

    const renderOverviewTab = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* KPIs */}
            <View style={styles.kpiContainer}>
                <GlassContainer style={styles.kpiCard}>
                    <View style={styles.kpiIcon}>
                        <Ionicons name="cash" size={24} color={theme.colors.primary.emerald} />
                    </View>
                    <Text style={styles.kpiValue}>{fundData.raisedAmount.toLocaleString()}€</Text>
                    <Text style={styles.kpiLabel}>Montant levé</Text>
                    <Text style={styles.kpiProgress}>
                        {((fundData.raisedAmount / fundData.targetAmount) * 100).toFixed(1)}% de l'objectif
                    </Text>
                </GlassContainer>

                <GlassContainer style={styles.kpiCard}>
                    <View style={styles.kpiIcon}>
                        <Ionicons name="people" size={24} color={theme.colors.primary.gold} />
                    </View>
                    <Text style={styles.kpiValue}>{getTotalInvestors()}</Text>
                    <Text style={styles.kpiLabel}>Investisseurs</Text>
                    <Text style={styles.kpiProgress}>+12% ce mois</Text>
                </GlassContainer>

                <GlassContainer style={styles.kpiCard}>
                    <View style={styles.kpiIcon}>
                        <Ionicons name="trending-up" size={24} color={theme.colors.status.success} />
                    </View>
                    <Text style={styles.kpiValue}>{fundData.expectedReturn}</Text>
                    <Text style={styles.kpiLabel}>Rendement prévu</Text>
                    <Text style={styles.kpiProgress}>Annuel</Text>
                </GlassContainer>

                <GlassContainer style={styles.kpiCard}>
                    <View style={styles.kpiIcon}>
                        <Ionicons name="time" size={24} color={theme.colors.status.info} />
                    </View>
                    <Text style={styles.kpiValue}>{fundData.duration}</Text>
                    <Text style={styles.kpiLabel}>Durée</Text>
                    <Text style={styles.kpiProgress}>Investissement</Text>
                </GlassContainer>
            </View>

            {/* Graphique de progression */}
            <GlassContainer style={styles.chartCard}>
                <Text style={styles.chartTitle}>Évolution des investissements</Text>
                <LineChart
                    data={{
                        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                        datasets: [{
                            data: [5000, 8000, 10000, 12000, 13500, 15000],
                            color: () => theme.colors.primary.emerald,
                        }],
                    }}
                    width={screenWidth - theme.spacing.lg * 3}
                    height={200}
                    chartConfig={{
                        backgroundGradientFrom: 'transparent',
                        backgroundGradientTo: 'transparent',
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
                    withInnerLines={false}
                    withOuterLines={false}
                />
            </GlassContainer>

            {/* Répartition des investissements */}
            <GlassContainer style={styles.chartCard}>
                <Text style={styles.chartTitle}>Répartition par méthode de paiement</Text>
                <PieChart
                    data={[
                        {
                            name: 'Carte',
                            population: stats.byMethod.card || 0,
                            color: theme.colors.primary.emerald,
                            legendFontColor: theme.colors.text.primary,
                            legendFontSize: 12,
                        },
                        {
                            name: 'Mobile',
                            population: stats.byMethod.mobile || 0,
                            color: theme.colors.primary.gold,
                            legendFontColor: theme.colors.text.primary,
                            legendFontSize: 12,
                        },
                        {
                            name: 'Virement',
                            population: stats.byMethod.bank || 0,
                            color: theme.colors.status.info,
                            legendFontColor: theme.colors.text.primary,
                            legendFontSize: 12,
                        },
                    ]}
                    width={screenWidth - theme.spacing.lg * 2}
                    height={200}
                    chartConfig={{
                        color: () => theme.colors.text.primary,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </GlassContainer>

            {/* Actions rapides */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickActionButton}>
                    <LinearGradient
                        colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
                        style={styles.quickActionGradient}
                    >
                        <Ionicons name="download" size={24} color="white" />
                        <Text style={styles.quickActionText}>Exporter les données</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionButton}>
                    <LinearGradient
                        colors={[theme.colors.primary.gold, theme.colors.primary.goldDark]}
                        style={styles.quickActionGradient}
                    >
                        <Ionicons name="mail" size={24} color="white" />
                        <Text style={styles.quickActionText}>Email aux investisseurs</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderSettingsTab = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Informations générales */}
            <GlassContainer style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Informations générales</Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('name');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Nom du fonds</Text>
                        <Text style={styles.settingValue}>{fundData.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('tagline');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Slogan</Text>
                        <Text style={styles.settingValue} numberOfLines={2}>{fundData.tagline}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('description');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Description</Text>
                        <Text style={styles.settingValue} numberOfLines={3}>{fundData.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
            </GlassContainer>

            {/* Paramètres financiers */}
            <GlassContainer style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Paramètres financiers</Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('targetAmount');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Objectif de levée</Text>
                        <Text style={styles.settingValue}>{fundData.targetAmount.toLocaleString()}€</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('minInvestment');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Investissement minimum</Text>
                        <Text style={styles.settingValue}>{fundData.minInvestment}€</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('expectedReturn');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Rendement prévu</Text>
                        <Text style={styles.settingValue}>{fundData.expectedReturn}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('duration');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Durée d'investissement</Text>
                        <Text style={styles.settingValue}>{fundData.duration}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
            </GlassContainer>

            {/* Contact */}
            <GlassContainer style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Informations de contact</Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('email');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Email</Text>
                        <Text style={styles.settingValue}>{fundData.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('whatsapp');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>WhatsApp</Text>
                        <Text style={styles.settingValue}>{fundData.whatsapp}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('phone');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Téléphone</Text>
                        <Text style={styles.settingValue}>{fundData.phone}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
            </GlassContainer>

            {/* Configuration */}
            <GlassContainer style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Configuration</Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Fonds actif</Text>
                        <Text style={styles.settingDescription}>
                            Activer/désactiver les investissements
                        </Text>
                    </View>
                    <Switch
                        value={fundData.isActive}
                        onValueChange={(value) => updateFundData({ isActive: value })}
                        trackColor={{ false: theme.colors.glass.medium, true: theme.colors.primary.emerald }}
                        thumbColor={fundData.isActive ? theme.colors.primary.emeraldLight : '#f4f3f4'}
                    />
                </View>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                        setEditingField('stripePublicKey');
                        setShowEditModal(true);
                    }}
                >
                    <View style={styles.settingLeft}>
                        <Text style={styles.settingLabel}>Clé publique Stripe</Text>
                        <Text style={styles.settingValue}>
                            {fundData.stripePublicKey ? '••••••••' + fundData.stripePublicKey.slice(-4) : 'Non configuré'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
            </GlassContainer>
        </ScrollView>
    );

    const renderInvestorsTab = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.investorsHeader}>
                <Text style={styles.investorsTitle}>Liste des investisseurs</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter" size={20} color={theme.colors.text.primary} />
                    <Text style={styles.filterText}>Filtrer</Text>
                </TouchableOpacity>
            </View>

            {investments.map((investment: any) => (
                <GlassContainer key={investment.id} style={styles.investorCard}>
                    <View style={styles.investorHeader}>
                        <View style={styles.investorAvatar}>
                            <Text style={styles.investorInitials}>
                                {investment.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.investorInfo}>
                            <Text style={styles.investorName}>{investment.userName}</Text>
                            <Text style={styles.investorEmail}>{investment.userEmail}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            investment.status === 'completed' && styles.statusCompleted,
                            investment.status === 'pending' && styles.statusPending,
                            investment.status === 'failed' && styles.statusFailed,
                        ]}>
                            <Text style={styles.statusText}>
                                {investment.status === 'completed' ? 'Confirmé' :
                                    investment.status === 'pending' ? 'En attente' : 'Échoué'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.investorDetails}>
                        <View style={styles.investorDetail}>
                            <Text style={styles.detailLabel}>Montant</Text>
                            <Text style={styles.detailValue}>{investment.amount.toLocaleString()}€</Text>
                        </View>
                        <View style={styles.investorDetail}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>
                                {new Date(investment.date).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.investorDetail}>
                            <Text style={styles.detailLabel}>Méthode</Text>
                            <Text style={styles.detailValue}>{investment.paymentMethod}</Text>
                        </View>
                    </View>
                </GlassContainer>
            ))}
        </ScrollView>
    );

    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            name: 'Nom du fonds',
            tagline: 'Slogan',
            description: 'Description',
            targetAmount: 'Objectif de levée (€)',
            minInvestment: 'Investissement minimum (€)',
            expectedReturn: 'Rendement prévu',
            duration: 'Durée d\'investissement',
            email: 'Email',
            whatsapp: 'WhatsApp',
            phone: 'Téléphone',
            stripePublicKey: 'Clé publique Stripe',
        };
        return labels[field] || field;
    };

    const getFieldType = (field: string) => {
        if (['targetAmount', 'minInvestment'].includes(field)) return 'numeric';
        if (field === 'email') return 'email-address';
        if (['phone', 'whatsapp'].includes(field)) return 'phone-pad';
        return 'default';
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dashboard Admin</Text>
                <TouchableOpacity style={styles.logoutButton}>
                    <Ionicons name="log-out" size={24} color={theme.colors.status.error} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Ionicons
                        name="bar-chart"
                        size={20}
                        color={activeTab === 'overview' ? theme.colors.primary.emerald : theme.colors.text.tertiary}
                    />
                    <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                        Vue d'ensemble
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
                    onPress={() => setActiveTab('settings')}
                >
                    <Ionicons
                        name="settings"
                        size={20}
                        color={activeTab === 'settings' ? theme.colors.primary.emerald : theme.colors.text.tertiary}
                    />
                    <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
                        Paramètres
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'investors' && styles.activeTab]}
                    onPress={() => setActiveTab('investors')}
                >
                    <Ionicons
                        name="people"
                        size={20}
                        color={activeTab === 'investors' ? theme.colors.primary.emerald : theme.colors.text.tertiary}
                    />
                    <Text style={[styles.tabText, activeTab === 'investors' && styles.activeTabText]}>
                        Investisseurs
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary.emerald}
                    />
                }
            >
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'settings' && renderSettingsTab()}
                {activeTab === 'investors' && renderInvestorsTab()}
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Modifier {editingField && getFieldLabel(editingField)}
                            </Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        {editingField && (
                            <View style={styles.modalBody}>
                                <TextInput
                                    style={[
                                        styles.modalInput,
                                        editingField === 'description' && styles.modalTextarea
                                    ]}
                                    value={String(tempData[editingField as keyof typeof tempData])}
                                    onChangeText={(text) => {
                                        const value = ['targetAmount', 'minInvestment'].includes(editingField)
                                            ? parseInt(text) || 0
                                            : text;
                                        setTempData({ ...tempData, [editingField]: value });
                                    }}
                                    placeholder={`Entrez ${getFieldLabel(editingField)}`}
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    keyboardType={getFieldType(editingField)}
                                    multiline={editingField === 'description'}
                                    numberOfLines={editingField === 'description' ? 4 : 1}
                                />

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setTempData(fundData);
                                            setShowEditModal(false);
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Annuler</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            handleSave(editingField);
                                            setShowEditModal(false);
                                        }}
                                    >
                                        <LinearGradient
                                            colors={[theme.colors.primary.emerald, theme.colors.primary.emeraldDark]}
                                            style={styles.saveButtonGradient}
                                        >
                                            <Text style={styles.saveButtonText}>Enregistrer</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.md,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    errorSubtext: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    retryButton: {
        backgroundColor: theme.colors.primary.emerald,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
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
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.xs,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
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
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    kpiContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    kpiCard: {
        width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
        padding: theme.spacing.lg,
    },
    kpiIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    kpiLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    kpiProgress: {
        fontSize: 10,
        color: theme.colors.text.tertiary,
        marginTop: 4,
    },
    chartCard: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
    },
    quickActions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    quickActionButton: {
        flex: 1,
    },
    quickActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    settingsSection: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    settingsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glass.border,
    },
    settingLeft: {
        flex: 1,
        marginRight: theme.spacing.md,
    },
    settingLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    settingValue: {
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    settingDescription: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
        marginTop: 2,
    },
    investorsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    investorsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.glass.light,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.xs,
    },
    filterText: {
        fontSize: 14,
        color: theme.colors.text.primary,
    },
    investorCard: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    investorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    investorInfo: {
        flex: 1,
    },
    investorName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    investorEmail: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
    },
    statusCompleted: {
        backgroundColor: `${theme.colors.status.success}20`,
    },
    statusPending: {
        backgroundColor: `${theme.colors.status.warning}20`,
    },
    statusFailed: {
        backgroundColor: `${theme.colors.status.error}20`,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    investorDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    investorDetail: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
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
    modalBody: {
        marginBottom: theme.spacing.lg,
    },
    modalInput: {
        backgroundColor: theme.colors.glass.light,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xl,
    },
    modalTextarea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalActions: {
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
    saveButton: {
        flex: 1,
    },
    saveButtonGradient: {
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});

export default AdminDashboardScreen;