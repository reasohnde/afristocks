import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Activity, DollarSign,
    BarChart3, Clock, AlertCircle, ChevronUp, ChevronDown,
    Plus, Minus, RefreshCw
} from 'lucide-react';
import OrderBook from '../trading/OrderBook';
import TradingChart from '../trading/TradingChart';
import OrderForm from '../trading/OrderForm';

interface Props {
    isAuthenticated: boolean;
    user: any;
}

const TradingView: React.FC<Props> = ({ isAuthenticated, user }) => {
    const [selectedStock, setSelectedStock] = useState('AGRO');
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [refreshKey, setRefreshKey] = useState(0);

    // Données mockées pour les actions
    const stocks = [
        {
            symbol: 'AGRO',
            name: 'AgroTech Solutions',
            price: 125.50,
            change: 5.25,
            changePercent: 4.37,
            volume: 15420,
            high: 127.00,
            low: 119.80
        },
        {
            symbol: 'TFIN',
            name: 'TechFinance Rwanda',
            price: 89.75,
            change: -2.10,
            changePercent: -2.29,
            volume: 8930,
            high: 92.50,
            low: 88.00
        },
        {
            symbol: 'HLTH',
            name: 'HealthPlus Africa',
            price: 156.20,
            change: 8.90,
            changePercent: 6.04,
            volume: 22150,
            high: 158.00,
            low: 145.30
        },
    ];

    const currentStock = stocks.find(s => s.symbol === selectedStock) || stocks[0];

    return (
        <div className="space-y-6">
            {/* Header avec sélecteur d'actions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                    {stocks.map(stock => (
                        <button
                            key={stock.symbol}
                            onClick={() => setSelectedStock(stock.symbol)}
                            className={`px-6 py-3 rounded-xl transition-all ${selectedStock === stock.symbol
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                                }`}
                        >
                            <div className="text-left">
                                <div className="font-semibold">{stock.symbol}</div>
                                <div className="text-sm opacity-80">{stock.name}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Informations de l'action sélectionnée */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-white/60 text-sm mb-1">Prix actuel</p>
                        <p className="text-2xl font-bold text-white">{currentStock.price.toFixed(2)}€</p>
                    </div>
                    <div>
                        <p className="text-white/60 text-sm mb-1">Variation</p>
                        <p className={`text-2xl font-bold flex items-center gap-1 ${currentStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            {currentStock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            {currentStock.changePercent.toFixed(2)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-white/60 text-sm mb-1">Volume</p>
                        <p className="text-2xl font-bold text-white">{currentStock.volume.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-white/60 text-sm mb-1">Amplitude</p>
                        <p className="text-sm text-white">
                            <span className="text-emerald-400">{currentStock.high.toFixed(2)}</span>
                            {' - '}
                            <span className="text-red-400">{currentStock.low.toFixed(2)}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Trading Interface */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Graphique */}
                <div className="lg:col-span-2">
                    <TradingChart stock={currentStock} />
                </div>

                {/* Formulaire d'ordre */}
                <div>
                    <OrderForm
                        stock={currentStock}
                        orderType={orderType}
                        setOrderType={setOrderType}
                        isAuthenticated={isAuthenticated}
                        user={user}
                    />
                </div>
            </div>

            {/* Carnet d'ordres */}
            <div className="grid md:grid-cols-2 gap-6">
                <OrderBook type="buy" stock={currentStock} />
                <OrderBook type="sell" stock={currentStock} />
            </div>

            {/* Historique des transactions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Historique des transactions</h3>
                    <button
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                        <RefreshCw className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-white/60 text-sm border-b border-white/10">
                                <th className="text-left py-2">Heure</th>
                                <th className="text-left py-2">Type</th>
                                <th className="text-right py-2">Prix</th>
                                <th className="text-right py-2">Quantité</th>
                                <th className="text-right py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(10)].map((_, i) => {
                                const isBuy = Math.random() > 0.5;
                                const price = currentStock.price + (Math.random() - 0.5) * 2;
                                const quantity = Math.floor(Math.random() * 100) + 1;
                                return (
                                    <tr key={i} className="border-b border-white/5">
                                        <td className="py-2 text-white/60 text-sm">
                                            {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                                        </td>
                                        <td className={`py-2 text-sm ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isBuy ? 'Achat' : 'Vente'}
                                        </td>
                                        <td className="py-2 text-right text-white">{price.toFixed(2)}€</td>
                                        <td className="py-2 text-right text-white">{quantity}</td>
                                        <td className="py-2 text-right text-white font-medium">
                                            {(price * quantity).toFixed(2)}€
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TradingView; 