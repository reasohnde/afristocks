// src/screens/legal/TermsScreen.tsx
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

const TermsScreen = ({ navigation }: any) => {
    const sections = [
        {
            title: '1. Acceptation des conditions',
            content: `En accédant et en utilisant la plateforme AfriStocks, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.

AfriStocks se réserve le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication sur la plateforme.`
        },
        {
            title: '2. Description du service',
            content: `AfriStocks est une plateforme d'investissement qui met en relation des investisseurs avec des startups et PME africaines. Notre service comprend :

• La présentation d'opportunités d'investissement
• La facilitation des transactions financières
• La gestion des investissements
• Le suivi de performance des investissements
• L'accès à des contenus éducatifs`
        },
        {
            title: '3. Éligibilité',
            content: `Pour utiliser AfriStocks, vous devez :

• Avoir au moins 18 ans
• Avoir la capacité juridique de conclure des contrats
• Résider dans un pays où nos services sont disponibles
• Fournir des informations exactes et complètes lors de l'inscription
• Maintenir la confidentialité de vos identifiants de connexion`
        },
        {
            title: '4. Investissements et risques',
            content: `AVERTISSEMENT : Investir dans des startups comporte des risques significatifs, y compris la perte totale du capital investi.

• Les performances passées ne garantissent pas les résultats futurs
• AfriStocks ne garantit aucun retour sur investissement
• Vous êtes seul responsable de vos décisions d'investissement
• Il est recommandé de diversifier vos investissements
• Consultez un conseiller financier si nécessaire`
        },
        {
            title: '5. Frais et commissions',
            content: `AfriStocks peut percevoir :

• Des frais de gestion sur les investissements
• Des commissions sur les transactions réussies
• Des frais pour certains services premium

Tous les frais seront clairement indiqués avant toute transaction.`
        },
        {
            title: '6. Propriété intellectuelle',
            content: `Tout le contenu de la plateforme AfriStocks, incluant mais non limité aux textes, graphiques, logos, icônes, images, clips audio et vidéo, est la propriété d'AfriStocks ou de ses fournisseurs de contenu et est protégé par les lois sur la propriété intellectuelle.`
        },
        {
            title: '7. Protection des données',
            content: `Nous nous engageons à protéger vos données personnelles conformément à notre politique de confidentialité. Vos données seront utilisées uniquement pour :

• Fournir nos services
• Vérifier votre identité (KYC)
• Communiquer avec vous
• Améliorer nos services
• Respecter nos obligations légales`
        },
        {
            title: '8. Conduite des utilisateurs',
            content: `Vous vous engagez à :

• Ne pas utiliser la plateforme à des fins illégales
• Ne pas tenter de compromettre la sécurité du système
• Ne pas usurper l'identité d'autrui
• Ne pas diffuser de fausses informations
• Respecter les autres utilisateurs de la plateforme`
        },
        {
            title: '9. Limitation de responsabilité',
            content: `AfriStocks ne sera pas responsable des :

• Pertes financières résultant de vos investissements
• Interruptions de service
• Erreurs ou omissions dans le contenu
• Actions des startups dans lesquelles vous investissez
• Dommages indirects ou consécutifs`
        },
        {
            title: '10. Résiliation',
            content: `AfriStocks peut suspendre ou résilier votre compte si :

• Vous violez ces conditions d'utilisation
• Vous fournissez de fausses informations
• Vous utilisez la plateforme de manière frauduleuse
• Sur demande des autorités compétentes

Vous pouvez également supprimer votre compte à tout moment.`
        },
        {
            title: '11. Droit applicable',
            content: `Ces conditions sont régies par les lois de la République de Côte d'Ivoire. Tout litige sera soumis à la juridiction exclusive des tribunaux d'Abidjan.`
        },
        {
            title: '12. Contact',
            content: `Pour toute question concernant ces conditions d'utilisation :

Email : legal@afristocks.com
Téléphone : +225 XX XX XX XX XX
Adresse : Abidjan, Côte d'Ivoire`
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
                <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <GlassContainer style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={theme.colors.primary.emerald} />
                    <Text style={styles.infoText}>
                        Dernière mise à jour : 1er janvier 2025
                    </Text>
                </GlassContainer>

                <View style={styles.content}>
                    <Text style={styles.introduction}>
                        Bienvenue sur AfriStocks. Ces conditions d'utilisation régissent votre utilisation de notre plateforme d'investissement. Veuillez les lire attentivement.
                    </Text>

                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionContent}>{section.content}</Text>
                        </View>
                    ))}

                    <GlassContainer style={styles.acceptCard}>
                        <Text style={styles.acceptText}>
                            En continuant à utiliser AfriStocks, vous confirmez avoir lu, compris et accepté ces conditions d'utilisation.
                        </Text>
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
    acceptCard: {
        padding: theme.spacing.lg,
        marginTop: theme.spacing.xl,
        backgroundColor: `${theme.colors.primary.emerald}10`,
        borderWidth: 1,
        borderColor: `${theme.colors.primary.emerald}30`,
    },
    acceptText: {
        fontSize: 14,
        color: theme.colors.text.primary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default TermsScreen;