import React, { useState, useEffect, useCallback } from 'react';
import { Building2, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { api } from '../../services/api';

// Le composant reçoit l'utilisateur connecté (rôle STARTUP) via la prop `startup`.
// On conserve la forme de prop attendue par page.tsx (objet utilisateur).
interface Startup {
  id?: string;
  name?: string;
  email?: string;
  logo?: string;
  verified?: boolean;
  companyInfo?: {
    sector?: string;
    country?: string;
    city?: string;
  };
}

interface StartupDashboardViewProps {
  startup: Startup;
  setActiveView: (view: string) => void;
}

// Offre/startup telle que renvoyée par GET /investments/startups
interface Offering {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  valuationTarget: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment: number;
  startDate?: string | null;
  endDate?: string | null;
  progress: number;
}

const formatXOF = (value: number): string =>
  `${Math.round(value).toLocaleString('fr-FR')} XOF`;

const formatDate = (value?: string | null): string | null => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StartupDashboardView: React.FC<StartupDashboardViewProps> = ({ startup, setActiveView }) => {
  void setActiveView; // conservé dans l'interface, non utilisé pour l'instant

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const founderName = startup?.name || '—';
  const founderEmail = startup?.email || null;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/investments/startups');
      // Réponse enveloppée { success, data: { startups, pagination } }
      const payload = res.data?.data;
      const list: Offering[] = Array.isArray(payload?.startups) ? payload.startups : [];
      setOfferings(list);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Impossible de charger les données. Veuillez réessayer.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // En-tête : identité du fondateur (données réelles issues de la prop utilisateur)
  const Header = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          {startup?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={startup.logo} alt={founderName} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 truncate">{founderName}</h1>
          {founderEmail && <p className="text-sm text-slate-500 truncate">{founderEmail}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200">
              Compte fondateur
            </span>
            {startup?.verified ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                Vérifié
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200">
                Vérification en attente
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-12 flex items-center justify-center text-slate-500">
      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
      <span className="text-sm">Chargement des données…</span>
    </div>
  );

  const ErrorState = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 flex flex-col items-center text-center">
      <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
      <p className="text-sm text-slate-700 mb-4">{error}</p>
      <button
        onClick={loadData}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-md"
      >
        <RefreshCw className="w-4 h-4" />
        Réessayer
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-12 flex flex-col items-center text-center">
      <Inbox className="w-10 h-10 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-900">Aucune donnée pour le moment</p>
      <p className="text-sm text-slate-500 mt-1">
        Aucune levée de fonds active n&apos;est disponible actuellement.
      </p>
    </div>
  );

  const OfferingsTable = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Levées de fonds actives</h2>
        <p className="text-xs text-slate-500 mt-0.5">Données issues de la plateforme</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Startup</th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-slate-500 font-medium">Objectif</th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-slate-500 font-medium">Levé</th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-slate-500 font-medium">Progression</th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-slate-500 font-medium">Invest. min</th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-slate-500 font-medium">Clôture</th>
            </tr>
          </thead>
          <tbody>
            {offerings.map((o) => {
              const progress = Math.max(0, Math.min(100, Math.round(o.progress)));
              const endDate = formatDate(o.endDate);
              return (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{o.name}</div>
                    {o.description && (
                      <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{o.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-slate-700">{formatXOF(o.valuationTarget)}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-emerald-600">{formatXOF(o.raisedAmount)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-700" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="tabular-nums text-slate-700 w-10 text-right">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-slate-700">{formatXOF(o.minInvestment)}</td>
                  <td className="px-6 py-4 text-right text-slate-500">{endDate || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : offerings.length === 0 ? (
        <EmptyState />
      ) : (
        <OfferingsTable />
      )}
    </div>
  );
};

export default StartupDashboardView;
