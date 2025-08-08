import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, Download, CheckCircle, XCircle,
  AlertCircle, User, Calendar, MapPin, Phone, Mail,
  ChevronLeft, Loader, ZoomIn, RotateCw, Eye, Clock,
  Building2, FileCheck, AlertTriangle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface AdminVerificationViewProps {
  setActiveView: (view: string) => void;
}

interface UserProfile {
  country?: string;
  city?: string;
  address?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  created_at: string;
  kyc_status: string;
  profile?: UserProfile;
  type?: 'investor' | 'startup';
}

interface Document {
  id: string;
  type: string;
  url: string;
  uploaded_at: string;
  status: string;
}

const AdminVerificationView: React.FC<AdminVerificationViewProps> = ({ setActiveView }) => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'investor' | 'startup'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users?kycStatus=PENDING`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPendingUsers(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const fetchUserDocuments = async (userId: string) => {
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
      setVerifying(false);
    } catch (error) {
      console.error('Erreur:', error);
      setVerifying(false);
    }
  };

  const approveKYC = async () => {
    if (!selectedUser) return;

    const confirmed = window.confirm(`Êtes-vous sûr de vouloir approuver la vérification KYC de ${selectedUser.name} ?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/verify-kyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('KYC approuvé avec succès!');
        setSelectedUser(null);
        fetchPendingVerifications();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const rejectKYC = async () => {
    if (!selectedUser || !rejectReason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/reject-kyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await response.json();
      if (data.success) {
        alert('KYC rejeté');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedUser(null);
        fetchPendingVerifications();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du rejet');
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = pendingUsers.filter(user => {
    const matchesFilter = filter === 'all' || user.type === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Checklist de vérification
  const VerificationChecklist = () => {
    const checkItems = [
      { id: 'identity', label: 'Pièce d\'identité valide et non expirée', checked: false },
      { id: 'address', label: 'Justificatif de domicile récent (< 3 mois)', checked: false },
      { id: 'selfie', label: 'Photo selfie claire avec document', checked: false },
      { id: 'info_match', label: 'Informations correspondent au profil', checked: false },
      { id: 'quality', label: 'Documents lisibles et de bonne qualité', checked: false }
    ];

    const [checks, setChecks] = useState(checkItems);

    const toggleCheck = (id: string) => {
      setChecks(checks.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    };

    const allChecked = checks.every(item => item.checked);

    return (
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Checklist de Vérification
        </h4>
        <div className="space-y-2">
          {checks.map(item => (
            <label
              key={item.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleCheck(item.id)}
                className="w-4 h-4 text-emerald-500 bg-white/10 border-white/20 rounded focus:ring-emerald-500"
              />
              <span className={`text-sm ${item.checked ? 'text-white' : 'text-white/60'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
        {allChecked && (
          <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-400 text-sm text-center font-medium">
              ✓ Toutes les vérifications sont complètes
            </p>
          </div>
        )}
      </div>
    );
  };

  // Modal de zoom sur image
  const ImageZoomModal = () => {
    if (!zoomedImage) return null;

    return (
      <div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        onClick={() => setZoomedImage(null)}
      >
        <div className="relative max-w-4xl max-h-[90vh]">
          <img
            src={zoomedImage}
            alt="Document zoom"
            className="w-full h-full object-contain rounded-lg"
          />
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Rotation de l'image
              const img = document.querySelector('img[alt="Document zoom"]') as HTMLImageElement;
              if (img) {
                const currentRotation = img.style.transform.match(/rotate\((\d+)deg\)/) || ['', '0'];
                const newRotation = (parseInt(currentRotation[1]) + 90) % 360;
                img.style.transform = `rotate(${newRotation}deg)`;
              }
            }}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            title="Rotation"
          >
            <RotateCw className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    );
  };

  // Modal de rejet
  const RejectModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Rejeter la vérification KYC</h3>
        <p className="text-white/60 mb-4">
          Veuillez indiquer la raison du rejet pour {selectedUser?.name}
        </p>

        <div className="space-y-3 mb-4">
          {[
            'Documents illisibles',
            'Documents expirés',
            'Informations non conformes',
            'Suspicion de fraude',
            'Documents incomplets'
          ].map(reason => (
            <button
              key={reason}
              onClick={() => setRejectReason(reason)}
              className={`w-full p-3 rounded-lg text-left transition-all ${rejectReason === reason
                  ? 'bg-red-500/20 border border-red-500/30 text-white'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
            >
              {reason}
            </button>
          ))}
        </div>

        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 mb-4"
          rows={3}
          placeholder="Ou entrez une raison personnalisée..."
        />

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
            }}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            Annuler
          </button>
          <button
            onClick={rejectKYC}
            disabled={!rejectReason}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all disabled:opacity-50"
          >
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('admin-dashboard')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Vérifications KYC</h1>
            <p className="text-white/60">Validez les documents d'identité des utilisateurs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPendingVerifications}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            title="Rafraîchir"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-4 py-2">
            <p className="text-amber-400 font-semibold">
              {filteredUsers.length} vérifications en attente
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 p-1 bg-white/10 rounded-xl">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'investor', label: 'Investisseurs', icon: User },
            { value: 'startup', label: 'Startups', icon: Building2 }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${filter === option.value
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              {option.icon && <option.icon className="w-4 h-4" />}
              {option.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des utilisateurs en attente */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Utilisateurs en attente</h2>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                fetchUserDocuments(user.id);
              }}
              className={`p-4 bg-white/10 rounded-xl border transition-all cursor-pointer ${selectedUser?.id === user.id
                  ? 'border-amber-500/50 bg-white/15'
                  : 'border-white/20 hover:bg-white/15'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  {user.name}
                  {user.type === 'startup' ? (
                    <Building2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <User className="w-4 h-4 text-blue-400" />
                  )}
                </h3>
                <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                  En attente
                </span>
              </div>
              <p className="text-sm text-white/60">{user.email}</p>
              <p className="text-sm text-white/60">{user.phone_number || 'Pas de téléphone'}</p>
              <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>

        {/* Zone de vérification */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* Informations utilisateur */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  Informations du profil
                  {selectedUser.type === 'startup' ? (
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <User className="w-5 h-5 text-blue-400" />
                  )}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <User className="w-4 h-4 text-white/60" />
                      <span>{selectedUser.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Mail className="w-4 h-4 text-white/60" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Phone className="w-4 h-4 text-white/60" />
                      <span>{selectedUser.phone_number || 'Non renseigné'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span>Inscrit le {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="w-4 h-4 text-white/60" />
                      <span>{selectedUser.profile?.country || 'Pays non renseigné'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Documents soumis</h2>
                {verifying ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-8 h-8 text-white/60 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Simuler des documents pour la démo */}
                    {[
                      { type: 'identity', label: 'Pièce d\'identité', url: '/placeholder-id.jpg' },
                      { type: 'address', label: 'Justificatif de domicile', url: '/placeholder-address.jpg' },
                      { type: 'selfie', label: 'Selfie avec document', url: '/placeholder-selfie.jpg' }
                    ].map(doc => (
                      <div
                        key={doc.type}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">{doc.label}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setZoomedImage(doc.url)}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                              title="Agrandir"
                            >
                              <ZoomIn className="w-4 h-4 text-white" />
                            </button>
                            <button
                              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-lg h-40 flex items-center justify-center text-white/40 hover:bg-white/15 cursor-pointer transition-all">
                          <FileText className="w-12 h-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklist et actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VerificationChecklist />

                <div className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-400 font-medium">Attention</p>
                        <p className="text-xs text-white/60 mt-1">
                          Vérifiez attentivement tous les documents avant d'approuver.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={approveKYC}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approuver la vérification
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rejeter la vérification
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center">
              <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Sélectionnez un utilisateur pour commencer la vérification</p>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && <RejectModal />}
      <ImageZoomModal />
    </div>
  );
};

export default AdminVerificationView;