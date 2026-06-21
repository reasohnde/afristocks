import React, { useState, useEffect } from 'react';
import { walletService, investmentService } from '../../services/api';

interface PortfolioViewProps {
  isAuthenticated: boolean;
  user: any;
  setActiveView: (view: string) => void;
  setAuthMode: (mode: string) => void;
  setShowAuthModal: (show: boolean) => void;
}

const fmtXOF = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString('fr-FR') + ' XOF';

const fmtDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? '—'
    : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TX_LABELS: Record<string, string> = {
  DEPOSIT: 'Dépôt',
  WITHDRAWAL: 'Retrait',
  INVESTMENT: 'Investissement',
  DIVIDEND: 'Dividende',
  FEE: 'Frais',
  REFUND: 'Remboursement',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || '').toUpperCase();
  const tone =
    s === 'COMPLETED' || s === 'ACTIVE'
      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30'
      : s === 'PENDING'
      ? 'text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30'
      : s === 'FAILED' || s === 'CANCELLED' || s === 'REJECTED'
      ? 'text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30'
      : 'text-slate-600 bg-slate-100 border border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-800';
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tone}`}>{s || '—'}</span>;
};

const PortfolioView: React.FC<PortfolioViewProps> = ({
  isAuthenticated,
  user,
  setActiveView,
  setAuthMode,
  setShowAuthModal,
}) => {
  const [wallet, setWallet] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      walletService.getBalance(),
      investmentService.getMyInvestments(),
      walletService.getTransactions(),
    ])
      .then(([w, inv, tx]) => {
        if (!active) return;
        setWallet(w.data?.data ?? null);
        setInvestments(Array.isArray(inv.data?.data) ? inv.data.data : []);
        setTransactions(tx.data?.data?.transactions ?? []);
      })
      .catch(() => { if (active) setError('Impossible de charger vos données. Réessayez.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Portefeuille</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Connectez-vous pour accéder à votre portefeuille.</p>
        <button
          onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
          className="px-5 py-2.5 rounded-md bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 text-white font-medium transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const currency = wallet?.currency || 'XOF';
  const availableCash = Number(wallet?.balance ?? 0);
  const lockedCash = Number(wallet?.lockedBalance ?? 0);
  const totalInvested = investments.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const accountValue = availableCash + lockedCash + totalInvested;

  const kpis = [
    { label: 'Valeur du compte', value: fmtXOF(accountValue), strong: true },
    { label: 'Liquidités disponibles', value: fmtXOF(availableCash) },
    { label: 'Total investi', value: fmtXOF(totalInvested) },
    { label: 'Positions', value: String(investments.length) },
  ];

  const thBase = 'px-5 py-2.5 font-medium text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400';
  const td = 'px-5 py-3';
  const card = 'bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm';

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* En-tête compte */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Compte · {currency}</div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
            {loading ? '…' : fmtXOF(accountValue)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.name || ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveView('deposit')} className="px-4 py-2 text-sm rounded-md bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 text-white font-medium transition-colors">Déposer</button>
          <button onClick={() => setActiveView('withdraw')} className="px-4 py-2 text-sm rounded-md bg-white dark:bg-[#0f141c] hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">Retirer</button>
          <button onClick={() => setActiveView('startups')} className="px-4 py-2 text-sm rounded-md bg-white dark:bg-[#0f141c] hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">Investir</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>}

      {/* Indicateurs (données réelles uniquement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${card} px-5 py-4`}>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{k.label}</div>
            <div className={`mt-1 font-semibold tabular-nums ${k.strong ? 'text-xl' : 'text-lg'} text-slate-900 dark:text-slate-100`}>
              {loading ? '…' : k.value}
            </div>
          </div>
        ))}
      </div>
      {lockedCash > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Dont {fmtXOF(lockedCash)} bloqués (retraits en cours).</p>
      )}

      {/* Mes investissements */}
      <section className={`${card} overflow-hidden`}>
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mes investissements</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{investments.length} position(s)</span>
        </div>
        {loading ? (
          <div className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">Chargement…</div>
        ) : investments.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Aucun investissement pour l'instant.</p>
            <button onClick={() => setActiveView('startups')} className="text-blue-700 hover:text-blue-800 text-sm font-medium">Explorer les startups →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-left">
                  <th className={thBase}>Startup</th>
                  <th className={`${thBase} text-right`}>Montant investi</th>
                  <th className={thBase}>Statut</th>
                  <th className={`${thBase} text-right`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className={`${td} text-slate-900 dark:text-slate-100 font-medium`}>{inv.startup?.name || '—'}</td>
                    <td className={`${td} text-right text-slate-900 dark:text-slate-100 tabular-nums`}>{fmtXOF(Number(inv.amount))}</td>
                    <td className={td}><StatusBadge status={inv.status} /></td>
                    <td className={`${td} text-right text-slate-500 dark:text-slate-400 tabular-nums`}>{fmtDate(inv.investedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Transactions récentes */}
      <section className={`${card} overflow-hidden`}>
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Transactions récentes</h2>
        </div>
        {loading ? (
          <div className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">Chargement…</div>
        ) : transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">Aucune transaction.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-left">
                  <th className={thBase}>Type</th>
                  <th className={`${thBase} text-right`}>Montant</th>
                  <th className={thBase}>Statut</th>
                  <th className={`${thBase} text-right`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const negative = t.type === 'WITHDRAWAL' || t.type === 'INVESTMENT' || t.type === 'FEE';
                  return (
                    <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className={`${td} text-slate-700 dark:text-slate-200`}>{TX_LABELS[t.type] || t.type}</td>
                      <td className={`${td} text-right tabular-nums font-medium ${negative ? 'text-red-600' : 'text-emerald-600'}`}>
                        {(negative ? '− ' : '+ ') + fmtXOF(Number(t.amount))}
                      </td>
                      <td className={td}><StatusBadge status={t.status} /></td>
                      <td className={`${td} text-right text-slate-500 dark:text-slate-400 tabular-nums`}>{fmtDate(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default PortfolioView;
