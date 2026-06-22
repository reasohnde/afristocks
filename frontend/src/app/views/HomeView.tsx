import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Smartphone, TrendingUp, Wallet, Users, CheckCircle } from 'lucide-react';
import { startupService } from '../../services/api';

interface HomeViewProps {
  isAuthenticated: boolean;
  user: any;
  mounted: boolean;
  setActiveView: (view: string) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  setShowAuthModal: (show: boolean) => void;
  setShowAccountTypeSelection: (show: boolean) => void;
}

const fmtFCFA = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString('fr-FR') + ' FCFA';

const HomeView: React.FC<HomeViewProps> = ({
  isAuthenticated,
  setActiveView,
  setAuthMode,
  setShowAuthModal,
  setShowAccountTypeSelection,
}) => {
  const [stats, setStats] = useState<{ count: number; raised: number } | null>(null);

  // Vrais chiffres depuis le backend (startups publiques).
  useEffect(() => {
    let active = true;
    startupService
      .getAll()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data?.startups ?? res.data?.data ?? [];
        const count = res.data?.data?.pagination?.total ?? (Array.isArray(list) ? list.length : 0);
        const raised = (Array.isArray(list) ? list : []).reduce((s: number, x: any) => s + (Number(x.raisedAmount) || 0), 0);
        setStats({ count, raised });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const register = () => {
    if (isAuthenticated) { setActiveView('portfolio'); return; }
    setShowAccountTypeSelection(true);
  };
  const login = () => { setAuthMode('login'); setShowAuthModal(true); };

  const features = [
    { icon: Wallet, title: 'Dès 1 000 FCFA', text: "Investissez de petits montants dans des startups africaines, sans barrière à l'entrée." },
    { icon: ShieldCheck, title: 'Startups sélectionnées', text: "Chaque opportunité est étudiée avant d'être ouverte à l'investissement." },
    { icon: Smartphone, title: 'Mobile Money', text: 'Déposez et investissez simplement, avec les moyens de paiement locaux.' },
    { icon: TrendingUp, title: 'Suivi en temps réel', text: 'Visualisez votre portefeuille, vos positions et vos transactions à tout moment.' },
  ];

  const steps = [
    { n: '1', title: 'Créez votre compte', text: "Inscription en quelques minutes, vérification d'identité incluse." },
    { n: '2', title: 'Alimentez votre portefeuille', text: 'Déposez des fonds en toute sécurité via Mobile Money.' },
    { n: '3', title: 'Investissez', text: 'Choisissez des startups et suivez la croissance de vos investissements.' },
  ];

  const card = 'bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-xl';

  return (
    <div className="space-y-20 pb-8">
      {/* HERO */}
      <section className="grid lg:grid-cols-2 gap-10 items-center pt-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Plateforme d'investissement en startups africaines
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Investissez dans l'avenir<br /> de l'Afrique.
          </h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
            Soutenez des startups africaines prometteuses dès 1 000 FCFA, suivez vos investissements en temps réel, déposez et retirez par Mobile Money.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={register} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-colors">
              Créer un compte <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveView('startups')} className="px-6 py-3 rounded-lg bg-white dark:bg-[#0f141c] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              Découvrir les startups
            </button>
          </div>
          {!isAuthenticated && (
            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              <button onClick={login} className="hover:text-slate-800 dark:hover:text-slate-200">Déjà un compte ? Se connecter</button>
            </div>
          )}
        </div>
        <div className="relative">
          <img src="/images/hero.png" alt="Entrepreneure africaine" className="w-full h-[360px] md:h-[440px] object-cover rounded-2xl shadow-xl" />
        </div>
      </section>

      {/* STATS RÉELLES */}
      <section className={`${card} px-6 py-8`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{stats ? stats.count : '—'}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Startups disponibles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{stats ? fmtFCFA(stats.raised) : '—'}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Déjà levés sur la plateforme</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">1 000 FCFA</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Investissement minimum</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">Pourquoi AfriStocks</h2>
        <p className="mt-2 text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Une plateforme pensée pour rendre l'investissement accessible, simple et transparent.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className={`${card} p-6`}>
              <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION + IMAGE */}
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <img src="/images/innovation.png" alt="Équipe de startup africaine" className="w-full h-[320px] object-cover rounded-2xl shadow-lg order-2 lg:order-1" />
        <div className="order-1 lg:order-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Financer les talents qui construisent l'Afrique</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Les startups africaines manquent souvent d'accès au capital. AfriStocks connecte ces entreprises prometteuses à une communauté d'investisseurs, petits et grands.
          </p>
          <ul className="mt-5 space-y-2.5">
            {['Des opportunités étudiées avant publication', 'Un investissement minimum accessible à tous', 'Un impact concret sur l\'économie locale'].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">Comment ça marche</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className={`${card} p-6`}>
              <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">{s.n}</div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MOBILE MONEY + IMAGE */}
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Simple, où que vous soyez</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Déposez et retirez vos fonds avec les solutions de Mobile Money que vous utilisez déjà au quotidien. Aucune complexité, tout depuis votre téléphone.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users className="w-4 h-4" /> Pensé pour les investisseurs d'Afrique de l'Ouest.
          </div>
        </div>
        <img src="/images/mobile-money.png" alt="Paiement par Mobile Money" className="w-full h-[320px] object-cover rounded-2xl shadow-lg" />
      </section>

      {/* CTA FINAL */}
      <section className="rounded-2xl bg-blue-700 dark:bg-blue-800 px-6 py-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Prêt à investir dans l'Afrique de demain ?</h2>
        <p className="mt-3 text-blue-100 max-w-xl mx-auto">Créez votre compte en quelques minutes et commencez dès 1 000 FCFA.</p>
        <button onClick={register} className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors">
          Créer un compte <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};

export default HomeView;
