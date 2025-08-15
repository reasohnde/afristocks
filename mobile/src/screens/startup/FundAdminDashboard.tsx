// views/FundAdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, DollarSign, TrendingUp, Download, Mail,
  CheckCircle, Clock, AlertCircle, Filter, Search, Calendar,
  FileText, Send, Settings, ChevronDown, Eye, Ban, Check
} from 'lucide-react';

interface Investment {
  id: string;
  investorName: string;
  email: string;
  phone: string;
  amount: number;
  date: Date;
  status: 'pending' | 'confirmed' | 'rejected';
  paymentMethod: string;
  country: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

interface FundAdminDashboardProps {
  setActiveView: (view: string) => void;
}

const FundAdminDashboard: React.FC<FundAdminDashboardProps> = ({ setActiveView }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Données simulées
  const mockInvestments: Investment[] = [
    {
      id: '1',
      investorName: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+225 0123456789',
      amount: 5000,
      date: new Date('2024-01-15'),
      status: 'confirmed',
      paymentMethod: 'card',
      country: 'Côte d\'Ivoire',
      verificationStatus: 'verified'
    },
    {
      id: '2',
      investorName: 'Marie Koné',
      email: 'marie.kone@email.com',
      phone: '+225 0987654321',
      amount: 2500,
      date: new Date('2024-01-16'),
      status: 'pending',
      paymentMethod: 'mobile',
      country: 'Côte d\'Ivoire',
      verificationStatus: 'pending'
    },
    {
      id: '3',
      investorName: 'Paul Mensah',
      email: 'paul.mensah@email.com',
      phone: '+233 244123456',
      amount: 10000,
      date: new Date('2024-01-17'),
      status: 'confirmed',
      paymentMethod: 'bank',
      country: 'Ghana',
      verificationStatus: 'verified'
    }
  ];

  useEffect(() => {
    setInvestments(mockInvestments);
  }, []);

  // Statistiques
  const stats = {
    totalRaised: investments.reduce((sum, inv) => inv.status === 'confirmed' ? sum + inv.amount : sum, 0),
    totalInvestors: investments.filter(inv => inv.status === 'confirmed').length,
    pendingAmount: investments.reduce((sum, inv) => inv.status === 'pending' ? sum + inv.amount : sum, 0),
    averageInvestment: investments.length > 0 ? 
      investments.reduce((sum, inv) => sum + inv.amount, 0) / investments.length : 0,
    conversionRate: investments.length > 0 ?
      (investments.filter(inv => inv.status === 'confirmed').length / investments.length * 100) : 0
  };

  // Filtrage des investissements
  const filteredInvestments = investments.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = inv.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Actions sur les investissements
  const confirmInvestment = (id: string) => {
    setInvestments(investments.map(inv => 
      inv.id === id ? { ...inv, status: 'confirmed', verificationStatus: 'verified' } : inv
    ));
  };

  const rejectInvestment = (id: string) => {
    setInvestments(investments.map(inv => 
      inv.id === id ? { ...inv, status: 'rejected', verificationStatus: 'rejected' } : inv
    ));
  };

  const exportData = () => {
    // Logique d'export CSV
    const csv = [
      ['Nom', 'Email', 'Téléphone', 'Montant', 'Date', 'Statut', 'Méthode', 'Pays'],
      ...filteredInvestments.map(inv => [
        inv.investorName,
        inv.email,
        inv.phone,
        inv.amount,
        inv.date.toLocaleDateString(),
        inv.status,
        inv.paymentMethod,
        inv.country
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
    <div className="min-h-screen py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard Admin - AfriStocks Capital Fund
        </h1>
        <p className="text-white/60">Gérez vos investisseurs et suivez la progression du fonds</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
      <div className="flex gap-4 mb-6">
        {['overview', 'investments', 'analytics', 'communications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab === 'overview' && 'Vue d\'ensemble'}
            {tab === 'investments' && 'Investissements'}
            {tab === 'analytics' && 'Analytiques'}
            {tab === 'communications' && 'Communications'}
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'investments' && (
        <div>
          {/* Barre d'outils */}
          <div className="flex flex-wrap gap-4 mb-6">
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
              <option value="confirmed">Confirmé</option>
              <option value="rejected">Rejeté</option>
            </select>

            <button
              onClick={exportData}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg text-white transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email groupé
            </button>
          </div>

          {/* Tableau des investissements */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvestments(filteredInvestments.map(inv => inv.id));
                          } else {
                            setSelectedInvestments([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium">Investisseur</th>
                    <th className="text-left p-4 text-white/60 font-medium">Contact</th>
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
                        <input
                          type="checkbox"
                          checked={selectedInvestments.includes(investment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvestments([...selectedInvestments, investment.id]);
                            } else {
                              setSelectedInvestments(selectedInvestments.filter(id => id !== investment.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{investment.investorName}</p>
                          <p className="text-white/40 text-sm">{investment.country}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white/80 text-sm">{investment.email}</p>
                          <p className="text-white/40 text-sm">{investment.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-semibold">{investment.amount.toLocaleString()}€</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white/80">{investment.date.toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 capitalize">
                          {investment.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          investment.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-400'
                            : investment.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {investment.status === 'confirmed' ? 'Confirmé' : 
                           investment.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {investment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => confirmInvestment(investment.id)}
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-all"
                                title="Confirmer"
                              >
                                <Check className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                onClick={() => rejectInvestment(investment.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                                title="Rejeter"
                              >
                                <Ban className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                          <button
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique de progression */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Progression de la levée</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Objectif: 50 000€</span>
                  <span className="text-white">30%</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Cette semaine</span>
                    <span className="text-orange-400">+5 000€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Ce mois</span>
                    <span className="text-orange-400">+12 500€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Temps restant</span>
                    <span className="text-white">45 jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dernières activités */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Activités récentes</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-white">Nouvel investissement de Jean Dupont</p>
                  <p className="text-white/40 text-sm">5 000€ • Il y a 2h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-white">Virement en attente de validation</p>
                  <p className="text-white/40 text-sm">2 500€ • Il y a 5h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-white">Email envoyé à 127 investisseurs</p>
                  <p className="text-white/40 text-sm">Newsletter mensuelle • Il y a 1 jour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundAdminDashboard;