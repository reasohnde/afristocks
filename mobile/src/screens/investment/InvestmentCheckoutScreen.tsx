// src/screens/investment/InvestmentCheckoutScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useFund } from '../../contexts/FundContext';
import { useStripe } from '@stripe/stripe-react-native';
// import { useStripe } from '@stripe/stripe-react-native'; // À décommenter quand Stripe est installé

interface Props {
    navigation: any;
}

const InvestmentCheckoutScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const { fundData, addInvestment } = useFund();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const userToken = user?.token; // Add userToken

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [investmentData, setInvestmentData] = useState({
        amount: '',
        paymentMethod: 'card',
        // Informations personnelles
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        country: 'Côte d\'Ivoire',
        postalCode: '',
        // Informations KYC
        idType: 'passport',
        idNumber: '',
        dateOfBirth: '',
        occupation: '',
        sourceOfFunds: '',
        // Termes
        acceptTerms: false,
        acceptRisk: false,
    });

    const paymentMethods = [
        { id: 'card', name: 'Carte bancaire', icon: 'card', fee: '2%', available: true },
        { id: 'mobile', name: 'Mobile Money', icon: 'phone-portrait', fee: '1%', available: true },
        { id: 'bank', name: 'Virement bancaire', icon: 'business', fee: '0%', available: true },
        { id: 'crypto', name: 'Cryptomonnaie', icon: 'globe', fee: '1.5%', available: false },
    ];

    const calculateFees = () => {
        const amount = parseFloat(investmentData.amount) || 0;
        switch (investmentData.paymentMethod) {
            case 'mobile': return amount * 0.01;
            case 'crypto': return amount * 0.015;
            case 'card': return amount * 0.02;
            default: return 0;
        }
    };

    const getTotalAmount = () => {
        const amount = parseFloat(investmentData.amount) || 0;
        return amount + calculateFees();
    };

    // Remplacez la fonction validateStep par celle-ci :

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                const amount = parseFloat(investmentData.amount);
                if (!amount || amount < fundData.minInvestment) {
                    Alert.alert('Erreur', `Le montant minimum est de ${fundData.minInvestment}€`);
                    return false;
                }
                return true;

            case 2:
                if (!investmentData.fullName || !investmentData.email || !investmentData.phone) {
                    Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
                    return false;
                }
                return true;

            case 3:
                if (!investmentData.idNumber || !investmentData.dateOfBirth) {
                    Alert.alert('Erreur', 'Veuillez compléter vos informations KYC');
                    return false;
                }
                return true;

            case 4:
                // Étape 4 : Ne PAS vérifier les conditions ici, juste la méthode de paiement
                if (!investmentData.paymentMethod) {
                    Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement');
                    return false;
                }
                return true;

            case 5:
                // Étape 5 : Vérifier les conditions ici
                if (!investmentData.acceptTerms || !investmentData.acceptRisk) {
                    Alert.alert('Erreur', 'Veuillez accepter les conditions');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };
    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 5) {
                setCurrentStep(currentStep + 1);
            } else {
                // Validation finale avant paiement
                if (validateInvestmentData()) {
                    processPayment();
                }
            }
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const validateInvestmentData = () => {
        console.log('Validation des données:', investmentData);

        // Vérifier le montant
        const amount = parseFloat(investmentData.amount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Erreur', 'Le montant de l\'investissement est invalide');
            return false;
        }

        // Vérifier les informations personnelles
        if (!investmentData.fullName || !investmentData.email || !investmentData.phone) {
            Alert.alert('Erreur', 'Veuillez remplir toutes vos informations personnelles');
            return false;
        }

        // Vérifier les conditions
        if (!investmentData.acceptTerms || !investmentData.acceptRisk) {
            Alert.alert('Erreur', 'Veuillez accepter toutes les conditions');
            return false;
        }

        return true;
    };

    const processPayment = async () => {
        setIsLoading(true);
        try {
            // Simulation du paiement (remplacer par l'API réelle plus tard)
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Attendre 2 secondes

            // Ajouter l'investissement
            await addInvestment({
                userId: user?.id || 'anonymous',
                userName: investmentData.fullName,
                userEmail: investmentData.email,
                amount: parseFloat(investmentData.amount), // Utiliser le montant sans les frais pour l'instant
                status: 'completed',
                paymentMethod: investmentData.paymentMethod,
            });

            setIsLoading(false);

            Alert.alert(
                'Succès !',
                'Votre investissement a été confirmé. Vous recevrez un email de confirmation.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Retourner à l'écran du fonds
                            navigation.navigate('InvestmentFund');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Erreur de paiement:', error);
            setIsLoading(false);
            Alert.alert(
                'Erreur',
                'Le paiement a échoué. Veuillez réessayer.',
                [{ text: 'OK' }]
            );
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3, 4, 5].map((step) => (
                <View key={step} style={styles.stepContainer}>
                    <View style={[
                        styles.stepCircle,
                        currentStep >= step && styles.stepCircleActive,
                        currentStep === step && styles.stepCircleCurrent,
                    ]}>
                        <Text style={[
                            styles.stepNumber,
                            currentStep >= step && styles.stepNumberActive,
                        ]}>
                            {step}
                        </Text>
                    </View>
                    {step < 5 && (
                        <View style={[
                            styles.stepLine,
                            currentStep > step && styles.stepLineActive,
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Montant de l'investissement</Text>
                        <Text style={styles.stepSubtitle}>
                            Choisissez le montant que vous souhaitez investir
                        </Text>

                        <View style={styles.amountInputContainer}>
                            <TextInput
                                style={styles.amountInput}
                                value={investmentData.amount}
                                onChangeText={(text) => setInvestmentData({ ...investmentData, amount: text })}
                                placeholder="0"
                                placeholderTextColor={theme.colors.text.tertiary}
                                keyboardType="numeric"
                            />
                            <Text style={styles.currency}>€</Text>
                        </View>

                        <View style={styles.quickAmounts}>
                            {[500, 1000, 2500, 5000].map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    style={styles.quickAmountButton}
                                    onPress={() => setInvestmentData({ ...investmentData, amount: amount.toString() })}
                                >
                                    <Text style={styles.quickAmountText}>{amount}€</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {investmentData.amount && parseFloat(investmentData.amount) >= fundData.minInvestment && (
                            <GlassContainer style={styles.calculationCard}>
                                <View style={styles.calculationRow}>
                                    <Text style={styles.calculationLabel}>Votre investissement</Text>
                                    <Text style={styles.calculationValue}>{investmentData.amount}€</Text>
                                </View>
                                <View style={styles.calculationRow}>
                                    <Text style={styles.calculationLabel}>Part du fonds</Text>
                                    <Text style={styles.calculationValue}>
                                        {((parseFloat(investmentData.amount) / fundData.targetAmount) * 100).toFixed(2)}%
                                    </Text>
                                </View>
                                <View style={styles.calculationRow}>
                                    <Text style={styles.calculationLabel}>Retour estimé ({fundData.expectedReturn})</Text>
                                    <Text style={[styles.calculationValue, { color: theme.colors.status.success }]}>
                                        {(parseFloat(investmentData.amount) * 1.15).toFixed(0)}€ - {(parseFloat(investmentData.amount) * 1.25).toFixed(0)}€
                                    </Text>
                                </View>
                            </GlassContainer>
                        )}
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Informations personnelles</Text>
                        <Text style={styles.stepSubtitle}>
                            Ces informations sont requises pour la réglementation
                        </Text>

                        <View style={styles.form}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Nom complet *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.fullName}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, fullName: text })}
                                    placeholder="Jean Dupont"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.email}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, email: text })}
                                    placeholder="jean@example.com"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Téléphone *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.phone}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, phone: text })}
                                    placeholder="+225 0123456789"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Adresse</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.address}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, address: text })}
                                    placeholder="123 Rue Example"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.formLabel}>Ville</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={investmentData.city}
                                        onChangeText={(text) => setInvestmentData({ ...investmentData, city: text })}
                                        placeholder="Abidjan"
                                        placeholderTextColor={theme.colors.text.tertiary}
                                    />
                                </View>

                                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.formLabel}>Code postal</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={investmentData.postalCode}
                                        onChangeText={(text) => setInvestmentData({ ...investmentData, postalCode: text })}
                                        placeholder="00000"
                                        placeholderTextColor={theme.colors.text.tertiary}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Vérification KYC</Text>
                        <Text style={styles.stepSubtitle}>
                            Conformité réglementaire et lutte anti-blanchiment
                        </Text>

                        <View style={styles.form}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Type de document *</Text>
                                <View style={styles.radioGroup}>
                                    {[
                                        { id: 'passport', label: 'Passeport' },
                                        { id: 'cni', label: 'Carte d\'identité' },
                                        { id: 'permit', label: 'Permis de conduire' },
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={styles.radioOption}
                                            onPress={() => setInvestmentData({ ...investmentData, idType: option.id })}
                                        >
                                            <View style={[
                                                styles.radioCircle,
                                                investmentData.idType === option.id && styles.radioCircleActive
                                            ]}>
                                                {investmentData.idType === option.id && (
                                                    <View style={styles.radioInner} />
                                                )}
                                            </View>
                                            <Text style={styles.radioLabel}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Numéro du document *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.idNumber}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, idNumber: text })}
                                    placeholder="AB123456"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Date de naissance *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.dateOfBirth}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, dateOfBirth: text })}
                                    placeholder="JJ/MM/AAAA"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Profession</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.occupation}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, occupation: text })}
                                    placeholder="Entrepreneur"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Source des fonds</Text>
                                <TextInput
                                    style={styles.input}
                                    value={investmentData.sourceOfFunds}
                                    onChangeText={(text) => setInvestmentData({ ...investmentData, sourceOfFunds: text })}
                                    placeholder="Épargne personnelle"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                />
                            </View>
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Méthode de paiement</Text>
                        <Text style={styles.stepSubtitle}>
                            Choisissez comment vous souhaitez payer
                        </Text>

                        <View style={styles.paymentMethods}>
                            {paymentMethods.map((method) => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={[
                                        styles.paymentMethod,
                                        investmentData.paymentMethod === method.id && styles.paymentMethodActive,
                                        !method.available && styles.paymentMethodDisabled,
                                    ]}
                                    onPress={() => method.available && setInvestmentData({ ...investmentData, paymentMethod: method.id })}
                                    disabled={!method.available}
                                >
                                    <View style={styles.paymentMethodLeft}>
                                        <Ionicons
                                            name={method.icon as any}
                                            size={24}
                                            color={
                                                !method.available ? theme.colors.text.tertiary :
                                                    investmentData.paymentMethod === method.id ? theme.colors.primary.orange :
                                                        theme.colors.text.secondary
                                            }
                                        />
                                        <View style={styles.paymentMethodInfo}>
                                            <Text style={[
                                                styles.paymentMethodName,
                                                !method.available && styles.paymentMethodNameDisabled,
                                            ]}>
                                                {method.name}
                                            </Text>
                                            <Text style={styles.paymentMethodFee}>Frais: {method.fee}</Text>
                                        </View>
                                    </View>
                                    {!method.available && (
                                        <Text style={styles.comingSoon}>Bientôt</Text>
                                    )}
                                    {method.available && investmentData.paymentMethod === method.id && (
                                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary.orange} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <GlassContainer style={styles.paymentSummary}>
                            <Text style={styles.paymentSummaryTitle}>Récapitulatif</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Montant investi</Text>
                                <Text style={styles.summaryValue}>{investmentData.amount}€</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Frais de transaction</Text>
                                <Text style={styles.summaryValue}>{calculateFees().toFixed(2)}€</Text>
                            </View>
                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total à payer</Text>
                                <Text style={styles.totalValue}>{getTotalAmount().toFixed(2)}€</Text>
                            </View>
                        </GlassContainer>
                    </View>
                );

            case 5:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Conditions et confirmation</Text>
                        <Text style={styles.stepSubtitle}>
                            Veuillez lire et accepter les conditions
                        </Text>

                        <ScrollView style={styles.termsContainer}>
                            <GlassContainer style={styles.termsCard}>
                                <Text style={styles.termsTitle}>Avertissement sur les risques</Text>
                                <Text style={styles.termsText}>
                                    L'investissement dans des startups comporte des risques importants, y compris la perte totale du capital investi. Les performances passées ne garantissent pas les résultats futurs.
                                </Text>
                            </GlassContainer>

                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setInvestmentData({ ...investmentData, acceptRisk: !investmentData.acceptRisk })}
                            >
                                <View style={[styles.checkbox, investmentData.acceptRisk && styles.checkboxChecked]}>
                                    {investmentData.acceptRisk && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </View>
                                <Text style={styles.checkboxLabel}>
                                    Je comprends et accepte les risques liés à cet investissement
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setInvestmentData({ ...investmentData, acceptTerms: !investmentData.acceptTerms })}
                            >
                                <View style={[styles.checkbox, investmentData.acceptTerms && styles.checkboxChecked]}>
                                    {investmentData.acceptTerms && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </View>
                                <Text style={styles.checkboxLabel}>
                                    J'accepte les conditions générales d'utilisation et la politique de confidentialité
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <GlassContainer style={styles.finalSummary}>
                            <View style={styles.finalSummaryRow}>
                                <Text style={styles.finalSummaryLabel}>Investissement dans</Text>
                                <Text style={styles.finalSummaryValue}>{fundData.name}</Text>
                            </View>
                            <View style={styles.finalSummaryRow}>
                                <Text style={styles.finalSummaryLabel}>Montant total</Text>
                                <Text style={styles.finalSummaryAmount}>{getTotalAmount().toFixed(2)}€</Text>
                            </View>
                        </GlassContainer>
                    </View>
                );

            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return 'Montant';
            case 2: return 'Informations';
            case 3: return 'Vérification';
            case 4: return 'Paiement';
            case 5: return 'Confirmation';
            default: return '';
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Investir - {getStepTitle()}</Text>
                    <TouchableOpacity style={styles.helpButton}>
                        <Ionicons name="help-circle-outline" size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Progress */}
                {renderStepIndicator()}

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {renderStepContent()}
                </ScrollView>

                {/* Bottom Actions */}
                <View style={styles.bottomActions}>
                    {currentStep > 1 && (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handlePreviousStep}
                        >
                            <Text style={styles.secondaryButtonText}>Retour</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleNextStep}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[theme.colors.primary.orange, theme.colors.primary.amber]}
                            style={styles.primaryButtonGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>
                                        {currentStep === 5 ? 'Confirmer et payer' : 'Continuer'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    helpButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIndicator: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    stepContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.glass.border,
    },
    stepCircleActive: {
        backgroundColor: theme.colors.primary.orange,
        borderColor: theme.colors.primary.orange,
    },
    stepCircleCurrent: {
        borderColor: theme.colors.primary.orange,
        backgroundColor: 'transparent',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.tertiary,
    },
    stepNumberActive: {
        color: 'white',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: theme.colors.glass.border,
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: theme.colors.primary.orange,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    stepContent: {
        marginBottom: theme.spacing.xl,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    stepSubtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xl,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    amountInput: {
        flex: 1,
        fontSize: 48,
        fontWeight: '700',
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
    currency: {
        fontSize: 32,
        color: theme.colors.text.secondary,
        marginLeft: theme.spacing.sm,
    },
    quickAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },
    quickAmountButton: {
        flex: 1,
        backgroundColor: theme.colors.glass.light,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginHorizontal: 4,
    },
    quickAmountText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    calculationCard: {
        padding: theme.spacing.lg,
    },
    calculationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    calculationLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    calculationValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    formGroup: {
        marginBottom: theme.spacing.lg,
    },
    formRow: {
        flexDirection: 'row',
    },
    formLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
        fontWeight: '500',
    },
    input: {
        backgroundColor: theme.colors.glass.light,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.glass.border,
        marginRight: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleActive: {
        borderColor: theme.colors.primary.orange,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary.orange,
    },
    radioLabel: {
        fontSize: 14,
        color: theme.colors.text.primary,
    },
    paymentMethods: {
        marginBottom: theme.spacing.xl,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.glass.light,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentMethodActive: {
        borderColor: theme.colors.primary.orange,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
    },
    paymentMethodDisabled: {
        opacity: 0.5,
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    paymentMethodInfo: {
        gap: 2,
    },
    paymentMethodName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    paymentMethodNameDisabled: {
        color: theme.colors.text.tertiary,
    },
    paymentMethodFee: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
    },
    comingSoon: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
        fontStyle: 'italic',
    },
    paymentSummary: {
        padding: theme.spacing.lg,
    },
    paymentSummaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    summaryValue: {
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.glass.border,
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.sm,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary.orange,
    },
    termsContainer: {
        maxHeight: 300,
        marginBottom: theme.spacing.xl,
    },
    termsCard: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    termsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    termsText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.lg,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 2,
        borderColor: theme.colors.glass.border,
        marginRight: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: theme.colors.primary.orange,
        borderColor: theme.colors.primary.orange,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },
    finalSummary: {
        padding: theme.spacing.lg,
    },
    finalSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    finalSummaryLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    finalSummaryValue: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
    finalSummaryAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary.orange,
    },
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 30 : theme.spacing.lg,
        backgroundColor: theme.colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.glass.border,
        gap: theme.spacing.md,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: theme.colors.glass.light,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    primaryButton: {
        flex: 2,
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});

export default InvestmentCheckoutScreen;