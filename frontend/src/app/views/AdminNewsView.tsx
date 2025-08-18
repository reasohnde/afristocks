// frontend/src/app/views/AdminNewsView.tsx
import React, { useState, useEffect } from 'react';
import {
    Plus, Edit3, Trash2, Eye, EyeOff, Search, Filter, Calendar,
    TrendingUp, Users, Clock, ChevronDown, X, Upload, Image as ImageIcon,
    Bell, BarChart3, ArrowUpRight, AlertCircle, CheckCircle,
    Send, Tag, FileText, Globe, Activity, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface News {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    importance: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    imageUrl?: string;
    tags: string[];
    publishedAt?: string;
    scheduledAt?: string;
    isActive: boolean;
    viewCount: number;
    author: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface NewsAnalytics {
    totalViews: number;
    uniqueViewers: number;
    avgReadTime: number;
    shareCount: number;
    topCategories: { category: string; count: number }[];
    viewsTrend: { date: string; views: number }[];
}

interface AdminNewsViewProps {
    setActiveView: (view: string) => void;
}

interface NewsFormData {
    title: string;
    summary: string;
    content: string;
    category: string;
    importance: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    tags: string[];
    imageUrl: string;
    publishedAt: string;
    isActive: boolean;
    sendNotification: boolean;
}

const AdminNewsView: React.FC<AdminNewsViewProps> = ({ setActiveView }) => {
    const [activeTab, setActiveTab] = useState<'list' | 'create' | 'analytics' | 'notifications'>('list');
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<News | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterImportance, setFilterImportance] = useState('all');
    const [analytics, setAnalytics] = useState<NewsAnalytics | null>(null);

    // État pour le formulaire
    const [formData, setFormData] = useState<NewsFormData>({
        title: '',
        summary: '',
        content: '',
        category: 'MARKET_UPDATE',
        importance: 'NORMAL',
        tags: [],
        imageUrl: '',
        publishedAt: new Date().toISOString().slice(0, 16),
        isActive: true,
        sendNotification: false
    });

    const [tagInput, setTagInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Catégories disponibles
    const categories = [
        { value: 'MARKET_UPDATE', label: 'Actualité Marché', icon: TrendingUp },
        { value: 'STARTUP_NEWS', label: 'News Startups', icon: Zap },
        { value: 'INVESTMENT', label: 'Investissement', icon: BarChart3 },
        { value: 'REGULATION', label: 'Régulation', icon: FileText },
        { value: 'TECHNOLOGY', label: 'Technologie', icon: Globe },
        { value: 'ANALYSIS', label: 'Analyses', icon: Activity }
    ];

    // Chargement des news
    useEffect(() => {
        fetchNews();
        if (activeTab === 'analytics') {
            fetchAnalytics();
        }
    }, [activeTab]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Utiliser la même URL que NewsSection
            const response = await fetch('http://localhost:5001/api/v1/news?limit=100', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('📰 News récupérées:', data);

            setNews(data.data || []);
        } catch (error) {
            console.error('Erreur chargement news:', error);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/v1/news/stats/overview', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Erreur chargement analytics:', error);
        }
    };

    // Gestion du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // Vérifier le token
            if (!token) {
                alert('Erreur: Vous devez être connecté en tant qu\'admin');
                setIsSubmitting(false);
                return;
            }

            // Préparer les données
            const newsData = {
                title: formData.title,
                summary: formData.summary || '',
                content: formData.content,
                category: formData.category,
                importance: formData.importance,
                tags: formData.tags || [],
                imageUrl: formData.imageUrl || '',
                isActive: formData.isActive === true,
                publishedAt: formData.publishedAt || new Date().toISOString(),
                sendNotification: formData.sendNotification || false
            };

            console.log('📤 Envoi des données:', newsData);
            console.log('🔑 Token:', token.substring(0, 20) + '...');

            const url = selectedNews
                ? `http://localhost:5001/api/v1/news/${selectedNews.id}`
                : 'http://localhost:5001/api/v1/news';

            const method = selectedNews ? 'PUT' : 'POST';

            console.log(`📍 ${method} ${url}`);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newsData)
            });

            console.log('📥 Statut réponse:', response.status, response.statusText);

            // Lire le texte de la réponse d'abord
            const responseText = await response.text();
            console.log('📄 Réponse brute:', responseText);

            // Essayer de parser en JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Erreur parsing JSON:', parseError);
                console.error('Réponse non-JSON:', responseText);
                alert(`Erreur serveur: ${responseText.substring(0, 200)}`);
                return;
            }

            console.log('📦 Réponse parsée:', result);

            if (response.ok && result.success) {
                console.log('✅ Succès:', result.message);
                alert(result.message || 'Actualité sauvegardée avec succès !');

                // Recharger la liste
                await fetchNews();

                // Réinitialiser
                resetForm();
                setActiveTab('list');
            } else {
                // Erreur avec détails
                const errorMessage = result.error || result.message || 'Erreur inconnue';
                const errorDetails = result.details || '';

                console.error('❌ Erreur serveur:', {
                    status: response.status,
                    error: errorMessage,
                    details: errorDetails,
                    fullResponse: result
                });

                alert(`Erreur: ${errorMessage}\n${errorDetails}`);
            }
        } catch (error) {
            console.error('❌ Erreur catch:', error);

            // Afficher l'erreur complète
            if (error instanceof Error) {
                alert(`Erreur: ${error.message}`);
            } else {
                alert('Erreur de connexion au serveur');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedNews) return;

        try {
            const response = await fetch(`/api/v1/news/${selectedNews.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                await fetchNews();
                setShowDeleteModal(false);
                setSelectedNews(null);
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            summary: '',
            content: '',
            category: 'MARKET_UPDATE',
            importance: 'NORMAL',
            tags: [],
            imageUrl: '',
            publishedAt: new Date().toISOString().slice(0, 16),
            isActive: true,
            sendNotification: false
        });
        setSelectedNews(null);
        setImageFile(null);
        setTagInput('');
    };

    const sendPushNotification = async (title: string, body: string) => {
        try {
            await fetch('/api/v1/notifications/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title, body, data: { type: 'news' } })
            });
        } catch (error) {
            console.error('Erreur envoi notification:', error);
        }
    };

    // Filtrage des news
    const filteredNews = news.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesImportance = filterImportance === 'all' || item.importance === filterImportance;
        return matchesSearch && matchesCategory && matchesImportance;
    });

    // Composant carte de news
    const NewsCard = ({ item }: { item: News }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-2">{item.summary}</p>
                </div>
                {item.imageUrl && (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover ml-4"
                    />
                )}
            </div>

            <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.importance === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                    item.importance === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        item.importance === 'NORMAL' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                    }`}>
                    {item.importance}
                </span>

                <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                    {categories.find(c => c.value === item.category)?.label}
                </span>

                <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    {item.isActive ? 'Publié' : 'Brouillon'}
                </span>
            </div>

            <div className="flex items-center justify-between text-xs text-white/50">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.viewCount} vues
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setSelectedNews(item);
                            setFormData({
                                title: item.title,
                                summary: item.summary || '',
                                content: item.content,
                                category: item.category,
                                importance: item.importance,
                                tags: item.tags || [],
                                imageUrl: item.imageUrl || '',
                                publishedAt: item.publishedAt || new Date().toISOString().slice(0, 16),
                                isActive: item.isActive,
                                sendNotification: false
                            });
                            setActiveTab('create');
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <Edit3 className="w-4 h-4 text-white/70" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedNews(item);
                            setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestion des Actualités</h1>
                    <p className="text-white/60 mt-1">Créez et gérez les actualités de la plateforme</p>
                </div>
                <button
                    onClick={() => setActiveView('admin-dashboard')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                    Retour au dashboard
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                {[
                    { id: 'list', label: 'Liste des actualités', icon: FileText },
                    { id: 'create', label: selectedNews ? 'Modifier' : 'Créer', icon: Plus },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                    { id: 'notifications', label: 'Notifications', icon: Bell }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${activeTab === tab.id
                            ? 'text-orange-400 border-b-2 border-orange-400'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenu des tabs */}
            <AnimatePresence mode="wait">
                {activeTab === 'list' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Filtres */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[300px] relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher une actualité..."
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                                />
                            </div>

                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                            >
                                <option value="all">Toutes les catégories</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>

                            <select
                                value={filterImportance}
                                onChange={(e) => setFilterImportance(e.target.value)}
                                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                            >
                                <option value="all">Toute importance</option>
                                <option value="URGENT">Urgent</option>
                                <option value="HIGH">Haute</option>
                                <option value="NORMAL">Normale</option>
                                <option value="LOW">Basse</option>
                            </select>

                            <button
                                onClick={() => {
                                    resetForm();
                                    setActiveTab('create');
                                }}
                                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Nouvelle actualité
                            </button>
                        </div>

                        {/* Liste */}
                        {loading ? (
                            <div className="grid gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-40 bg-white/10 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredNews.length === 0 ? (
                            <div className="text-center py-20">
                                <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                <p className="text-white/60">Aucune actualité trouvée</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredNews.map(item => (
                                    <NewsCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'create' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                            {/* Informations principales */}
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4">
                                <h3 className="text-xl font-semibold text-white mb-4">Informations principales</h3>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Titre <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                                        placeholder="Titre de l'actualité"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Résumé
                                    </label>
                                    <textarea
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                                        placeholder="Résumé court de l'actualité"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Contenu <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                                        placeholder="Contenu détaillé de l'actualité"
                                        rows={8}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Catégorie et importance */}
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4">
                                <h3 className="text-xl font-semibold text-white mb-4">Classification</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Catégorie
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Importance
                                        </label>
                                        <select
                                            value={formData.importance}
                                            onChange={(e) => setFormData({ ...formData, importance: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="LOW">Basse</option>
                                            <option value="NORMAL">Normale</option>
                                            <option value="HIGH">Haute</option>
                                            <option value="URGENT">Urgente</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-white/20 rounded-full text-sm text-white flex items-center gap-2"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newTags = [...formData.tags];
                                                        newTags.splice(index, 1);
                                                        setFormData({ ...formData, tags: newTags });
                                                    }}
                                                    className="hover:text-red-400"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (tagInput.trim()) {
                                                        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
                                                        setTagInput('');
                                                    }
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                                            placeholder="Ajouter un tag et appuyer sur Entrée"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Image et publication */}
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4">
                                <h3 className="text-xl font-semibold text-white mb-4">Média et publication</h3>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Image
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Choisir une image
                                        </label>
                                        {(imageFile || formData.imageUrl) && (
                                            <span className="text-sm text-white/60">
                                                {imageFile ? imageFile.name : 'Image existante'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Date de publication
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.publishedAt}
                                            onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="text-white">Publier immédiatement</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.importance === 'URGENT' && (
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.sendNotification}
                                            onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                                            className="w-5 h-5 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-white">Envoyer une notification push</span>
                                    </label>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setActiveTab('list');
                                    }}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(true)}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Prévisualiser
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            {selectedNews ? 'Mettre à jour' : 'Publier'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <Eye className="w-8 h-8 text-blue-400" />
                                    <span className="text-xs text-blue-400 font-medium">+12%</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{analytics?.totalViews.toLocaleString() || 0}</p>
                                <p className="text-sm text-white/60">Vues totales</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <Users className="w-8 h-8 text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-medium">+8%</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{analytics?.uniqueViewers.toLocaleString() || 0}</p>
                                <p className="text-sm text-white/60">Lecteurs uniques</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <Clock className="w-8 h-8 text-amber-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{analytics?.avgReadTime || 0}m</p>
                                <p className="text-sm text-white/60">Temps de lecture moyen</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <Send className="w-8 h-8 text-purple-400" />
                                    <span className="text-xs text-purple-400 font-medium">+25%</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{analytics?.shareCount || 0}</p>
                                <p className="text-sm text-white/60">Partages</p>
                            </div>
                        </div>

                        {/* Graphique des vues */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-semibold text-white mb-6">Évolution des vues</h3>
                            <div className="h-64 flex items-end justify-between gap-2">
                                {analytics?.viewsTrend.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 bg-gradient-to-t from-orange-500 to-amber-500 rounded-t-lg relative group"
                                        style={{ height: `${(item.views / Math.max(...analytics.viewsTrend.map(v => v.views))) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.views}
                                        </div>
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/60">
                                            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top catégories */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-semibold text-white mb-6">Top catégories</h3>
                            <div className="space-y-4">
                                {analytics?.topCategories.map((cat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-orange-500' :
                                                index === 1 ? 'bg-blue-500' :
                                                    index === 2 ? 'bg-emerald-500' :
                                                        'bg-gray-500'
                                                }`} />
                                            <span className="text-white">{categories.find(c => c.value === cat.category)?.label}</span>
                                        </div>
                                        <span className="text-white/60">{cat.count} articles</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'notifications' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-semibold text-white mb-6">Configuration des notifications</h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-white mb-4">Notifications automatiques</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-white">Articles urgents</p>
                                                <p className="text-sm text-white/60">Envoyer automatiquement une notification pour les articles marqués comme urgents</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-5 h-5" />
                                        </label>

                                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-white">Résumé hebdomadaire</p>
                                                <p className="text-sm text-white/60">Envoyer un résumé des actualités chaque semaine</p>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5" />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-white mb-4">Notification manuelle</h4>
                                    <form className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Titre de la notification"
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                                        />
                                        <textarea
                                            placeholder="Message de la notification"
                                            rows={3}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            Envoyer la notification
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de suppression */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full border border-white/20"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Confirmer la suppression</h3>
                            <p className="text-white/80 mb-6">
                                Êtes-vous sûr de vouloir supprimer l'actualité "{selectedNews?.title}" ?
                                Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all text-white"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de prévisualisation */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Prévisualisation</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <article className="prose prose-invert max-w-none">
                                <h1 className="text-3xl font-bold text-white mb-4">{formData.title}</h1>
                                {formData.summary && (
                                    <p className="text-xl text-white/80 mb-6">{formData.summary}</p>
                                )}
                                <div className="whitespace-pre-wrap text-white/90">{formData.content}</div>
                                {formData.tags.length > 0 && (
                                    <div className="flex gap-2 mt-6">
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </article>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminNewsView;