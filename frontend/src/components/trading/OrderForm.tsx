import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface OrderFormProps {
    stock: any;
    orderType: 'buy' | 'sell';
    setOrderType: (type: 'buy' | 'sell') => void;
    isAuthenticated: boolean;
    user: any;
}

const OrderForm: React.FC<OrderFormProps> = ({
    stock,
    orderType,
    setOrderType,
    isAuthenticated,
    user
}) => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(stock.price);

    const total = quantity * price;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Veuillez vous connecter pour passer un ordre');
            return;
        }
        alert(`${orderType === 'buy' ? 'Achat' : 'Vente'} de ${quantity} actions ${stock.symbol} à ${price.toFixed(2)}€`);
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setOrderType('buy')}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all ${orderType === 'buy'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                >
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    Acheter
                </button>
                <button
                    onClick={() => setOrderType('sell')}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all ${orderType === 'sell'
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                >
                    <TrendingDown className="w-5 h-5 inline mr-2" />
                    Vendre
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        Quantité
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        Prix par action
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || stock.price)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    />
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/60">Total</span>
                        <span className="text-xl font-bold text-white">{total.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Frais</span>
                        <span className="text-white/80">{(total * 0.0025).toFixed(2)}€</span>
                    </div>
                </div>

                {!isAuthenticated && (
                    <div className="flex items-center gap-2 p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <span className="text-sm text-amber-300">Connectez-vous pour trader</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!isAuthenticated}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${orderType === 'buy'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {orderType === 'buy' ? 'Acheter' : 'Vendre'} {stock.symbol}
                </button>
            </form>
        </div>
    );
};

export default OrderForm; 