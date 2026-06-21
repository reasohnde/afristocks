import React, { useState } from 'react';
import { ArrowLeft, ArrowDownRight } from 'lucide-react';
import { walletService } from '../../services/api';

interface WithdrawViewProps {
  setActiveView: (view: string) => void;
}

const WithdrawView: React.FC<WithdrawViewProps> = ({ setActiveView }) => {
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const value = Number(amount);
    if (!value || value < 1000) {
      setError('Le montant minimum est de 1000 XOF.');
      return;
    }
    if (!accountName || !bankName || !accountNumber) {
      setError('Coordonnées bancaires incomplètes.');
      return;
    }
    setLoading(true);
    try {
      await walletService.withdraw({
        amount: value,
        bankDetails: { accountNumber, bankName, accountName },
      });
      setSuccess('Demande de retrait enregistrée (frais 1%). Redirection…');
      setTimeout(() => setActiveView('portfolio'), 1400);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Échec du retrait. Vérifiez votre solde.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-orange-500 focus:border-transparent';

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <button
        onClick={() => setActiveView('portfolio')}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au portefeuille
      </button>

      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-8"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-orange-500/20"><ArrowDownRight className="w-6 h-6 text-orange-400" /></div>
          <h2 className="text-2xl font-bold text-white">Retirer des fonds</h2>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-200 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-lg bg-green-500/20 text-green-200 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Montant (XOF)</label>
            <input type="number" min={1000} step={100} required value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="Min. 1000" className={field} />
            <p className="text-xs text-white/40 mt-1">Des frais de 1% s'appliquent.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Titulaire du compte</label>
            <input type="text" required value={accountName}
              onChange={(e) => setAccountName(e.target.value)} placeholder="Nom complet" className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Banque</label>
            <input type="text" required value={bankName}
              onChange={(e) => setBankName(e.target.value)} placeholder="Nom de la banque" className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Numéro de compte / IBAN</label>
            <input type="text" required value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)} placeholder="Numéro de compte" className={field} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60">
            {loading ? 'Traitement…' : 'Confirmer le retrait'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawView;
