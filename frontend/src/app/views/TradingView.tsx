import React from 'react';
import { BackButton } from '../components/BackButton';
import { BarChart3, Clock, ArrowRight, Rocket } from 'lucide-react';

interface TradingViewProps {
  isAuthenticated: boolean;
  user: any;
  setActiveView: (view: string) => void;
}

const TradingView: React.FC<TradingViewProps> = ({ isAuthenticated, user, setActiveView }) => {
  return (
    <div className="space-y-6">
      <BackButton />

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Trading</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Achat et vente de titres cotés</p>
      </div>

      <div className="bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-8 md:p-12 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 mb-5">
            <Clock className="w-7 h-7 text-slate-500 dark:text-slate-400" />
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-full px-3 py-1 mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            Bientôt disponible
          </span>

          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Le trading de titres cotés n'est pas encore actif
          </h2>

          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
            Cette fonctionnalité est en cours de développement. Les cours en temps réel,
            le carnet d'ordres et le passage d'ordres ne sont pas encore disponibles sur
            la plateforme.
          </p>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            En attendant, vous pouvez investir dès maintenant dans des startups africaines
            sélectionnées via notre offre d'investissement.
          </p>

          <button
            onClick={() => setActiveView('startups')}
            className="inline-flex items-center gap-2 bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
          >
            <Rocket className="w-4 h-4" />
            Découvrir les startups
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingView;
