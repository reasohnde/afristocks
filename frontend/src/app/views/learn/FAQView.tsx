import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react';

interface FAQViewProps {
    setActiveView?: (view: string) => void;
}

const FAQView: React.FC<FAQViewProps> = ({ setActiveView }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedItems, setExpandedItems] = useState<number[]>([]);

    const faqs = [
        {
            id: 1,
            category: "Général",
            question: "Qu'est-ce qu'AfriStocks ?",
            answer: "AfriStocks est la première plateforme d'investissement en ligne dédiée aux startups africaines. Nous connectons les investisseurs avec des entreprises innovantes à travers le continent."
        },
        {
            id: 2,
            category: "Investissement",
            question: "Quel est le montant minimum pour investir ?",
            answer: "Le montant minimum d'investissement varie selon les startups, mais commence généralement à partir de 50 000 XOF. Pour notre fonds AfriStocks Capital, le minimum est de 50€."
        },
        {
            id: 3,
            category: "Sécurité",
            question: "Mes investissements sont-ils sécurisés ?",
            answer: "Oui, nous utilisons des technologies de cryptage avancées et travaillons avec des partenaires financiers régulés pour assurer la sécurité de vos fonds."
        },
        {
            id: 4,
            category: "Rendement",
            question: "Quel rendement puis-je espérer ?",
            answer: "Les rendements varient selon les startups et le marché. Notre fonds vise un rendement de 15-25% annuel, mais les performances passées ne garantissent pas les résultats futurs."
        },
        {
            id: 5,
            category: "Retrait",
            question: "Puis-je retirer mon argent à tout moment ?",
            answer: "Les investissements dans les startups ont généralement une période de blocage de 3-5 ans. Des options de sortie anticipée peuvent être disponibles selon les conditions."
        }
    ];

    const toggleExpand = (id: number) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                {setActiveView && (
                    <button
                        onClick={() => setActiveView('home')}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-white">Questions Fréquentes</h1>
                    <p className="text-white/60 mt-2">Trouvez rapidement des réponses à vos questions</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                    type="text"
                    placeholder="Rechercher une question..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-orange-500/50 focus:outline-none"
                />
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                    <div
                        key={faq.id}
                        className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
                    >
                        <button
                            onClick={() => toggleExpand(faq.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
                        >
                            <div className="text-left">
                                <span className="text-orange-400 text-sm font-medium">{faq.category}</span>
                                <h3 className="text-white font-semibold mt-1">{faq.question}</h3>
                            </div>
                            {expandedItems.includes(faq.id) ? (
                                <ChevronUp className="w-5 h-5 text-white/60" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-white/60" />
                            )}
                        </button>
                        {expandedItems.includes(faq.id) && (
                            <div className="px-6 pb-4">
                                <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-xl rounded-xl border border-orange-500/30 p-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                    Vous ne trouvez pas votre réponse ?
                </h3>
                <p className="text-white/80 mb-4">
                    Notre équipe est là pour vous aider
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all">
                    Contacter le support
                </button>
            </div>
        </div>
    );
};

export default FAQView;