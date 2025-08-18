import React from 'react';
import { ArrowLeft, BookOpen, Target, TrendingUp, Shield } from 'lucide-react';

interface InvestmentGuideViewProps {
    setActiveView: (view: string) => void;
}

const InvestmentGuideView: React.FC<InvestmentGuideViewProps> = ({ setActiveView }) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setActiveView('home')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Guide d'investissement</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <BookOpen className="w-12 h-12 text-orange-400 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Les bases</h2>
                    <p className="text-white/70">Apprenez les fondamentaux de l'investissement dans les startups africaines.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <Target className="w-12 h-12 text-emerald-400 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Stratégies</h2>
                    <p className="text-white/70">Découvrez les meilleures stratégies pour maximiser vos rendements.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <Shield className="w-12 h-12 text-blue-400 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Gestion des risques</h2>
                    <p className="text-white/70">Comprenez et minimisez les risques liés à vos investissements.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Analyse de marché</h2>
                    <p className="text-white/70">Apprenez à analyser les tendances du marché africain.</p>
                </div>
            </div>
        </div>
    );
};

export default InvestmentGuideView; 