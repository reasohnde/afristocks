import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Building2, TrendingUp, DollarSign, Activity,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminDashboardViewProps {
  setActiveView: (view: string) => void;
}

interface DashboardStats {
  totalUsers: number;
  totalStartups: number;
  totalInvestments: number;
  totalInvestedAmount: number;
  activeUsers: number;
  pendingVerifications: number;
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  userName: string;
  createdAt: string;
}

const TRANSACTION_LABELS: Record<string, string> = {
  DEPOSIT: 'Dépôt',
  WITHDRAWAL: 'Retrait',
  INVESTMENT: 'Investissement',
  DIVIDEND: 'Dividende',
  FEE: 'Frais',
  REFUND: 'Remboursement',
  TRANSFER: 'Transfert',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Complété', className: 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30' },
  PENDING: { label: 'En attente', className: 'text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30' },
  FAILED: { label: 'Échoué', className: 'text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30' },
  CANCELLED: { label: 'Annulé', className: 'text-slate-600 bg-slate-50 border border-slate-200 dark:text-slate-300 dark:bg-slate-800/50 dark:border-slate-800' },
};

const formatXOF = (value: number): string =>
  `${Number(value || 0).toLocaleString('fr-FR')} XOF`;

const formatDate = (value: string): string => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
};

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ setActiveView }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    setRefreshing(true);
    try {
      const [statsRes, transRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/transactions/recent'),
      ]);

      const statsData = statsRes.data?.data;
      if (statsData) setStats(statsData as DashboardStats);

      const transData = transRes.data?.data;
      setRecentTransactions(Array.isArray(transData) ? (transData as RecentTransaction[]) : []);
    } catch (err) {
      console.error('Erreur de chargement du tableau de bord:', err);
      setError('Impossible de charger les données du tableau de bord.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 dark:text-slate-400">Chargement…</div>
      </div>
    );
  }

  const kpis: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    onClick?: () => void;
  }> = [];

  if (stats) {
    kpis.push(
      { icon: Users, label: 'Total Utilisateurs', value: stats.totalUsers.toLocaleString('fr-FR'), onClick: () => setActiveView('admin-users') },
      { icon: Activity, label: 'Utilisateurs actifs', value: stats.activeUsers.toLocaleString('fr-FR') },
      { icon: Building2, label: 'Startups', value: stats.totalStartups.toLocaleString('fr-FR'), onClick: () => setActiveView('admin-startups') },
      { icon: AlertCircle, label: 'En attente KYC', value: stats.pendingVerifications.toLocaleString('fr-FR'), onClick: () => setActiveView('admin-users') },
      { icon: TrendingUp, label: 'Investissements', value: stats.totalInvestments.toLocaleString('fr-FR') },
      { icon: DollarSign, label: 'Total Investi', value: formatXOF(stats.totalInvestedAmount) },
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Tableau de bord administrateur</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Vue d'ensemble de la plateforme AfriStocks</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#0f141c] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-md text-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map(({ icon: Icon, label, value, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={!onClick}
              className={`text-left bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-5 transition-colors ${
                onClick ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </span>
              </div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{value}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-1">{label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Transactions récentes */}
      <div className="bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Transactions récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Utilisateur</th>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Type</th>
                <th className="px-5 py-3 text-right text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Montant</th>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Statut</th>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500">
                    Aucune transaction récente
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const status = STATUS_CONFIG[tx.status] || { label: tx.status, className: 'text-slate-600 bg-slate-50 border border-slate-200 dark:text-slate-300 dark:bg-slate-800/50 dark:border-slate-800' };
                  return (
                    <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3 text-slate-900 dark:text-slate-100">{tx.userName || '—'}</td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{TRANSACTION_LABELS[tx.type] || tx.type}</td>
                      <td className="px-5 py-3 text-right text-slate-900 dark:text-slate-100 tabular-nums">{formatXOF(tx.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400 tabular-nums">{formatDate(tx.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
