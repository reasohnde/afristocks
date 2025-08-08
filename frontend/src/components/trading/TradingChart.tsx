import React from 'react';
import { Activity } from 'lucide-react';

interface TradingChartProps {
    stock: any;
}

const TradingChart: React.FC<TradingChartProps> = ({ stock }) => {
    // Mock chart data
    const chartData = Array.from({ length: 50 }, (_, i) => ({
        time: i,
        price: stock.price + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 2
    }));

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Graphique {stock.symbol}</h3>
            </div>

            <div className="h-64 flex items-center justify-center">
                <div className="text-center text-white/60">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                    <p>Graphique en cours de développement</p>
                    <p className="text-sm">Prix actuel: {stock.price.toFixed(2)}€</p>
                </div>
            </div>
        </div>
    );
};

export default TradingChart; 