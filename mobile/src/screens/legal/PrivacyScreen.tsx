// src/screens/legal/PrivacyScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const PrivacyScreen = ({ navigation }: any) => {
    const sections = [
        {
            title: '1. Collecte des informations',
            content: `Nous collectons plusieurs types d'informations :

**Informations fournies directement :**
• Nom complet et date de naissance
• Adresse email et numéro de téléphone
• Informations d'identification (KYC)
• Informations bancaires et de paiement
• Historique d'investissement

**Informations collectées automatiquement :**
• Adresse IP et données de localisation
• Type d'appareil et système d'exploitation
• Comportement de navigation sur la plateforme
• Données d'utilisation et préférences`
        },
        {
            title: '2. Utilisation des informations',
            content: `Nous utilisons vos informations pour :

• Créer et gérer votre compte
• Vérifier votre identité (conformité KYC/AML)
• Traiter vos transactions d'investissement
• Vous envoyer des communications importantes
• Améliorer nos services et votre expérience
• Détecter et prévenir la fraude
• Respecter nos obligations légales et réglementaires
• Analyser l'utilisation de la plateforme`
        },
        {
            title: '3. Partage des informations',
            content: `Nous pouvons partager vos informations avec :

**Partenaires commerciaux :**
• Institutions financières pour le traitement des paiements
• Startups dans lesquelles vous investissez
• Prestataires de services de vérification d'identité

**Autorités légales :**
• Conformément aux exigences légales
• Pour protéger nos droits et notre sécurité
• En cas de fusion ou acquisition

Nous ne vendons jamais vos données personnelles à des tiers.`
        },
        {
            title: '4. Sécurité des données',
            content: `Nous mettons en œuvre des mesures de sécurité robustes :

• Chiffrement SSL/TLS pour toutes les transmissions
• Chiffrement des données sensibles au repos
• Authentification à deux facteurs disponible
• Audits de sécurité réguliers
• Formation du personnel sur la protection des données
• Accès limité aux données personnelles

Malgré nos efforts, aucun système n'est totalement sécurisé.`
        },
        {
            title: '5. Conservation des données',
            content: `Nous conservons vos données :

• Compte actif : pendant toute la durée de votre utilisation
• Après fermeture : selon les exigences légales (généralement 5 ans)
• Données de transaction : 10 ans (obligations fiscales)
• Données marketing : jusqu'à désinscription

Vous pouvez demander la suppression de vos données, sous réserve de nos obligations légales.`
        },
        {
            title: '6. Vos droits',
            content: `Conformément au RGPD et aux lois locales, vous avez le droit de :

• Accéder à vos données personnelles
• Rectifier les informations inexactes
• Demander la suppression de vos données
• Vous opposer au traitement de vos données
• Demander la portabilité de vos données
• Retirer votre consentement à tout moment
• Déposer une plainte auprès de l'autorité de protection des données`
        },
        {
            title: '7. Cookies et technologies similaires',
            content: `Nous utilisons des cookies pour :

• Maintenir votre session active
• Mémoriser vos préférences
• Analyser l'utilisation de la plateforme
• Améliorer la sécurité

Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.`
        },
        {
            title: '8. Transferts internationaux',
            content: `Vos données peuvent être transférées et stockées dans différents pays. Nous assurons que ces transferts sont effectués conformément aux lois applicables et avec des garanties appropriées pour protéger vos données.`
        },
        {
            title: '9. Protection des mineurs',
            content: `AfriStocks n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment d'informations personnelles de mineurs. Si nous découvrons qu'un mineur nous a fourni des données, nous les supprimerons immédiatement.`
        },
        {
            title: '10. Modifications de la politique',
            content: `Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes seront notifiées par :

• Email à votre adresse enregistrée
• Notification dans l'application
• Bannière sur le site web

La date de la dernière mise à jour sera toujours indiquée.`
        },
        {
            title: '11. Contact',
            content: `Pour toute question sur la confidentialité ou pour exercer vos droits :

**Délégué à la protection des données (DPO) :**
Email : privacy@afristocks.com
Téléphone : +225 XX XX XX XX XX

**Adresse postale :**
AfriStocks - Service Confidentialité
Abidjan, Côte d'Ivoire

Nous nous engageons à répondre dans les 30 jours.`
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Politique de confidentialité</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <GlassContainer style={styles.infoCard}>
                    <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary.emerald} />
                    <Text style={styles.infoText}>
                        Dernière mise à jour : 1er janvier 2025
                    </Text>
                </GlassContainer>

                <View style={styles.content}>
                    <Text style={styles.introduction}>
                        Chez AfriStocks, nous prenons la protection de vos données personnelles très au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
                    </Text>

                    <GlassContainer style={styles.highlightCard}>
                        <Ionicons name="lock-closed" size={32} color={theme.colors.primary.gold} />
                        <Text style={styles.highlightTitle}>Notre engagement</Text>
                        <Text style={styles.highlightText}>
                            Vos données vous appartiennent. Nous ne les vendrons jamais et les protégerons avec les plus hauts standards de sécurité.
                        </Text>
                    </GlassContainer>

                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionContent}>{section.content}</Text>
                        </View>
                    ))}

                    <GlassContainer style={styles.contactCard}>
                        <View style={styles.contactHeader}>
                            <Ionicons name="mail" size={24} color={theme.colors.primary.emerald} />
                            <Text style={styles.contactTitle}>Besoin d'aide ?</Text>
                        </View>
                        <Text style={styles.contactText}>
                            N'hésitez pas à nous contacter pour toute question concernant vos données personnelles.
                        </Text>
                        <TouchableOpacity style={styles.contactButton}>
                            <Text style={styles.contactButtonText}>Contacter le DPO</Text>
                        </TouchableOpacity>
                    </GlassContainer>
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
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        flex: 1,
    },
    content: {
        paddingHorizontal: theme.spacing.lg,
    },
    introduction: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    highlightCard: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
        backgroundColor: `${theme.colors.primary.gold}10`,
        borderWidth: 1,
        borderColor: `${theme.colors.primary.gold}30`,
    },
    highlightTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    highlightText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    sectionContent: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 22,
    },
    contactCard: {
        padding: theme.spacing.xl,
        marginTop: theme.spacing.xl,
        alignItems: 'center',
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    contactText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    contactButton: {
        backgroundColor: theme.colors.primary.emerald,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default PrivacyScreen;