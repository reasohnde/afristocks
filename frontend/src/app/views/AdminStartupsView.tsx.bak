// src/app/views/AdminStartupsView.tsx
import React, { useState, useEffect } from 'react';
import {
  Building2, Users, TrendingUp, Eye, Edit3, Trash2, Search, Filter,
  CheckCircle, AlertCircle, Clock, ArrowLeft, Plus, BarChart3,
  Globe, Calendar, DollarSign, Target, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5001';

interface Startup {
  id: string;
  name: string;
  description: string;
  sector: string;
  country: string;
  city: string;
  foundedDate: string;
  teamSize: number;
  revenue: number;
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment: number;
  isActive: boolean;
  isVerified: boolean;
  registrationNumber: string;
  website?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStartupsViewProps {
  setActiveView: (view: string) => void;
}

const AdminStartupsView: React.FC<AdminStartupsViewProps> = ({ setActiveView }) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  // Chargement des startups
  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/startups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStartups(data.data || []);
      } else {
        console.error('Erreur chargement startups:', response.status);
      }
    } catch (error) {
      console.error('Erreur chargement startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStartup) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/startups/${selectedStartup.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchStartups();
        setShowDeleteModal(false);
        setSelectedStartup(null);
      }
    } catch (error) {
      console.error('Erreur suppression startup:', error);
    }
  };

  const handleToggleVerification = async (startupId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/startups/${startupId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchStartups();
      }
    } catch (error) {
      console.error('Erreur vérification startup:', error);
    }
  };

  const handleToggleStatus = async (startupId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/startups/${startupId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchStartups();
      }
    } catch (error) {
      console.error('Erreur changement statut startup:', error);
    }
  };

  // Filtrage des startups
  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'verified' && startup.isVerified) ||
      (filter === 'pending' && !startup.isVerified) ||
      (filter === 'active' && startup.isActive);
    return matchesSearch && matchesFilter;
  });

  // Composant carte de startup
  const StartupCard = ({ startup }: { startup: Startup }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{startup.name}</h3>
          <p className="text-white/60 text-sm line-clamp-2">{startup.description}</p>
        </div>
        {startup.logo && (
          <img
            src={startup.logo}
            alt={startup.name}
            className="w-16 h-16 rounded-lg object-cover ml-4"
          />
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${startup.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
          {startup.isVerified ? 'Vérifié' : 'En attente'}
        </span>

        <span className={`px-2 py-1 rounded-full text-xs font-medium ${startup.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
          {startup.isActive ? 'Actif' : 'Inactif'}
        </span>

        <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
          {startup.sector}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-white/60">Pays</p>
          <p className="text-white">{startup.country}</p>
        </div>
        <div>
          <p className="text-white/60">Équipe</p>
          <p className="text-white">{startup.teamSize} personnes</p>
        </div>
        <div>
          <p className="text-white/60">CA annuel</p>
          <p className="text-white">{startup.revenue.toLocaleString()} XOF</p>
        </div>
        <div>
          <p className="text-white/60">Levée</p>
          <p className="text-white">{startup.raisedAmount.toLocaleString()} XOF</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(startup.foundedDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {startup.targetAmount.toLocaleString()} XOF
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleVerification(startup.id)}
            className={`p-2 rounded-lg transition-all ${startup.isVerified
                ? 'hover:bg-amber-500/20 text-amber-400'
                : 'hover:bg-green-500/20 text-green-400'
              }`}
            title={startup.isVerified ? 'Révoquer vérification' : 'Vérifier'}
          >
            {startup.isVerified ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleToggleStatus(startup.id)}
            className={`p-2 rounded-lg transition-all ${startup.isActive
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-green-500/20 text-green-400'
              }`}
            title={startup.isActive ? 'Désactiver' : 'Activer'}
          >
            {startup.isActive ? <Trash2 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setSelectedStartup(startup);
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
          <h1 className="text-3xl font-bold text-white">Gestion des Startups</h1>
          <p className="text-white/60 mt-1">Gérez les startups de la plateforme</p>
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
          Liste des startups
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
                  placeholder="Rechercher une startup..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">Toutes les startups</option>
                <option value="verified">Vérifiées</option>
                <option value="pending">En attente</option>
                <option value="active">Actives</option>
              </select>

              <button
                onClick={() => setActiveView('admin-startup-create')}
                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle startup
              </button>
            </div>

            {/* Liste */}
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredStartups.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Aucune startup trouvée</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredStartups.map(startup => (
                  <StartupCard key={startup.id} startup={startup} />
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
                  <Building2 className="w-8 h-8 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">+15%</span>
                </div>
                <p className="text-2xl font-bold text-white">{startups.length}</p>
                <p className="text-sm text-white/60">Total startups</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">+8%</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {startups.filter(s => s.isVerified).length}
                </p>
                <p className="text-sm text-white/60">Vérifiées</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {startups.reduce((sum, s) => sum + s.raisedAmount, 0).toLocaleString()} XOF
                </p>
                <p className="text-sm text-white/60">Total levé</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {startups.reduce((sum, s) => sum + s.teamSize, 0)}
                </p>
                <p className="text-sm text-white/60">Employés total</p>
              </div>
            </div>

            {/* Graphique des secteurs */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Répartition par secteur</h3>
              <div className="space-y-4">
                {Object.entries(
                  startups.reduce((acc, startup) => {
                    acc[startup.sector] = (acc[startup.sector] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([sector, count]) => (
                  <div key={sector} className="flex items-center justify-between">
                    <span className="text-white">{sector}</span>
                    <span className="text-white/60">{count} startups</span>
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
                Êtes-vous sûr de vouloir supprimer la startup "{selectedStartup?.name}" ?
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

export default AdminStartupsView;