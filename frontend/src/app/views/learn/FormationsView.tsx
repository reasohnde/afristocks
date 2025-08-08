import React from 'react';
import { BookOpen, Clock, Award, TrendingUp, ArrowLeft } from 'lucide-react';

interface FormationsViewProps {
    setActiveView: (view: string) => void;
    setSelectedFormation: (formation: any) => void;
}

const FormationsView: React.FC<FormationsViewProps> = ({ setActiveView, setSelectedFormation }) => {
    const formations = [
        {
            id: 1,
            title: "Introduction à l'investissement",
            description: "Apprenez les bases de l'investissement et comment démarrer",
            duration: "2 heures",
            level: "Débutant",
            modules: 5,
            enrolled: 1234
        },
        {
            id: 2,
            title: "Analyse des startups",
            description: "Comment évaluer le potentiel d'une startup avant d'investir",
            duration: "3 heures",
            level: "Intermédiaire",
            modules: 8,
            enrolled: 856
        },
        {
            id: 3,
            title: "Gestion de portfolio",
            description: "Stratégies pour diversifier et optimiser vos investissements",
            duration: "4 heures",
            level: "Avancé",
            modules: 10,
            enrolled: 523
        }
    ];

    const handleFormationClick = (formation: any) => {
        setSelectedFormation(formation);
        setActiveView('formation-detail');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setActiveView('home')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Formations</h1>
                    <p className="text-white/60 mt-2">Développez vos compétences en investissement</p>
                </div>
            </div>

            {/* Formations Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formations.map((formation) => (
                    <div
                        key={formation.id}
                        onClick={() => handleFormationClick(formation)}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6 text-orange-400" />
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                            {formation.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-4 line-clamp-2">
                            {formation.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-white/60">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formation.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    {formation.level}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-white/60 text-sm">{formation.modules} modules</span>
                                <span className="text-orange-400 text-sm font-medium">
                                    {formation.enrolled} inscrits
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormationsView; 