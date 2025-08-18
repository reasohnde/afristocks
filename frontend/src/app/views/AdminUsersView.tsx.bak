// src/app/views/AdminUsersView.tsx
import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserX, Shield, Eye, Edit3, Trash2, Search, Filter,
  CheckCircle, AlertCircle, Clock, ArrowLeft, Plus, BarChart3,
  Mail, Phone, Calendar, DollarSign, Target, Activity, Ban, Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5001';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
  wallet?: {
    balance: number;
    currency: string;
  };
  investments?: {
    totalInvested: number;
    activeInvestments: number;
  };
}

interface AdminUsersViewProps {
  setActiveView: (view: string) => void;
}

const AdminUsersView: React.FC<AdminUsersViewProps> = ({ setActiveView }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState({ role: 'all', kycStatus: 'all' });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  // Chargement des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        console.error('Erreur chargement utilisateurs:', response.status);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Erreur changement statut utilisateur:', error);
    }
  };

  const handleKycAction = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/kyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Erreur action KYC:', error);
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filter.role === 'all' || user.role === filter.role;
    const matchesKyc = filter.kycStatus === 'all' || user.kycStatus === filter.kycStatus;
    return matchesSearch && matchesRole && matchesKyc;
  });

  // Composant carte d'utilisateur
  const UserCard = ({ user }: { user: User }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{user.name}</h3>
          <p className="text-white/60 text-sm">{user.email}</p>
        </div>
        {user.profile?.avatar && (
          <img
            src={user.profile.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover ml-4"
          />
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
            user.role === 'MODERATOR' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
          }`}>
          {user.role}
        </span>

        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.kycStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
            user.kycStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
              user.kycStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                'bg-gray-500/20 text-gray-400'
          }`}>
          KYC: {user.kycStatus}
        </span>

        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
          {user.isActive ? 'Actif' : 'Inactif'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-white/60">Téléphone</p>
          <p className="text-white">{user.phone || 'Non renseigné'}</p>
        </div>
        <div>
          <p className="text-white/60">Solde</p>
          <p className="text-white">{user.wallet?.balance?.toLocaleString() || 0} XOF</p>
        </div>
        <div>
          <p className="text-white/60">Investissements</p>
          <p className="text-white">{user.investments?.totalInvested?.toLocaleString() || 0} XOF</p>
        </div>
        <div>
          <p className="text-white/60">Dernière connexion</p>
          <p className="text-white">
            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Jamais'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {user.isEmailVerified ? 'Vérifié' : 'Non vérifié'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user.kycStatus === 'PENDING' && (
            <>
              <button
                onClick={() => handleKycAction(user.id, 'approve')}
                className="p-2 hover:bg-green-500/20 rounded-lg transition-all text-green-400"
                title="Approuver KYC"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleKycAction(user.id, 'reject')}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
                title="Rejeter KYC"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => handleToggleStatus(user.id)}
            className={`p-2 rounded-lg transition-all ${user.isActive
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-green-500/20 text-green-400'
              }`}
            title={user.isActive ? 'Désactiver' : 'Activer'}
          >
            {user.isActive ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setSelectedUser(user);
              setShowDeleteModal(true);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
          <p className="text-white/60 mt-1">Gérez les utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={() => setActiveView('admin-dashboard')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2 inline" />
          Retour au dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-3 font-medium transition-all ${activeTab === 'list'
            ? 'text-orange-400 border-b-2 border-orange-400'
            : 'text-white/60 hover:text-white'
            }`}
        >
          Liste des utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 font-medium transition-all ${activeTab === 'analytics'
            ? 'text-orange-400 border-b-2 border-orange-400'
            : 'text-white/60 hover:text-white'
            }`}
        >
          Analytics
        </button>
      </div>

      {/* Contenu des tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filtres */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                />
              </div>

              <select
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">Tous les rôles</option>
                <option value="USER">Utilisateur</option>
                <option value="MODERATOR">Modérateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>

              <select
                value={filter.kycStatus}
                onChange={(e) => setFilter({ ...filter, kycStatus: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">Tous les statuts KYC</option>
                <option value="NOT_SUBMITTED">Non soumis</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvé</option>
                <option value="REJECTED">Rejeté</option>
              </select>
            </div>

            {/* Liste */}
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">+12%</span>
                </div>
                <p className="text-2xl font-bold text-white">{users.length}</p>
                <p className="text-sm text-white/60">Total utilisateurs</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">+8%</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.kycStatus === 'APPROVED').length}
                </p>
                <p className="text-sm text-white/60">KYC approuvés</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {users.reduce((sum, u) => sum + (u.wallet?.balance || 0), 0).toLocaleString()} XOF
                </p>
                <p className="text-sm text-white/60">Solde total</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {users.reduce((sum, u) => sum + (u.investments?.totalInvested || 0), 0).toLocaleString()} XOF
                </p>
                <p className="text-sm text-white/60">Investissements totaux</p>
              </div>
            </div>

            {/* Graphique des rôles */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Répartition par rôle</h3>
              <div className="space-y-4">
                {Object.entries(
                  users.reduce((acc, user) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-white">{role}</span>
                    <span className="text-white/60">{count} utilisateurs</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirmer la suppression</h3>
              <p className="text-white/80 mb-6">
                Êtes-vous sûr de vouloir supprimer l'utilisateur "{selectedUser?.name}" ?
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all text-white"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersView;