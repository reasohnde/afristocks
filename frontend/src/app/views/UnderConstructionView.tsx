import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

interface UnderConstructionViewProps {
  setActiveView: (view: string) => void;
  section?: { section: string; item?: string };
}

const UnderConstructionView: React.FC<UnderConstructionViewProps> = ({ 
  setActiveView, 
  section 
}) => {
  const getSectionTitle = (sectionId: string) => {
    const titles: { [key: string]: string } = {
      'how-it-works': 'Comment ça marche',
      'pricing': 'Tarifs',
      'security': 'Sécurité',
      'api': 'API',
      'guide': 'Guide d\'investissement',
      'blog': 'Blog',
      'faq': 'FAQ',
      'support': 'Support',
      'learn-trading': 'Apprendre à Trader',
      'formations': 'Formations',
      'terms': 'Conditions d\'utilisation',
      'privacy': 'Politique de confidentialité',
      'compliance': 'Conformité',
      'licenses': 'Licences',
      'partner': 'Devenir partenaire',
      'advisor': 'Conseil financier',
      'help': 'Aide',
      'newsletter': 'Newsletter',
      'donate': 'Faire un don'
    };
    return titles[sectionId] || sectionId;
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-lg">
        <button
          onClick={() => setActiveView('home')}
          className="mb-8 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all inline-flex items-center gap-2 text-white/80"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        
        <div className="mt-8">
          <Construction className="w-24 h-24 text-orange-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Page en construction
          </h1>
          <p className="text-white/60 mb-2">
            La section "<span className="text-orange-400 font-semibold">{section ? getSectionTitle(section.section) : 'demandée'}</span>" 
            {section?.item && ` - ${section.item}`} sera bientôt disponible
          </p>
          <p className="text-white/40 text-sm mb-8">
            Nous travaillons dur pour vous offrir la meilleure expérience
          </p>
          
          <button
            onClick={() => setActiveView('home')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderConstructionView;