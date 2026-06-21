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
    if (!value || value < 1000) { setError('Le montant minimum est de 1000 XOF.'); return; }
    if (!accountName || !bankName || !accountNumber) { setError('Coordonnées bancaires incomplètes.'); return; }
    setLoading(true);
    try {
      await walletService.withdraw({ amount: value, bankDetails: { accountNumber, bankName, accountName } });
      setSuccess('Demande de retrait enregistrée (frais 1%). Redirection…');
      setTimeout(() => setActiveView('portfolio'), 1400);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Échec du retrait. Vérifiez votre solde.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none';

  return (
    <div className="max-w-md mx-auto py-8 text-slate-900">
      <button onClick={() => setActiveView('portfolio')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour au portefeuille
      </button>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-md bg-blue-50"><ArrowDownRight className="w-5 h-5 text-blue-700" /></div>
          <h2 className="text-xl font-semibold text-slate-900">Retirer des fonds</h2>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant (XOF)</label>
            <input type="number" min={1000} step={100} required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min. 1000" className={field} />
            <p className="text-xs text-slate-400 mt-1">Des frais de 1% s'appliquent.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titulaire du compte</label>
            <input type="text" required value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Nom complet" className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Banque</label>
            <input type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Nom de la banque" className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de compte / IBAN</label>
            <input type="text" required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Numéro de compte" className={field} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-md font-medium transition-colors disabled:opacity-60">
            {loading ? 'Traitement…' : 'Confirmer le retrait'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawView;
