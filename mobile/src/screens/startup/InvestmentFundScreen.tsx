// src/screens/startup/InvestmentFundScreen.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useFund } from '../../contexts/FundContext';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
    navigation: any;
}

const InvestmentFundScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const { fundData, getTotalInvestors } = useFund();
    const scrollViewRef = useRef<ScrollView>(null);

    const progressPercentage = (fundData.raisedAmount / fundData.targetAmount) * 100;

    // FAQ
    const faqs = [
        {
            question: 'Que se passe-t-il après mon investissement ?',
            answer: 'Vous recevez immédiatement une confirmation par email. Dès notre statut juridique établi, vous recevrez votre certificat officiel de parts.'
        },
        {
            question: 'Mon argent est-il sécurisé ?',
            answer: 'Oui, nous utilisons des passerelles de paiement sécurisées et votre investissement est tracé dans notre système.'
        },
        {
            question: 'Quand vais-je recevoir ma confirmation officielle ?',
            answer: 'Dans les 30 jours suivant l\'obtention de notre statut juridique officiel.'
        },
        {
            question: 'Comment puis-je suivre la progression du projet ?',
            answer: 'Vous recevrez des mises à jour mensuelles par email et pourrez suivre en temps réel sur votre dashboard.'
        },
        {
            question: 'Puis-je récupérer mon investissement ?',
            answer: 'Les investissements sont bloqués pendant la durée minimale de 3 ans, sauf cas exceptionnels.'
        }
    ];

    const handleInvestNow = () => {
        navigation.navigate('InvestmentCheckout');
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent('Bonjour, je souhaite avoir plus d\'informations sur le fonds AfriStocks');
        Linking.openURL(`whatsapp://send?phone=${fundData.whatsapp.replace(/\s/g, '')}&text=${message}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${fundData.email}?subject=Information sur le fonds AfriStocks`);
    };

    // Bouton Admin pour les utilisateurs admin
    const AdminButton = () => {
        if (user?.role === 'ADMIN') {
            return (
                <TouchableOpacity
                    style={styles.adminButton}
                    onPress={() => navigation.navigate('AdminDashboard')}
                >
                    <LinearGradient
                        colors={[theme.colors.status.error, '#DC2626']}
                        style={styles.adminButtonGradient}
                    >
                        <Ionicons name="settings" size={20} color="white" />
                        <Text style={styles.adminButtonText}>Admin Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fonds d'investissement</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Admin Button */}
                <AdminButton />

                {/* Hero Section */}
                <LinearGradient
                    colors={['rgba(249, 115, 22, 0.1)', 'rgba(245, 158, 11, 0.1)']}
                    style={styles.heroSection}
                >
                    <View style={styles.fundHeader}>
                        <View style={styles.fundLogo}>
                            <Ionicons name="trending-up" size={32} color={theme.colors.primary.orange} />
                        </View>
                        <View style={styles.fundInfo}>
                            <Text style={styles.fundName}>{fundData.name}</Text>
                            <Text style={styles.fundSubtitle}>Fonds d'investissement certifié</Text>
                        </View>
                    </View>

                    <Text style={styles.tagline}>{fundData.tagline}</Text>
                    <Text style={styles.description}>{fundData.description}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="people" size={20} color={theme.colors.text.secondary} />
                            <Text style={styles.statValue}>{getTotalInvestors()}</Text>
                            <Text style={styles.statLabel}>Investisseurs</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="trending-up" size={20} color={theme.colors.text.secondary} />
                            <Text style={styles.statValue}>{fundData.expectedReturn}</Text>
                            <Text style={styles.statLabel}>Rendement</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="time" size={20} color={theme.colors.text.secondary} />
                            <Text style={styles.statValue}>{fundData.duration}</Text>
                            <Text style={styles.statLabel}>Durée</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Status du fonds */}
                {!fundData.isActive && (
                    <View style={styles.statusBanner}>
                        <Ionicons name="information-circle" size={24} color={theme.colors.status.warning} />
                        <Text style={styles.statusText}>
                            Les investissements sont temporairement suspendus
                        </Text>
                    </View>
                )}

                {/* Objectifs et progression */}
                <GlassContainer style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>Objectif de levée de fonds</Text>

                    <View style={styles.amountRow}>
                        <Text style={styles.raisedAmount}>{fundData.raisedAmount.toLocaleString()}€</Text>
                        <Text style={styles.targetAmount}>{fundData.targetAmount.toLocaleString()}€</Text>
                    </View>

                    <View style={styles.progressBar}>
                        <View
                            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                        />
                    </View>

                    <View style={styles.progressInfo}>
                        <Text style={styles.progressText}>{progressPercentage.toFixed(1)}% collecté</Text>
                        <Text style={styles.remainingText}>
                            {(fundData.targetAmount - fundData.raisedAmount).toLocaleString()}€ restant
                        </Text>
                    </View>
                </GlassContainer>

                {/* CTA Principal */}
                <View style={styles.ctaSection}>
                    <Text style={styles.ctaTitle}>Prêt à investir ?</Text>
                    <Text style={styles.ctaSubtitle}>
                        Rejoignez {getTotalInvestors()} investisseurs qui nous font confiance
                    </Text>

                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handleInvestNow}
                        disabled={!fundData.isActive}
                    >
                        <LinearGradient
                            colors={fundData.isActive
                                ? [theme.colors.primary.orange, theme.colors.primary.amber]
                                : [theme.colors.glass.medium, theme.colors.glass.medium]
                            }
                            style={styles.ctaButtonGradient}
                        >
                            <Text style={styles.ctaButtonText}>
                                Investir maintenant - Min {fundData.minInvestment}€
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Transparence */}
                <View style={styles.transparencySection}>
                    <Ionicons name="alert-circle" size={24} color={theme.colors.primary.amber} />
                    <View style={styles.transparencyContent}>
                        <Text style={styles.transparencyTitle}>Information importante</Text>
                        <Text style={styles.transparencyText}>
                            Nous sommes en cours de formalisation juridique. Votre investissement est une preuve de soutien anticipé.
                            Une fois notre statut officiellement établi, vous recevrez automatiquement votre certificat de parts ou votre contrat officiel.
                        </Text>
                    </View>
                </View>

                {/* FAQ */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Questions fréquentes</Text>
                    {faqs.map((faq, index) => (
                        <GlassContainer key={index} style={styles.faqItem}>
                            <TouchableOpacity>
                                <View style={styles.faqHeader}>
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
                                </View>
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
                            </TouchableOpacity>
                        </GlassContainer>
                    ))}
                </View>

                {/* Contact */}
                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Une question ? Contactez-nous !</Text>
                    <View style={styles.contactButtons}>
                        <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                            <Ionicons name="mail" size={20} color={theme.colors.text.primary} />
                            <Text style={styles.contactButtonText}>{fundData.email}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.contactButton, styles.whatsappButton]}
                            onPress={handleWhatsApp}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                            <Text style={styles.contactButtonText}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
    adminButton: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    adminButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    adminButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    heroSection: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.3)',
    },
    fundHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    fundLogo: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    fundInfo: {
        flex: 1,
    },
    fundName: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    fundSubtitle: {
        fontSize: 14,
        color: theme.colors.primary.orange,
    },
    tagline: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.primary.orange,
        marginBottom: theme.spacing.md,
    },
    description: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: theme.spacing.xl,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${theme.colors.status.warning}20`,
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    statusText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.status.warning,
    },
    progressSection: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    raisedAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    targetAmount: {
        fontSize: 20,
        color: theme.colors.text.secondary,
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.glass.medium,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary.orange,
        borderRadius: 4,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
    },
    progressText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    remainingText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    ctaSection: {
        alignItems: 'center',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.glass.light,
        borderRadius: theme.borderRadius.xl,
    },
    ctaTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    ctaSubtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    ctaButton: {
        width: '100%',
    },
    ctaButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    ctaButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    transparencySection: {
        flexDirection: 'row',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    transparencyContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    transparencyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    transparencyText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },
    faqSection: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    faqItem: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        flex: 1,
    },
    faqAnswer: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginTop: theme.spacing.sm,
    },
    contactSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
    },
    contactButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.glass.light,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    whatsappButton: {
        backgroundColor: 'rgba(37, 211, 102, 0.1)',
    },
    contactButtonText: {
        fontSize: 14,
        color: theme.colors.text.primary,
    },
});

export default InvestmentFundScreen;