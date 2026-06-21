import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { startupService } from '../../services/api';

interface StartupsViewProps {
  setSelectedStartup: (startup: any) => void;
  setActiveView: (view: string) => void;
}

const fmtXOF = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString('fr-FR') + ' XOF';

const StartupsView: React.FC<StartupsViewProps> = ({ setSelectedStartup, setActiveView }) => {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    startupService
      .getAll()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data?.startups ?? res.data?.data ?? [];
        setStartups(Array.isArray(list) ? list : []);
      })
      .catch(() => { if (active) setError('Impossible de charger les startups.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = startups.filter((s) => {
    const q = search.trim().toLowerCase();
    return !q || (s.name || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
  });

  const open = (s: any) => {
    setSelectedStartup(s);
    setActiveView('startup-detail');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Startups</h1>
        <p className="text-sm text-slate-500">Découvrez les startups africaines ouvertes à l'investissement.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une startup…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
        />
      </div>

      {error && <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Aucune startup {search ? 'ne correspond à votre recherche' : 'disponible'}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const target = Number(s.valuationTarget) || 0;
            const raised = Number(s.raisedAmount) || 0;
            const progress = Math.max(0, Math.min(100, Number(s.progress) || (target ? (raised / target) * 100 : 0)));
            return (
              <button
                key={s.id}
                onClick={() => open(s)}
                className="text-left bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 font-semibold overflow-hidden shrink-0">
                    {s.logo ? <img src={s.logo} alt="" className="w-full h-full object-cover" /> : (s.name || '?').slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                    {s.website && <div className="text-xs text-slate-400 truncate">{s.website}</div>}
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4 min-h-[2.5rem]">{s.description || '—'}</p>
                <div className="mb-3">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1 tabular-nums">
                    <span>{fmtXOF(raised)} levés</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-slate-100 tabular-nums">
                  <div>
                    <span className="text-slate-400 text-xs block">Objectif</span>
                    <span className="text-slate-900 font-medium">{fmtXOF(target)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-xs block">Min.</span>
                    <span className="text-slate-900 font-medium">{fmtXOF(Number(s.minInvestment) || 0)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StartupsView;
