// views/AdminDashboardView.tsx
import React, { useState } from 'react';
import {
  Users, DollarSign, TrendingUp, BarChart3, Settings, FileText,
  Shield, Download, Mail, Filter, Search, ChevronDown, Eye,
  Check, X, Clock, AlertCircle, Briefcase, Activity, Calendar
} from 'lucide-react';
import { useFund } from '../../contexts/FundContext';

interface AdminDashboardViewProps {
  setActiveView: (view: string) => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ setActiveView }) => {
  const { fundData, investments, updateFundData, getTotalInvestors } = useFund();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Statistiques
  const stats = {
    totalRaised: investments
      .filter(inv => inv.status === 'completed')
      .reduce((sum, inv) => sum + inv.amount, 0),
    totalInvestors: getTotalInvestors(),
    pendingAmount: investments
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0),
    averageInvestment: investments.length > 0
      ? investments.reduce((sum, inv) => sum + inv.amount, 0) / investments.length
      : 0,
    conversionRate: investments.length > 0
      ? (investments.filter(inv => inv.status === 'completed').length / investments.length * 100)
      : 0
  };

  // Filtrage des investissements
  const filteredInvestments = investments.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = inv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (editingField) {
      let value: any = tempValue;
      if (['targetAmount', 'raisedAmount', 'minInvestment'].includes(editingField)) {
        value = parseFloat(tempValue) || 0;
      }
      await updateFundData({ [editingField]: value });
      setShowEditModal(false);
      setEditingField(null);
      setTempValue('');
    }
  };

  const exportData = () => {
    const csv = [
      ['Nom', 'Email', 'Montant', 'Date', 'Statut', 'Méthode'],
      ...filteredInvestments.map(inv => [
        inv.userName,
        inv.userEmail,
        inv.amount,
        new Date(inv.date).toLocaleDateString(),
        inv.status,
        inv.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investissements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard Admin - {fundData.name}</h1>
        <button
          onClick={() => setActiveView('home')}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all text-white"
        >
          Retour à l'accueil
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalRaised.toLocaleString()}€</p>
          <p className="text-sm text-white/60">Total collecté</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">+12</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalInvestors}</p>
          <p className="text-sm text-white/60">Investisseurs</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.pendingAmount.toLocaleString()}€</p>
          <p className="text-sm text-white/60">En attente</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.averageInvestment.toFixed(0)}€</p>
          <p className="text-sm text-white/60">Investissement moyen</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</p>
          <p className="text-sm text-white/60">Taux de conversion</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        {['overview', 'settings', 'investors', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-all ${activeTab === tab
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-white/60 hover:text-white'
              }`}
          >
            {tab === 'overview' && 'Vue d\'ensemble'}
            {tab === 'settings' && 'Paramètres'}
            {tab === 'investors' && 'Investisseurs'}
            {tab === 'analytics' && 'Analytiques'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Progression du fonds */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Progression de la levée</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Objectif: {fundData.targetAmount.toLocaleString()}€</span>
                  <span className="text-white">{((fundData.raisedAmount / fundData.targetAmount) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                    style={{ width: `${(fundData.raisedAmount / fundData.targetAmount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={exportData}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Exporter les données</span>
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              <span>Email groupé</span>
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Générer rapport</span>
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Vérifications KYC</span>
            </button>
          </div>

          {/* Derniers investissements */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Derniers investissements</h3>
            <div className="space-y-4">
              {investments.slice(0, 5).map((investment) => (
                <div key={investment.id} className="flex items-center justify-between pb-4 border-b border-white/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {investment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{investment.userName}</p>
                      <p className="text-white/60 text-sm">{investment.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{investment.amount.toLocaleString()}€</p>
                    <p className="text-white/60 text-sm">{new Date(investment.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">Informations générales</h3>
            <div className="space-y-4">
              {[
                { field: 'name', label: 'Nom du fonds', value: fundData.name },
                { field: 'tagline', label: 'Slogan', value: fundData.tagline },
                { field: 'description', label: 'Description', value: fundData.description },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex-1">
                    <p className="text-sm text-white/60">{item.label}</p>
                    <p className="text-white">{item.value}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(item.field, item.value)}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Paramètres financiers */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">Paramètres financiers</h3>
            <div className="space-y-4">
              {[
                { field: 'targetAmount', label: 'Objectif de levée', value: fundData.targetAmount, suffix: '€' },
                { field: 'raisedAmount', label: 'Montant collecté', value: fundData.raisedAmount, suffix: '€' },
                { field: 'minInvestment', label: 'Investissement minimum', value: fundData.minInvestment, suffix: '€' },
                { field: 'expectedReturn', label: 'Rendement prévu', value: fundData.expectedReturn },
                { field: 'duration', label: 'Durée', value: fundData.duration },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex-1">
                    <p className="text-sm text-white/60">{item.label}</p>
                    <p className="text-white">
                      {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                      {item.suffix}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(item.field, item.value.toString())}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Statut du fonds */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">Statut du fonds</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Fonds actif</p>
                <p className="text-sm text-white/60">Les investissements sont actuellement {fundData.isActive ? 'ouverts' : 'fermés'}</p>
              </div>
              <button
                onClick={() => updateFundData({ isActive: !fundData.isActive })}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${fundData.isActive
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
              >
                {fundData.isActive ? 'Actif' : 'Inactif'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'investors' && (
        <div className="space-y-6">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un investisseur..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Confirmé</option>
              <option value="failed">Échoué</option>
            </select>

            <button
              onClick={exportData}
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>

          {/* Liste des investisseurs */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">Investisseur</th>
                  <th className="text-left p-4 text-white/60 font-medium">Montant</th>
                  <th className="text-left p-4 text-white/60 font-medium">Date</th>
                  <th className="text-left p-4 text-white/60 font-medium">Méthode</th>
                  <th className="text-left p-4 text-white/60 font-medium">Statut</th>
                  <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestments.map((investment) => (
                  <tr key={investment.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{investment.userName}</p>
                        <p className="text-white/60 text-sm">{investment.userEmail}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-semibold">{investment.amount.toLocaleString()}€</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white/80">{new Date(investment.date).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 capitalize">
                        {investment.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${investment.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : investment.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                        {investment.status === 'completed' ? 'Confirmé' :
                          investment.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-white/60 hover:text-white">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              Modifier {editingField && editingField.charAt(0).toUpperCase() + editingField.slice(1)}
            </h3>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;