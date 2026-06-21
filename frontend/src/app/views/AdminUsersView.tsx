// src/app/views/AdminUsersView.tsx
import React, { useState, useEffect } from 'react';
import {
  Users, Search, ArrowLeft, CheckCircle, XCircle, Ban, Unlock, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED' | string;

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  kycStatus: KycStatus;
  createdAt: string;
}

interface AdminUsersViewProps {
  setActiveView: (view: string) => void;
}

const PAGE_SIZE = 50;

const AdminUsersView: React.FC<AdminUsersViewProps> = ({ setActiveView }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = { limit: PAGE_SIZE, offset: 0 };
      if (kycFilter !== 'all') params.kycStatus = kycFilter;
      const res = await api.get('/admin/users', { params });
      const payload = res.data?.data;
      const list: AdminUser[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      setUsers(list);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kycFilter]);

  const runAction = async (userId: string, fn: () => Promise<unknown>) => {
    try {
      setActionId(userId);
      await fn();
      await fetchUsers();
    } catch (err) {
      console.error('Erreur action utilisateur:', err);
      setError("L'action a échoué. Veuillez réessayer.");
    } finally {
      setActionId(null);
    }
  };

  const handleVerifyKyc = (userId: string) =>
    runAction(userId, () => api.post(`/admin/users/${userId}/verify-kyc`));

  const handleRejectKyc = (userId: string) =>
    runAction(userId, () => api.post(`/admin/users/${userId}/reject-kyc`));

  const handleToggleStatus = (userId: string) =>
    runAction(userId, () => api.post(`/admin/users/${userId}/toggle-status`));

  const fullName = (u: AdminUser): string => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || '—';
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      fullName(user).toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const kycBadge = (status: KycStatus) => {
    const map: Record<string, { label: string; cls: string }> = {
      APPROVED: { label: 'Approuvé', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      PENDING: { label: 'En attente', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
      REJECTED: { label: 'Rejeté', cls: 'text-red-700 bg-red-50 border-red-200' },
      NOT_SUBMITTED: { label: 'Non soumis', cls: 'text-slate-600 bg-slate-50 border-slate-200' },
    };
    const cfg = map[status] || { label: String(status), cls: 'text-slate-600 bg-slate-50 border-slate-200' };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les comptes, le KYC et l'accès à la plateforme</p>
        </div>
        <button
          onClick={() => setActiveView('admin-dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Tous les statuts KYC</option>
            <option value="NOT_SUBMITTED">Non soumis</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvé</option>
            <option value="REJECTED">Rejeté</option>
          </select>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Nom</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">KYC</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Statut</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Inscrit le</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const busy = actionId === user.id;
                  return (
                    <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{user.email}</td>
                      <td className="px-4 py-3 text-slate-700">{fullName(user)}</td>
                      <td className="px-4 py-3 text-slate-600 tabular-nums">{user.phoneNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border text-slate-600 bg-slate-50 border-slate-200">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{kycBadge(user.kycStatus)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                            user.isActive
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-slate-600 bg-slate-50 border-slate-200'
                          }`}
                        >
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {user.kycStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleVerifyKyc(user.id)}
                                disabled={busy}
                                title="Valider le KYC"
                                className="p-1.5 rounded-md text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectKyc(user.id)}
                                disabled={busy}
                                title="Rejeter le KYC"
                                className="p-1.5 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={busy}
                            title={user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                            className={`p-1.5 rounded-md disabled:opacity-50 ${
                              user.isActive
                                ? 'text-red-700 hover:bg-red-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {user.isActive ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersView;
