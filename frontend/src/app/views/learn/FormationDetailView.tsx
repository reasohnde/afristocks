import React from 'react';
import { ArrowLeft, Clock, Award, Users, CheckCircle } from 'lucide-react';

interface FormationDetailViewProps {
    formation: any;
    setActiveView: (view: string) => void;
    isAuthenticated: boolean;
    setShowAuthModal: (show: boolean) => void;
    setAuthMode: (mode: string) => void;
    user: any;
}

const FormationDetailView: React.FC<FormationDetailViewProps> = ({
    formation,
    setActiveView,
    isAuthenticated,
    setShowAuthModal,
    setAuthMode
}) => {
    if (!formation) {
        return null;
    }

    const modules = [
        { title: "Introduction aux marchés financiers", duration: "15 min", completed: true },
        { title: "Types d'investissements", duration: "20 min", completed: true },
        { title: "Analyse fondamentale", duration: "25 min", completed: false },
        { title: "Gestion des risques", duration: "30 min", completed: false },
        { title: "Stratégies d'investissement", duration: "35 min", completed: false }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setActiveView('formations')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white">{formation.title}</h1>
                    <div className="flex items-center gap-6 mt-2 text-white/60">
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formation.duration}
                        </span>
                        <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {formation.level}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {formation.enrolled} inscrits
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">À propos de cette formation</h2>
                        <p className="text-white/80 leading-relaxed">{formation.description}</p>
                    </div>

                    {/* Modules */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Contenu de la formation</h2>
                        <div className="space-y-3">
                            {modules.map((module, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${module.completed ? 'bg-emerald-500' : 'bg-white/20'
                                            }`}>
                                            {module.completed ? (
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            ) : (
                                                <span className="text-white/60 text-sm">{index + 1}</span>
                                            )}
                                        </div>
                                        <span className={`${module.completed ? 'text-white' : 'text-white/60'}`}>
                                            {module.title}
                                        </span>
                                    </div>
                                    <span className="text-white/60 text-sm">{module.duration}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Commencer la formation</h3>
                        {isAuthenticated ? (
                            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all">
                                Continuer l'apprentissage
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setAuthMode('register');
                                    setShowAuthModal(true);
                                }}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all"
                            >
                                S'inscrire pour commencer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormationDetailView;