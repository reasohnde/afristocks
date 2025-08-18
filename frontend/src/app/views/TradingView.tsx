import React, { useState } from 'react';
import { BackButton } from '../components/BackButton';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertCircle, Clock, DollarSign, Activity, BarChart3, Info } from 'lucide-react';

interface TradingViewProps {
  isAuthenticated: boolean;
  user: any;
  setActiveView: (view: string) => void;
}

const TradingView: React.FC<TradingViewProps> = ({ isAuthenticated, user, setActiveView }) => {
  const [selectedStartupId, setSelectedStartupId] = useState(1);
  const [orderType, setOrderType] = useState('market');
  const [tradeType, setTradeType] = useState('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  // Données des startups pour le trading
  const tradableStartups = [
    {
      id: 1,
      name: 'AgroTech Solutions',
      symbol: 'AGRO',
      currentPrice: 100,
      change: 2.5,
      changeValue: 2.44,
      volume24h: 12458,
      high24h: 102,
      low24h: 97,
      marketCap: 2500000
    },
    {
      id: 2,
      name: 'MediConnect Africa',
      symbol: 'MEDI',
      currentPrice: 250,
      change: -1.2,
      changeValue: -3.04,
      volume24h: 8234,
      high24h: 255,
      low24h: 248,
      marketCap: 5000000
    },
    {
      id: 3,
      name: 'EduSmart',
      symbol: 'EDU',
      currentPrice: 175,
      change: 3.8,
      changeValue: 6.41,
      volume24h: 15672,
      high24h: 178,
      low24h: 168,
      marketCap: 3500000
    },
    {
      id: 4,
      name: 'SolarPower SA',
      symbol: 'SOLAR',
      currentPrice: 400,
      change: 5.2,
      changeValue: 19.81,
      volume24h: 6789,
      high24h: 405,
      low24h: 380,
      marketCap: 8000000
    }
  ];

  const selectedStartup = tradableStartups.find(s => s.id === selectedStartupId) || tradableStartups[0];

  // Carnet d'ordres simulé
  const orderBook = {
    buy: [
      { price: selectedStartup.currentPrice - 1, quantity: 150, total: (selectedStartup.currentPrice - 1) * 150 },
      { price: selectedStartup.currentPrice - 2, quantity: 200, total: (selectedStartup.currentPrice - 2) * 200 },
      { price: selectedStartup.currentPrice - 3, quantity: 300, total: (selectedStartup.currentPrice - 3) * 300 },
      { price: selectedStartup.currentPrice - 4, quantity: 175, total: (selectedStartup.currentPrice - 4) * 175 },
      { price: selectedStartup.currentPrice - 5, quantity: 250, total: (selectedStartup.currentPrice - 5) * 250 }
    ],
    sell: [
      { price: selectedStartup.currentPrice + 1, quantity: 125, total: (selectedStartup.currentPrice + 1) * 125 },
      { price: selectedStartup.currentPrice + 2, quantity: 180, total: (selectedStartup.currentPrice + 2) * 180 },
      { price: selectedStartup.currentPrice + 3, quantity: 220, total: (selectedStartup.currentPrice + 3) * 220 },
      { price: selectedStartup.currentPrice + 4, quantity: 150, total: (selectedStartup.currentPrice + 4) * 150 },
      { price: selectedStartup.currentPrice + 5, quantity: 300, total: (selectedStartup.currentPrice + 5) * 300 }
    ]
  };

  // Transactions récentes simulées
  const recentTrades = [
    { time: '14:32', type: 'buy', price: selectedStartup.currentPrice, quantity: 50 },
    { time: '14:28', type: 'sell', price: selectedStartup.currentPrice + 1, quantity: 30 },
    { time: '14:25', type: 'buy', price: selectedStartup.currentPrice - 1, quantity: 75 },
    { time: '14:21', type: 'buy', price: selectedStartup.currentPrice - 1, quantity: 100 },
    { time: '14:18', type: 'sell', price: selectedStartup.currentPrice + 2, quantity: 45 }
  ];

  const calculateTotal = () => {
    const p = orderType === 'market' ? selectedStartup.currentPrice : (parseFloat(price) || 0);
    const q = parseFloat(quantity) || 0;
    const subtotal = p * q;
    const fees = subtotal * 0.005; // 0.5% de frais
    return {
      price: p,
      subtotal,
      fees,
      total: subtotal + fees
    };
  };

  const { price: orderPrice, subtotal, fees, total } = calculateTotal();

  // Glass Card Component
  interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
  }

  const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
    <div className={`relative backdrop-blur-xl rounded-2xl border border-white/20 p-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}>
      {children}
    </div>
  );

  const PriceChart = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const prices = hours.map(h => ({
      hour: h,
      price: selectedStartup.currentPrice + (Math.random() - 0.5) * 10
    }));

    const maxPrice = Math.max(...prices.map(p => p.price));
    const minPrice = Math.min(...prices.map(p => p.price));


    // Ajouter dans TradingView.tsx
    interface OrderConfirmationModalProps {
      isOpen: boolean;
      onClose: () => void;
      orderDetails: any;
      onConfirm: () => void;
    }

    const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, onClose, orderDetails, onConfirm }) => {
      const [isProcessing, setIsProcessing] = useState(false);

      if (!isOpen) return null;

      const handleConfirm = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert(`Ordre ${orderDetails.type} de ${orderDetails.quantity} actions exécuté !`);
        setIsProcessing(false);
        onClose();
      };

      return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              Confirmer l'ordre {orderDetails.type === 'buy' ? 'd\'achat' : 'de vente'}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-white/60">Startup</p>
                <p className="text-lg font-semibold text-white">{orderDetails.startup}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-white/60">Prix unitaire</p>
                  <p className="text-lg font-semibold text-white">{orderDetails.price} XOF</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-white/60">Quantité</p>
                  <p className="text-lg font-semibold text-white">{orderDetails.quantity}</p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <p className="text-sm text-white/60">Total avec frais</p>
                <p className="text-2xl font-bold text-orange-400">
                  {orderDetails.total.toLocaleString()} XOF
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                disabled={isProcessing}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 rounded-xl transition-all text-white font-semibold disabled:opacity-50 ${orderDetails.type === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                  }`}
                disabled={isProcessing}
              >
                {isProcessing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      );
    };

    // Ajouter dans le JSX
    {
      showOrderConfirmation && (
        <OrderConfirmationModal
          isOpen={showOrderConfirmation}
          onClose={() => setShowOrderConfirmation(false)}
          orderDetails={{
            type: tradeType,
            startup: selectedStartup.name,
            price: orderPrice,
            quantity: parseFloat(quantity) || 0,
            total
          }}
          onConfirm={() => { }}
        />
      )
    }

    return (
      <svg viewBox="0 0 300 150" className="w-full h-40">
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={selectedStartup.change > 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={selectedStartup.change > 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grille */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="0"
            y1={30 + i * 30}
            x2="300"
            y2={30 + i * 30}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Ligne de prix */}
        <path
          d={`M ${prices.map((p, i) => `${i * 12.5},${150 - ((p.price - minPrice) / (maxPrice - minPrice)) * 120 - 15}`).join(' L ')}`}
          fill="none"
          stroke={selectedStartup.change > 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
          strokeWidth="2"
        />

        {/* Zone remplie */}
        <path
          d={`M 0,150 L ${prices.map((p, i) => `${i * 12.5},${150 - ((p.price - minPrice) / (maxPrice - minPrice)) * 120 - 15}`).join(' L ')} L 300,150`}
          fill="url(#priceGradient)"
        />
      </svg>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="text-center max-w-md">
          <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connectez-vous pour trader</h2>
          <p className="text-white/60 mb-6">Accédez au marché et tradez des actions de startups</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Trading</h1>
        <p className="text-white/60 text-lg">Achetez et vendez des actions de startups africaines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partie gauche - Graphiques et carnet d'ordres */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sélection de la startup et infos */}
          <GlassCard>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <select
                value={selectedStartupId}
                onChange={(e) => setSelectedStartupId(Number(e.target.value))}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white backdrop-blur appearance-none cursor-pointer"
              >
                {tradableStartups.map(startup => (
                  <option key={startup.id} value={startup.id} className="bg-slate-900">
                    {startup.name} ({startup.symbol})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-white/60">Prix actuel</p>
                  <p className="text-2xl font-bold text-white">{selectedStartup.currentPrice} XOF</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">Variation 24h</p>
                  <p className={`text-xl font-bold flex items-center gap-1 ${selectedStartup.change > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {selectedStartup.change > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    {Math.abs(selectedStartup.change)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Graphique */}
            <PriceChart />

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-xs text-white/50">Volume 24h</p>
                <p className="text-sm font-semibold text-white">{selectedStartup.volume24h.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Plus haut 24h</p>
                <p className="text-sm font-semibold text-white">{selectedStartup.high24h} XOF</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Plus bas 24h</p>
                <p className="text-sm font-semibold text-white">{selectedStartup.low24h} XOF</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Cap. marché</p>
                <p className="text-sm font-semibold text-white">{(selectedStartup.marketCap / 1000000).toFixed(1)}M XOF</p>
              </div>
            </div>
          </GlassCard>

          {/* Carnet d'ordres */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">Carnet d'ordres</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Ordres d'achat */}
              <div>
                <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  Ordres d'achat
                </h3>
                <div className="space-y-2">
                  {orderBook.buy.map((order, i) => (
                    <div key={i} className="flex justify-between text-sm bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                      <span className="text-white/70">{order.price} XOF</span>
                      <span className="text-white font-medium">{order.quantity}</span>
                      <span className="text-white/50">{order.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ordres de vente */}
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  Ordres de vente
                </h3>
                <div className="space-y-2">
                  {orderBook.sell.map((order, i) => (
                    <div key={i} className="flex justify-between text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                      <span className="text-white/70">{order.price} XOF</span>
                      <span className="text-white font-medium">{order.quantity}</span>
                      <span className="text-white/50">{order.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Historique des transactions */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">Dernières transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-medium text-white/60 uppercase pb-3">Heure</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase pb-3">Type</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase pb-3">Prix</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase pb-3">Quantité</th>
                    <th className="text-left text-xs font-medium text-white/60 uppercase pb-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentTrades.map((transaction, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-sm text-white/70">{transaction.time}</td>
                      <td className="py-3">
                        <span className={`text-sm font-medium ${transaction.type === 'buy' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                          {transaction.type === 'buy' ? 'Achat' : 'Vente'}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-white">{transaction.price} XOF</td>
                      <td className="py-3 text-sm text-white">{transaction.quantity}</td>
                      <td className="py-3 text-sm font-medium text-white">
                        {(transaction.price * transaction.quantity).toLocaleString()} XOF
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Partie droite - Panneau de trading */}
        <div className="lg:col-span-1">
          <GlassCard className="sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-6">Passer un ordre</h2>

            {/* Onglets Acheter/Vendre */}
            <div className="flex mb-6 p-1 bg-white/10 rounded-xl">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${tradeType === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                Acheter
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${tradeType === 'sell'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                Vendre
              </button>
            </div>

            <div className="space-y-4">
              {/* Type d'ordre */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Type d'ordre</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white backdrop-blur appearance-none cursor-pointer"
                >
                  <option value="market" className="bg-slate-900">Ordre au marché</option>
                  <option value="limit" className="bg-slate-900">Ordre limite</option>
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Prix par action
                  {orderType === 'market' && (
                    <span className="text-xs text-white/50 ml-2">(Prix du marché)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={orderType === 'market' ? selectedStartup.currentPrice : price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={selectedStartup.currentPrice.toString()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white placeholder-white/40 backdrop-blur"
                  disabled={orderType === 'market'}
                />
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Quantité</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 text-white placeholder-white/40 backdrop-blur"
                />
              </div>

              {/* Récapitulatif */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Sous-total</span>
                  <span className="text-white">{subtotal.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Frais (0.5%)</span>
                  <span className="text-white">{fees.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-3 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-white">{total.toLocaleString()} XOF</span>
                </div>
              </div>

              {/* Solde disponible */}
              <div className="text-center">
                <p className="text-sm text-white/60">
                  Solde disponible: <span className="font-semibold text-white">{(user?.balance || 0).toLocaleString()} XOF</span>
                </p>
              </div>

              {/* Bouton de confirmation */}
              <button
                onClick={() => setShowOrderConfirmation(true)}
                disabled={!quantity || parseFloat(quantity) <= 0}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${tradeType === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                  } text-white`}
              >
                Confirmer {tradeType === 'buy' ? 'l\'achat' : 'la vente'}
              </button>
            </div>

            {/* Avertissement */}
            <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-amber-400">Avertissement</p>
                  <p className="text-xs text-white/60 mt-1">
                    Le trading comporte des risques. Investissez prudemment et ne risquez que ce que vous pouvez vous permettre de perdre.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TradingView;