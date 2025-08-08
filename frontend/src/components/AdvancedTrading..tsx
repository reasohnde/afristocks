// frontend/src/components/AdvancedTrading.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

// Types pour TypeScript
interface Startup {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
}

interface OrderForm {
  side: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  stopPrice: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface Trade {
  startupId: string;
  price: number;
  quantity: number;
  timestamp: number;
}

const AdvancedTrading = ({ startup }: { startup: Startup }) => {
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP' | 'OCO'>('LIMIT');
  const [orderForm, setOrderForm] = useState<OrderForm>({
    side: 'BUY',
    quantity: '',
    price: '',
    stopPrice: ''
  });
  const [orderBook, setOrderBook] = useState<OrderBook>({
    bids: [
      { price: 104.50, quantity: 1000, total: 104500 },
      { price: 104.45, quantity: 2000, total: 208900 },
      { price: 104.40, quantity: 1500, total: 156600 },
      { price: 104.35, quantity: 3000, total: 313050 },
      { price: 104.30, quantity: 2500, total: 260750 }
    ],
    asks: [
      { price: 105.50, quantity: 1000, total: 105500 },
      { price: 105.55, quantity: 2000, total: 211100 },
      { price: 105.60, quantity: 1500, total: 158400 },
      { price: 105.65, quantity: 3000, total: 316950 },
      { price: 105.70, quantity: 2500, total: 264250 }
    ]
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedInterval, setSelectedInterval] = useState('1h');
  const [showToastMessage, setShowToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [wsMessages, setWsMessages] = useState<any[]>([]);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Configuration WebSocket
  const { socket, connected, send } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  });

  // Gestion des messages WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'orderbook:update' && data.startupId === startup.id) {
          setOrderBook(data.orderBook);
        } else if (data.type === 'trade:new' && data.startupId === startup.id) {
          updateChart(data.trade);
        }
      } catch (error) {
        console.error('Erreur parsing message WebSocket:', error);
      }
    };

    const handleOpen = () => {
      console.log('WebSocket connecté');
      // S'abonner aux mises à jour pour cette startup
      send({
        type: 'subscribe',
        channel: `startup:${startup.id}`
      });
    };

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('open', handleOpen);

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('open', handleOpen);
    };
  }, [socket, startup.id, send]);

  // Fonction pour afficher les toasts
  const showToast = (message: string, type: 'success' | 'error') => {
    setShowToastMessage({ message, type });
    setTimeout(() => setShowToastMessage(null), 3000);
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setOrderForm({
      side: 'BUY',
      quantity: '',
      price: '',
      stopPrice: ''
    });
  };

  // Charger les données du graphique (simulé)
  const loadChartData = async () => {
    try {
      const response = await fetch(`/api/trading/chart/${startup.id}?interval=${selectedInterval}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du graphique:', error);
    }
  };

  // Mettre à jour le graphique avec les nouvelles transactions
  const updateChart = (trade: Trade) => {
    // Mise à jour simple des données du graphique
    setChartData(prevData => {
      const newData = [...prevData];
      // Logique pour ajouter la nouvelle transaction aux données
      return newData;
    });
  };

  useEffect(() => {
    // Charger les données initiales
    loadChartData();

    // Cleanup: se désabonner lors du démontage
    return () => {
      if (connected && send) {
        send({
          type: 'unsubscribe',
          channel: `startup:${startup.id}`
        });
      }
    };
  }, [startup.id, selectedInterval, connected, send]);

  const submitOrder = async () => {
    // Validation basique
    if (!orderForm.quantity) {
      showToast('Veuillez entrer une quantité', 'error');
      return;
    }

    if (orderType !== 'MARKET' && !orderForm.price) {
      showToast('Veuillez entrer un prix', 'error');
      return;
    }

    try {
      const response = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startupId: startup.id,
          orderType,
          ...orderForm
        })
      });

      if (response.ok) {
        const order = await response.json();
        showToast('Ordre placé avec succès', 'success');
        resetForm();
      } else {
        const error = await response.json();
        showToast(error.message || 'Erreur lors du placement de l\'ordre', 'error');
      }
    } catch (error) {
      showToast('Erreur lors du placement de l\'ordre', 'error');
    }
  };

  // Graphique simple en SVG (alternative à lightweight-charts)
  const SimpleChart = () => {
    const width = 800;
    const height = 400;
    const padding = 40;

    // Données simulées pour la démo
    const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;

    const xScale = (i: number) => (i / (prices.length - 1)) * (width - 2 * padding) + padding;
    const yScale = (price: number) => height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);

    const pathData = prices
      .map((price, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(price)}`)
      .join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grille */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`h-${i}`}
            x1={padding}
            y1={padding + i * (height - 2 * padding) / 4}
            x2={width - padding}
            y2={padding + i * (height - 2 * padding) / 4}
            stroke="rgba(255,255,255,0.1)"
          />
        ))}

        {/* Ligne de prix */}
        <path
          d={pathData}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* Zone sous la courbe */}
        <path
          d={`${pathData} L ${xScale(prices.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`}
          fill="rgba(16, 185, 129, 0.1)"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Toast notification */}
      {showToastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white ${showToastMessage.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
          {showToastMessage.message}
        </div>
      )}

      {/* Graphique principal */}
      <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">{startup.name}</h3>
          <div className="flex gap-2">
            {['1m', '5m', '15m', '1h', '1d'].map(interval => (
              <button
                key={interval}
                onClick={() => setSelectedInterval(interval)}
                className={`px-3 py-1 rounded text-sm transition-all ${selectedInterval === interval
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
              >
                {interval}
              </button>
            ))}
            {/* Indicateurs de connexion WebSocket */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-xs text-white/60">{connected ? 'Connecté' : 'Déconnecté'}</span>
            </div>
          </div>
        </div>

        <div ref={chartContainerRef} className="w-full h-[400px] bg-white/5 rounded-lg overflow-hidden">
          <SimpleChart />
        </div>

        {/* Indicateurs techniques */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60">RSI (14)</p>
            <p className="text-lg font-semibold text-white">52.3</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60">MACD</p>
            <p className="text-lg font-semibold text-emerald-400">Haussier</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60">Volume (24h)</p>
            <p className="text-lg font-semibold text-white">1.2M</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60">Volatilité</p>
            <p className="text-lg font-semibold text-amber-400">Moyenne</p>
          </div>
        </div>
      </div>

      {/* Panel de trading */}
      <div className="space-y-6">
        {/* Formulaire d'ordre */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Passer un ordre</h3>

          {/* Type d'ordre */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(['MARKET', 'LIMIT', 'STOP', 'OCO'] as const).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${orderType === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white/60 hover:text-white'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Side */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setOrderForm({ ...orderForm, side: 'BUY' })}
              className={`py-3 rounded-lg font-medium transition-all ${orderForm.side === 'BUY'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-white/60'
                }`}
            >
              Acheter
            </button>
            <button
              onClick={() => setOrderForm({ ...orderForm, side: 'SELL' })}
              className={`py-3 rounded-lg font-medium transition-all ${orderForm.side === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/60'
                }`}
            >
              Vendre
            </button>
          </div>

          {/* Champs du formulaire */}
          {orderType !== 'MARKET' && (
            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-1">Prix limite</label>
              <input
                type="number"
                value={orderForm.price}
                onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                placeholder="0.00"
              />
            </div>
          )}

          {(orderType === 'STOP' || orderType === 'OCO') && (
            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-1">Stop prix</label>
              <input
                type="number"
                value={orderForm.stopPrice}
                onChange={(e) => setOrderForm({ ...orderForm, stopPrice: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                placeholder="0.00"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-1">Quantité</label>
            <input
              type="number"
              value={orderForm.quantity}
              onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              placeholder="0"
            />
          </div>

          <button
            onClick={submitOrder}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${orderForm.side === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-red-500 hover:bg-red-600'
              } text-white`}
          >
            {orderForm.side === 'BUY' ? 'Acheter' : 'Vendre'} {startup.symbol}
          </button>
        </div>

        {/* Carnet d'ordres */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Carnet d'ordres</h3>

          <div className="space-y-2">
            {/* Asks */}
            <div className="space-y-1">
              {orderBook.asks.slice(0, 5).reverse().map((ask, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-red-400">{ask.price.toFixed(2)}</span>
                  <span className="text-white/60">{ask.quantity}</span>
                  <span className="text-white/40">{ask.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Prix actuel */}
            <div className="border-y border-white/20 py-2 my-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">${startup.currentPrice.toFixed(2)}</p>
                <p className="text-sm text-emerald-400">+2.5%</p>
              </div>
            </div>

            {/* Bids */}
            <div className="space-y-1">
              {orderBook.bids.slice(0, 5).map((bid, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-emerald-400">{bid.price.toFixed(2)}</span>
                  <span className="text-white/60">{bid.quantity}</span>
                  <span className="text-white/40">{bid.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTrading;