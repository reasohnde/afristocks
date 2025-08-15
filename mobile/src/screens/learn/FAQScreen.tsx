// src/screens/learn/FAQScreen.tsx - Updated
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '@/components/common/GlassContainer';
import { theme } from '@/styles/theme';

interface Props {
    navigation: any;
}

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

export const FAQScreen: React.FC<Props> = ({ navigation }) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const faqData: FAQItem[] = [
        {
            id: 1,
            question: 'Comment investir dans une startup ?',
            answer: 'Pour investir dans une startup, vous devez d\'abord créer un compte, vérifier votre identité, puis parcourir les startups disponibles et effectuer votre investissement.',
        },
        {
            id: 2,
            question: 'Quels sont les risques d\'investissement ?',
            answer: 'L\'investissement dans les startups présente des risques élevés. Il est possible de perdre tout ou partie de votre investissement. Diversifiez vos investissements pour réduire les risques.',
        },
        {
            id: 3,
            question: 'Comment fonctionne le trading ?',
            answer: 'Le trading consiste à acheter et vendre des actions pour réaliser des profits. Notre plateforme vous offre des outils d\'analyse et de formation pour vous aider.',
        },
        {
            id: 4,
            question: 'Quand puis-je retirer mes gains ?',
            answer: 'Les gains peuvent être retirés selon les conditions de chaque startup. Certaines permettent des retraits immédiats, d\'autres ont des périodes de blocage.',
        },
    ];

    const toggleExpanded = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>FAQ</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>Questions fréquemment posées</Text>

                {faqData.map((item) => (
                    <TouchableOpacity key={item.id} onPress={() => toggleExpanded(item.id)}>
                        <GlassContainer style={styles.faqCard}>
                            <View style={styles.questionRow}>
                                <Text style={styles.questionText}>{item.question}</Text>
                                <Ionicons
                                    name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={theme.colors.text.tertiary}
                                />
                            </View>
                            {expandedId === item.id && (
                                <Text style={styles.answerText}>{item.answer}</Text>
                            )}
                        </GlassContainer>
                    </TouchableOpacity>
                ))}

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
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    faqCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
    },
    questionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    answerText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.md,
        lineHeight: 20,
    },
});

export default FAQScreen; 