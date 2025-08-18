import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OrderBookProps {
    type: 'buy' | 'sell';
    stock: any;
}

const OrderBook: React.FC<OrderBookProps> = ({ type, stock }) => {
    // Mock data for order book
    const orders = Array.from({ length: 10 }, (_, i) => ({
        price: stock.price + (type === 'buy' ? -i * 0.5 : i * 0.5),
        quantity: Math.floor(Math.random() * 1000) + 100,
        total: 0
    })).map(order => ({
        ...order,
        total: order.price * order.quantity
    }));

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
                {type === 'buy' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <h3 className="text-lg font-semibold text-white">
                    {type === 'buy' ? 'Achats' : 'Ventes'}
                </h3>
            </div>

            <div className="space-y-2">
                {orders.map((order, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                        <span className={`text-sm ${type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {order.price.toFixed(2)}€
                        </span>
                        <span className="text-sm text-white/60">{order.quantity}</span>
                        <span className="text-sm text-white/80">{order.total.toFixed(2)}€</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderBook; 