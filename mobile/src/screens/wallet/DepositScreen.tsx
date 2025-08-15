// src/screens/wallet/DepositScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '@/components/common/GlassContainer';
import { theme } from '@/styles/theme';

interface Props {
    navigation: any;
}

export const DepositScreen: React.FC<Props> = ({ navigation }) => {
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('card');

    const paymentMethods = [
        { id: 'card', name: 'Carte bancaire', icon: 'card' },
        { id: 'mobile', name: 'Mobile Money', icon: 'phone-portrait' },
        { id: 'bank', name: 'Virement bancaire', icon: 'business' },
    ];

    const handleDeposit = () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer un montant valide');
            return;
        }
        Alert.alert('Succès', 'Dépôt initié avec succès');
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Déposer des fonds</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Amount Input */}
                <GlassContainer style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Montant à déposer</Text>
                    <View style={styles.amountInput}>
                        <Text style={styles.currencySymbol}>€</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            placeholderTextColor={theme.colors.text.tertiary}
                            keyboardType="numeric"
                        />
                    </View>
                </GlassContainer>

                {/* Payment Methods */}
                <Text style={styles.sectionTitle}>Méthode de paiement</Text>
                {paymentMethods.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        onPress={() => setSelectedMethod(method.id)}
                    >
                        <GlassContainer style={[
                            styles.methodCard,
                            selectedMethod === method.id && styles.selectedMethod
                        ]}>
                            <View style={styles.methodIcon}>
                                <Ionicons
                                    name={method.icon as any}
                                    size={24}
                                    color={selectedMethod === method.id ? theme.colors.primary.orange : theme.colors.text.secondary}
                                />
                            </View>
                            <Text style={[
                                styles.methodName,
                                selectedMethod === method.id && styles.selectedMethodText
                            ]}>
                                {method.name}
                            </Text>
                            {selectedMethod === method.id && (
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary.orange} />
                            )}
                        </GlassContainer>
                    </TouchableOpacity>
                ))}

                {/* Deposit Button */}
                <TouchableOpacity style={styles.depositButton} onPress={handleDeposit}>
                    <Text style={styles.depositButtonText}>Déposer {amount ? `${amount}€` : ''}</Text>
                </TouchableOpacity>

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
    amountCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.lg,
    },
    amountLabel: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.md,
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
    },
    selectedMethod: {
        borderColor: theme.colors.primary.orange,
        borderWidth: 2,
    },
    methodIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    methodName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.text.primary,
    },
    selectedMethodText: {
        color: theme.colors.primary.orange,
        fontWeight: '600',
    },
    depositButton: {
        backgroundColor: theme.colors.primary.orange,
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
    },
    depositButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
});

export default DepositScreen; 