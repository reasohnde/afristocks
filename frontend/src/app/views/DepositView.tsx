import React, { useState } from 'react';
import { ArrowLeft, Wallet } from 'lucide-react';
import { walletService } from '../../services/api';

interface DepositViewProps {
  setActiveView: (view: string) => void;
}

const PAYMENT_METHODS = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'CARD', label: 'Carte bancaire' },
];

const DepositView: React.FC<DepositViewProps> = ({ setActiveView }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
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
    setLoading(true);
    try {
      await walletService.deposit({ amount: value, paymentMethod });
      setSuccess('Dépôt enregistré avec succès. Redirection…');
      setTimeout(() => setActiveView('portfolio'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Échec du dépôt. Veuillez réessayer.');
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
          <div className="p-2.5 rounded-md bg-blue-50"><Wallet className="w-5 h-5 text-blue-700" /></div>
          <h2 className="text-xl font-semibold text-slate-900">Déposer des fonds</h2>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant (XOF)</label>
            <input type="number" min={1000} step={100} required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min. 1000" className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Méthode de paiement</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={field}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-md font-medium transition-colors disabled:opacity-60">
            {loading ? 'Traitement…' : 'Confirmer le dépôt'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepositView;
