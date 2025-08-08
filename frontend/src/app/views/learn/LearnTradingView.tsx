import React from 'react';
import { ArrowLeft, BarChart3, LineChart, CandlestickChart, TrendingUp } from 'lucide-react';

interface LearnTradingViewProps {
    setActiveView: (view: string) => void;
}

const LearnTradingView: React.FC<LearnTradingViewProps> = ({ setActiveView }) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setActiveView('home')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Apprendre le Trading</h1>
            </div>

            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Maîtrisez l'art du trading</h2>
                <p className="text-white/80 mb-6">Découvrez les techniques et stratégies utilisées par les traders professionnels.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
                        <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-white/80 text-sm">Analyse technique</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
                        <LineChart className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white/80 text-sm">Tendances</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
                        <CandlestickChart className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-white/80 text-sm">Chandeliers</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
                        <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-white/80 text-sm">Indicateurs</p>
                    </div>
                </div>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all">
                Commencer la formation trading
            </button>
        </div>
    );
};

export default LearnTradingView; 