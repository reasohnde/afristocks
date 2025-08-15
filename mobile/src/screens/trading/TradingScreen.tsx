// src/screens/trading/TradingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../../components/common/GlassContainer';
import { theme } from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const TradingScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('market');
  const [selectedStock, setSelectedStock] = useState('AFRI001');
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const stocks = [
    {
      id: 'AFRI001',
      name: 'TechFinance Rwanda',
      price: 150,
      change: 5.2,
      volume: 12500,
    },
    {
      id: 'AFRI002',
      name: 'AgroTech Kenya',
      price: 85,
      change: -2.1,
      volume: 8900,
    },
    {
      id: 'AFRI003',
      name: 'HealthPlus Nigeria',
      price: 200,
      change: 8.5,
      volume: 15600,
    },
  ];

  const orderBook = {
    buy: [
      { price: 149, quantity: 100 },
      { price: 148, quantity: 250 },
      { price: 147, quantity: 150 },
      { price: 146, quantity: 300 },
    ],
    sell: [
      { price: 151, quantity: 120 },
      { price: 152, quantity: 180 },
      { price: 153, quantity: 200 },
      { price: 154, quantity: 150 },
    ],
  };

  const selectedStockData = stocks.find(s => s.id === selectedStock);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trading</Text>
          <TouchableOpacity
            style={styles.learnButton}
            onPress={() => navigation.navigate('LearnTrading')}
          >
            <Ionicons name="school" size={20} color={theme.colors.primary.emerald} />
            <Text style={styles.learnButtonText}>Apprendre</Text>
          </TouchableOpacity>
        </View>

        {/* Market Overview */}
        <View style={styles.marketOverview}>
          <Text style={styles.sectionTitle}>Marché secondaire</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stocks.map((stock) => (
              <TouchableOpacity
                key={stock.id}
                onPress={() => setSelectedStock(stock.id)}
              >
                <GlassContainer 
                  style={[
                    styles.stockCard,
                    selectedStock === stock.id && styles.selectedStockCard
                  ]}
                  variant="liquid"
                  animated
                >
                  <Text style={styles.stockId}>{stock.id}</Text>
                  <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                  <Text style={styles.stockPrice}>{stock.price} XOF</Text>
                  <View style={[
                    styles.changeContainer,
                    stock.change > 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    <Ionicons 
                      name={stock.change > 0 ? "trending-up" : "trending-down"} 
                      size={14} 
                      color={stock.change > 0 ? theme.colors.status.success : theme.colors.status.error} 
                    />
                    <Text style={[
                      styles.changeText,
                      { color: stock.change > 0 ? theme.colors.status.success : theme.colors.status.error }
                    ]}>
                      {Math.abs(stock.change)}%
                    </Text>
                  </View>
                </GlassContainer>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chart */}
        <GlassContainer style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {selectedStockData?.name} - Évolution du prix
          </Text>
          <LineChart
            data={{
              labels: ['9h', '10h', '11h', '12h', '13h', '14h'],
              datasets: [{
                data: [145, 148, 146, 149, 147, 150],
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
                r: "4",
                strokeWidth: "2",
                stroke: theme.colors.primary.emerald
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
          />
        </GlassContainer>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'market' && styles.activeTab]}
            onPress={() => setActiveTab('market')}
          >
            <Text style={[styles.tabText, activeTab === 'market' && styles.activeTabText]}>
              Marché
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'order' && styles.activeTab]}
            onPress={() => setActiveTab('order')}
          >
            <Text style={[styles.tabText, activeTab === 'order' && styles.activeTabText]}>
              Passer un ordre
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
              Mes ordres
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'market' && (
          <View style={styles.tabContent}>
            {/* Order Book */}
            <Text style={styles.sectionTitle}>Carnet d'ordres</Text>
            <View style={styles.orderBook}>
              <View style={styles.orderBookColumn}>
                <Text style={styles.orderBookHeader}>Achat</Text>
                {orderBook.buy.map((order, index) => (
                  <GlassContainer key={index} style={styles.orderRow}>
                    <Text style={styles.orderQuantity}>{order.quantity}</Text>
                    <Text style={[styles.orderPrice, { color: theme.colors.status.success }]}>
                      {order.price} XOF
                    </Text>
                  </GlassContainer>
                ))}
              </View>
              <View style={styles.orderBookColumn}>
                <Text style={styles.orderBookHeader}>Vente</Text>
                {orderBook.sell.map((order, index) => (
                  <GlassContainer key={index} style={styles.orderRow}>
                    <Text style={[styles.orderPrice, { color: theme.colors.status.error }]}>
                      {order.price} XOF
                    </Text>
                    <Text style={styles.orderQuantity}>{order.quantity}</Text>
                  </GlassContainer>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'order' && (
          <View style={styles.tabContent}>
            <GlassContainer style={styles.orderForm}>
              {/* Order Type */}
              <View style={styles.orderTypeContainer}>
                <TouchableOpacity
                  style={[styles.orderTypeButton, orderType === 'buy' && styles.buyButton]}
                  onPress={() => setOrderType('buy')}
                >
                  <Text style={[styles.orderTypeText, orderType === 'buy' && styles.activeOrderTypeText]}>
                    Acheter
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.orderTypeButton, orderType === 'sell' && styles.sellButton]}
                  onPress={() => setOrderType('sell')}
                >
                  <Text style={[styles.orderTypeText, orderType === 'sell' && styles.activeOrderTypeText]}>
                    Vendre
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Action</Text>
                <View style={styles.selectedStock}>
                  <Text style={styles.selectedStockText}>
                    {selectedStockData?.name} ({selectedStock})
                  </Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quantité</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Prix limite (XOF)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="numeric"
                />
              </View>

              {/* Summary */}
              {quantity && price && (
                <View style={styles.orderSummary}>
                  <Text style={styles.summaryLabel}>Montant total</Text>
                  <Text style={styles.summaryValue}>
                    {(parseFloat(quantity) * parseFloat(price)).toLocaleString()} XOF
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.submitButton}>
                <LinearGradient
                  colors={orderType === 'buy' 
                    ? [theme.colors.status.success, '#059669']
                    : [theme.colors.status.error, '#DC2626']
                  }
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {orderType === 'buy' ? 'Passer ordre d\'achat' : 'Passer ordre de vente'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassContainer>
          </View>
        )}

        {activeTab === 'portfolio' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Ordres en cours</Text>
            <GlassContainer style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyStateText}>Aucun ordre en cours</Text>
              <Text style={styles.emptyStateSubtext}>
                Vos ordres actifs apparaîtront ici
              </Text>
            </GlassContainer>
          </View>
        )}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  learnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  learnButtonText: {
    fontSize: 14,
    color: theme.colors.primary.emerald,
    fontWeight: '600',
  },
  marketOverview: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  stockCard: {
    width: 140,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.lg,
    marginRight: theme.spacing.sm,
  },
  selectedStockCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary.emerald,
  },
  stockId: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  positiveChange: {
    backgroundColor: `${theme.colors.status.success}20`,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  negativeChange: {
    backgroundColor: `${theme.colors.status.error}20`,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
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
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  orderBook: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  orderBookColumn: {
    flex: 1,
  },
  orderBookHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  orderQuantity: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderForm: {
    padding: theme.spacing.lg,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
  },
  buyButton: {
    backgroundColor: `${theme.colors.status.success}20`,
  },
  sellButton: {
    backgroundColor: `${theme.colors.status.error}20`,
  },
  orderTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
  },
  activeOrderTypeText: {
    color: theme.colors.text.primary,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  selectedStock: {
    backgroundColor: theme.colors.glass.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  selectedStockText: {
    fontSize: 16,
    color: theme.colors.text.primary,
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
  orderSummary: {
    backgroundColor: theme.colors.glass.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  submitButton: {
    marginTop: theme.spacing.md,
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
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
});

export default TradingScreen;