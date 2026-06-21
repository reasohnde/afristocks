// src/app/views/AdminStartupsView.tsx
import React, { useState, useEffect } from 'react';
import {
  Building2, Search, ArrowLeft, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

interface Startup {
  id: string;
  name: string;
  description: string;
  valuationTarget: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface AdminStartupsViewProps {
  setActiveView: (view: string) => void;
}

const fmtAmount = (n: number | null | undefined): string =>
  typeof n === 'number' && !Number.isNaN(n) ? n.toLocaleString('fr-FR') : '—';

const fmtDate = (d: string | null | undefined): string => {
  if (!d) return '—';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR');
};

const AdminStartupsView: React.FC<AdminStartupsViewProps> = ({ setActiveView }) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editing, setEditing] = useState<Startup | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/startups');
      const list: Startup[] = res.data?.data ?? [];
      setStartups(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Erreur chargement startups:', e);
      setError('Impossible de charger les startups.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (startupId: string) => {
    try {
      setTogglingId(startupId);
      await api.post(`/admin/startups/${startupId}/toggle-status`);
      await fetchStartups();
    } catch (e) {
      console.error('Erreur changement statut startup:', e);
      setError('Le changement de statut a échoué.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      setError(null);
      await api.put(`/admin/startups/${editing.id}`, {
        name: editing.name,
        description: editing.description,
        valuationTarget: Number(editing.valuationTarget),
        minInvestment: Number(editing.minInvestment),
        maxInvestment: Number(editing.maxInvestment),
        startDate: editing.startDate,
        endDate: editing.endDate,
      });
      setEditing(null);
      await fetchStartups();
    } catch (e) {
      console.error('Erreur mise à jour startup:', e);
      setError("La mise à jour de la startup a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStartups = startups.filter((startup) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      startup.name.toLowerCase().includes(q) ||
      (startup.description ?? '').toLowerCase().includes(q);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && startup.isActive) ||
      (filter === 'inactive' && !startup.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des startups</h1>
          <p className="text-slate-500 mt-1 text-sm">Gérez les startups de la plateforme</p>
        </div>
        <button
          onClick={() => setActiveView('admin-dashboard')}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md transition-colors text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une startup..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          <option value="all">Toutes</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>

        <button
          onClick={fetchStartups}
          className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md transition-colors text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Chargement…</div>
        ) : filteredStartups.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Aucune startup trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Nom</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Objectif (valorisation)</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Montant levé</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Invest. min / max</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Période</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Statut</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStartups.map((startup) => (
                  <tr key={startup.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-slate-900">{startup.name}</p>
                      {startup.description && (
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-2 max-w-xs">{startup.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                      {fmtAmount(startup.valuationTarget)} XOF
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                      {fmtAmount(startup.raisedAmount)} XOF
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {fmtAmount(startup.minInvestment)} / {fmtAmount(startup.maxInvestment)} XOF
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {fmtDate(startup.startDate)} → {fmtDate(startup.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                          startup.isActive
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-slate-600 bg-slate-50 border-slate-200'
                        }`}
                      >
                        {startup.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing({ ...startup })}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleToggleStatus(startup.id)}
                          disabled={togglingId === startup.id}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs transition-colors disabled:opacity-50"
                        >
                          {startup.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Modifier la startup</h3>
              <button
                onClick={() => setEditing(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Nom</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Description</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Objectif de valorisation (XOF)</label>
                <input
                  type="number"
                  value={editing.valuationTarget}
                  onChange={(e) => setEditing({ ...editing, valuationTarget: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Invest. min (XOF)</label>
                  <input
                    type="number"
                    value={editing.minInvestment}
                    onChange={(e) => setEditing({ ...editing, minInvestment: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Invest. max (XOF)</label>
                  <input
                    type="number"
                    value={editing.maxInvestment}
                    onChange={(e) => setEditing({ ...editing, maxInvestment: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={editing.startDate ? editing.startDate.slice(0, 10) : ''}
                    onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={editing.endDate ? editing.endDate.slice(0, 10) : ''}
                    onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-colors text-sm disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStartupsView;
