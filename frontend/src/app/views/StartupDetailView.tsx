import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { startupService, investmentService } from '../../services/api';

interface StartupDetailViewProps {
  startup: any;
  setActiveView: (view: string) => void;
  isAuthenticated: boolean;
  setShowAuthModal: (show: boolean) => void;
  setAuthMode: (mode: string) => void;
  user: any;
}

const fmtXOF = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString('fr-FR') + ' XOF';
const fmtDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StartupDetailView: React.FC<StartupDetailViewProps> = ({
  startup, setActiveView, isAuthenticated, setShowAuthModal, setAuthMode,
}) => {
  const [data, setData] = useState<any>(startup);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    if (!startup?.id) return;
    startupService
      .getById(String(startup.id))
      .then((res) => { if (active && res.data?.data) setData((prev: any) => ({ ...prev, ...res.data.data })); })
      .catch(() => {});
    return () => { active = false; };
  }, [startup?.id]);

  const target = Number(data.valuationTarget) || 0;
  const raised = Number(data.raisedAmount) || 0;
  const min = Number(data.minInvestment) || 1000;
  const max = Number(data.maxInvestment) || 0;
  const progress = Math.max(0, Math.min(100, Number(data.progress) || (target ? (raised / target) * 100 : 0)));

  const invest = async () => {
    setMsg(null);
    if (!isAuthenticated) { setAuthMode('login'); setShowAuthModal(true); return; }
    const v = Number(amount);
    if (!v || v < min) { setMsg({ type: 'err', text: `Le montant minimum est de ${fmtXOF(min)}.` }); return; }
    if (max && v > max) { setMsg({ type: 'err', text: `Le montant maximum est de ${fmtXOF(max)}.` }); return; }
    setSubmitting(true);
    try {
      await investmentService.invest(String(data.id), { amount: v });
      setMsg({ type: 'ok', text: `Investissement de ${fmtXOF(v)} confirmé. Redirection…` });
      setTimeout(() => setActiveView('portfolio'), 1400);
    } catch (e: any) {
      setMsg({ type: 'err', text: e?.response?.data?.message || "Échec de l'investissement." });
    } finally {
      setSubmitting(false);
    }
  };

  const card = 'bg-white border border-slate-200 rounded-lg shadow-sm';
  const Kpi = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 font-semibold text-slate-900 tabular-nums">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6 text-slate-900">
      <button onClick={() => setActiveView('startups')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Startups
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xl font-semibold overflow-hidden shrink-0">
                {data.logo ? <img src={data.logo} alt="" className="w-full h-full object-cover" /> : (data.name || '?').slice(0, 1)}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
                {data.website && <a href={data.website} target="_blank" rel="noreferrer" className="text-sm text-blue-700 hover:underline break-all">{data.website}</a>}
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{data.description || '—'}</p>
          </div>

          <div className={card}>
            <div className="px-6 py-4 border-b border-slate-200"><h2 className="text-sm font-semibold text-slate-900">Campagne</h2></div>
            <div className="p-6">
              <div className="flex justify-between text-sm mb-1 tabular-nums">
                <span className="text-slate-600">{fmtXOF(raised)} levés</span>
                <span className="text-slate-900 font-medium">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} /></div>
              <div className="text-xs text-slate-400 mb-4">Objectif : {fmtXOF(target)}</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                <Kpi label="Min." value={fmtXOF(min)} />
                <Kpi label="Max." value={max ? fmtXOF(max) : '—'} />
                <Kpi label="Investisseurs" value={String(data.investorCount ?? '—')} />
                <Kpi label="Clôture" value={fmtDate(data.endDate)} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className={`${card} p-6 lg:sticky lg:top-24`}>
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Investir</h2>
            {msg && (
              <div className={`mb-4 p-3 rounded-md text-sm ${msg.type === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{msg.text}</div>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant (XOF)</label>
            <input
              type="number" min={min} step={100} value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min. ${min.toLocaleString('fr-FR')}`}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Min. {fmtXOF(min)}{max ? ` · Max. ${fmtXOF(max)}` : ''}</p>
            <button onClick={invest} disabled={submitting} className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-md font-medium transition-colors disabled:opacity-60">
              {submitting ? 'Traitement…' : isAuthenticated ? 'Investir' : 'Se connecter pour investir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDetailView;
