// src/screens/wallet/WithdrawScreen.tsx
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

export const WithdrawScreen: React.FC<Props> = ({ navigation }) => {
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('bank');

    const withdrawalMethods = [
        { id: 'bank', name: 'Virement bancaire', icon: 'business', fee: '2€' },
        { id: 'mobile', name: 'Mobile Money', icon: 'phone-portrait', fee: '1€' },
        { id: 'card', name: 'Carte bancaire', icon: 'card', fee: '3€' },
    ];

    const availableBalance = 1250.50;

    const handleWithdraw = () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer un montant valide');
            return;
        }
        if (parseFloat(amount) > availableBalance) {
            Alert.alert('Erreur', 'Montant supérieur au solde disponible');
            return;
        }
        Alert.alert('Succès', 'Retrait initié avec succès');
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Retirer des fonds</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <GlassContainer style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Solde disponible</Text>
                    <Text style={styles.balanceAmount}>{availableBalance.toFixed(2)}€</Text>
                </GlassContainer>

                {/* Amount Input */}
                <GlassContainer style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Montant à retirer</Text>
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

                {/* Withdrawal Methods */}
                <Text style={styles.sectionTitle}>Méthode de retrait</Text>
                {withdrawalMethods.map((method) => (
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
                            <View style={styles.methodInfo}>
                                <Text style={[
                                    styles.methodName,
                                    selectedMethod === method.id && styles.selectedMethodText
                                ]}>
                                    {method.name}
                                </Text>
                                <Text style={styles.methodFee}>Frais: {method.fee}</Text>
                            </View>
                            {selectedMethod === method.id && (
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary.orange} />
                            )}
                        </GlassContainer>
                    </TouchableOpacity>
                ))}

                {/* Withdraw Button */}
                <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
                    <Text style={styles.withdrawButtonText}>Retirer {amount ? `${amount}€` : ''}</Text>
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
    balanceCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.primary.orange,
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
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    methodFee: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
    },
    selectedMethodText: {
        color: theme.colors.primary.orange,
        fontWeight: '600',
    },
    withdrawButton: {
        backgroundColor: theme.colors.primary.orange,
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
    },
    withdrawButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
});

export default WithdrawScreen; 