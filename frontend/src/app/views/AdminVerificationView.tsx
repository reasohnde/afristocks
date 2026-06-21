import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, Loader, RotateCw, Mail, Phone, Calendar, Clock
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminVerificationViewProps {
  setActiveView: (view: string) => void;
}

interface PendingUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
  kycStatus: string;
  createdAt: string;
}

const fullName = (u: PendingUser): string => {
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return name || u.email;
};

const AdminVerificationView: React.FC<AdminVerificationViewProps> = ({ setActiveView }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchPendingVerifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users', { params: { kycStatus: 'PENDING' } });
      const payload = res.data?.data;
      const list: PendingUser[] = Array.isArray(payload) ? payload : (payload?.data ?? []);
      setPendingUsers(list);
    } catch (err) {
      console.error('Erreur lors du chargement des vérifications KYC:', err);
      setError("Impossible de charger les vérifications KYC.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingVerifications();
  }, [fetchPendingVerifications]);

  const verifyKYC = async (user: PendingUser) => {
    const confirmed = window.confirm(`Valider la vérification KYC de ${fullName(user)} ?`);
    if (!confirmed) return;
    setActionId(user.id);
    try {
      await api.post(`/admin/users/${user.id}/verify-kyc`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error('Erreur lors de la validation KYC:', err);
      alert("Erreur lors de la validation.");
    } finally {
      setActionId(null);
    }
  };

  const rejectKYC = async (user: PendingUser) => {
    const confirmed = window.confirm(`Rejeter la vérification KYC de ${fullName(user)} ?`);
    if (!confirmed) return;
    setActionId(user.id);
    try {
      await api.post(`/admin/users/${user.id}/reject-kyc`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error('Erreur lors du rejet KYC:', err);
      alert("Erreur lors du rejet.");
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = pendingUsers.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      fullName(user).toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-slate-400 dark:text-slate-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('admin-dashboard')}
            className="p-2 bg-white dark:bg-[#0f141c] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-md transition-colors"
            title="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Vérifications KYC</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Demandes de vérification en attente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPendingVerifications}
            className="p-2 bg-white dark:bg-[#0f141c] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-md transition-colors"
            title="Rafraîchir"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <span className="text-xs uppercase tracking-wide font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-md px-3 py-2">
            {filteredUsers.length} en attente
          </span>
        </div>
      </div>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher par nom ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:max-w-sm px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
      />

      {/* Erreur */}
      {error && (
        <div className="bg-white dark:bg-[#0f141c] border border-red-200 dark:border-red-500/30 rounded-lg shadow-sm p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Liste des demandes */}
      <div className="bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucune vérification KYC en attente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Inscrit le</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Statut</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const busy = actionId === user.id;
                  return (
                    <tr key={user.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{fullName(user)}</div>
                        {user.role && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.role}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{user.phoneNumber || 'Non renseigné'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-md px-2 py-1">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => verifyKYC(user)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                          >
                            {busy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Vérifier
                          </button>
                          <button
                            onClick={() => rejectKYC(user)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0f141c] border border-slate-300 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeter
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

export default AdminVerificationView;
