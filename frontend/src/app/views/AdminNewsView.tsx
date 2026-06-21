// frontend/src/app/views/AdminNewsView.tsx
import React, { useState, useEffect } from 'react';
import {
    Plus, Edit3, Trash2, Eye, Search, Calendar,
    TrendingUp, X, Upload, AlertCircle, CheckCircle,
    FileText, Globe, Activity, Zap, BarChart3
} from 'lucide-react';
import { api } from '../../services/api';

interface NewsAuthor {
    id: string;
    name: string;
}

interface News {
    id: string;
    title: string;
    summary?: string;
    content: string;
    category: string;
    importance: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    imageUrl?: string;
    tags?: string[];
    publishedAt?: string;
    scheduledAt?: string;
    isActive: boolean;
    viewCount?: number;
    author?: NewsAuthor;
    createdAt: string;
    updatedAt?: string;
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

interface CategoryDef {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const AdminNewsView: React.FC<AdminNewsViewProps> = ({ setActiveView }) => {
    const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNews, setSelectedNews] = useState<News | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterImportance, setFilterImportance] = useState('all');
    const [formError, setFormError] = useState<string | null>(null);

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
    const categories: CategoryDef[] = [
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
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/v1/news?limit=100');
            const payload = res.data?.data ?? res.data ?? [];
            setNews(Array.isArray(payload) ? (payload as News[]) : []);
        } catch (err) {
            console.error('Erreur chargement news:', err);
            setError("Impossible de charger les actualités.");
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    // Gestion du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
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

            if (selectedNews) {
                await api.put(`/v1/news/${selectedNews.id}`, newsData);
            } else {
                await api.post('/v1/news', newsData);
            }

            await fetchNews();
            resetForm();
            setActiveTab('list');
        } catch (err: unknown) {
            console.error('Erreur sauvegarde actualité:', err);
            let message = "Erreur lors de l'enregistrement de l'actualité.";
            if (err && typeof err === 'object' && 'response' in err) {
                const resp = (err as { response?: { data?: { message?: string; error?: string } } }).response;
                message = resp?.data?.message || resp?.data?.error || message;
            }
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedNews) return;

        try {
            await api.delete(`/v1/news/${selectedNews.id}`);
            await fetchNews();
            setShowDeleteModal(false);
            setSelectedNews(null);
        } catch (err) {
            console.error('Erreur suppression:', err);
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
        setFormError(null);
    };

    // Filtrage des news
    const filteredNews = news.filter((item: News) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesImportance = filterImportance === 'all' || item.importance === filterImportance;
        return matchesSearch && matchesCategory && matchesImportance;
    });

    const importanceBadge = (importance: News['importance']) => {
        switch (importance) {
            case 'URGENT':
                return 'text-red-700 bg-red-50 border border-red-200';
            case 'HIGH':
                return 'text-amber-700 bg-amber-50 border border-amber-200';
            case 'NORMAL':
                return 'text-blue-700 bg-blue-50 border border-blue-200';
            default:
                return 'text-slate-600 bg-slate-50 border border-slate-200';
        }
    };

    const importanceLabel = (importance: News['importance']) => {
        switch (importance) {
            case 'URGENT': return 'Urgente';
            case 'HIGH': return 'Haute';
            case 'NORMAL': return 'Normale';
            default: return 'Basse';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Actualités</h1>
                    <p className="text-slate-500 mt-1 text-sm">Créez et gérez les actualités de la plateforme</p>
                </div>
                <button
                    onClick={() => setActiveView('admin-dashboard')}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors"
                >
                    Retour au dashboard
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {[
                    { id: 'list', label: 'Liste des actualités', icon: FileText },
                    { id: 'create', label: selectedNews ? 'Modifier' : 'Créer', icon: Plus }
                ].map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'list' | 'create')}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-blue-700 border-b-2 border-blue-700'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <TabIcon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Contenu des tabs */}
            {activeTab === 'list' && (
                <div className="space-y-6">
                    {/* Filtres */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[300px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une actualité..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                            />
                        </div>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        >
                            <option value="all">Toutes les catégories</option>
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>

                        <select
                            value={filterImportance}
                            onChange={(e) => setFilterImportance(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        >
                            <option value="all">Toute importance</option>
                            <option value="URGENT">Urgente</option>
                            <option value="HIGH">Haute</option>
                            <option value="NORMAL">Normale</option>
                            <option value="LOW">Basse</option>
                        </select>

                        <button
                            onClick={() => {
                                resetForm();
                                setActiveTab('create');
                            }}
                            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Nouvelle actualité
                        </button>
                    </div>

                    {/* Liste */}
                    {loading ? (
                        <div className="grid gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <p className="text-slate-600 text-sm">{error}</p>
                            <button
                                onClick={fetchNews}
                                className="mt-4 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : filteredNews.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">Aucune actualité trouvée</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Titre</th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Catégorie</th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Importance</th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Statut</th>
                                        <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Vues</th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Date</th>
                                        <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-slate-500 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNews.map((item: News) => (
                                        <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 text-sm">{item.title}</div>
                                                {item.summary && (
                                                    <div className="text-slate-400 text-xs line-clamp-1 mt-0.5">{item.summary}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {categories.find((c) => c.value === item.category)?.label || item.category}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${importanceBadge(item.importance)}`}>
                                                    {importanceLabel(item.importance)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive
                                                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                                    : 'text-slate-600 bg-slate-50 border border-slate-200'
                                                    }`}>
                                                    {item.isActive ? 'Publié' : 'Brouillon'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
                                                {typeof item.viewCount === 'number' ? item.viewCount : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500 tabular-nums">
                                                {new Date(item.publishedAt || item.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
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
                                                                publishedAt: item.publishedAt
                                                                    ? new Date(item.publishedAt).toISOString().slice(0, 16)
                                                                    : new Date().toISOString().slice(0, 16),
                                                                isActive: item.isActive,
                                                                sendNotification: false
                                                            });
                                                            setFormError(null);
                                                            setActiveTab('create');
                                                        }}
                                                        className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-slate-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedNews(item);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'create' && (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                    {formError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    {/* Informations principales */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-semibold text-slate-900">Informations principales</h3>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Titre <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                                placeholder="Titre de l'actualité"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Résumé</label>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                                placeholder="Résumé court de l'actualité"
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Contenu <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                                placeholder="Contenu détaillé de l'actualité"
                                rows={8}
                                required
                            />
                        </div>
                    </div>

                    {/* Catégorie et importance */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-semibold text-slate-900">Classification</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Catégorie</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Importance</label>
                                <select
                                    value={formData.importance}
                                    onChange={(e) => setFormData({ ...formData, importance: e.target.value as NewsFormData['importance'] })}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Tags</label>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {formData.tags.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 flex items-center gap-1.5"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newTags = [...formData.tags];
                                                newTags.splice(index, 1);
                                                setFormData({ ...formData, tags: newTags });
                                            }}
                                            className="hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (tagInput.trim()) {
                                            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
                                            setTagInput('');
                                        }
                                    }
                                }}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                                placeholder="Ajouter un tag et appuyer sur Entrée"
                            />
                        </div>
                    </div>

                    {/* Image et publication */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-semibold text-slate-900">Média et publication</h3>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Image (URL)</label>
                            <input
                                type="text"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                                placeholder="https://..."
                            />
                            <div className="flex items-center gap-3 mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm transition-colors cursor-pointer flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Choisir un fichier
                                </label>
                                {(imageFile || formData.imageUrl) && (
                                    <span className="text-xs text-slate-500">
                                        {imageFile ? imageFile.name : 'Image renseignée'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Date de publication</label>
                                <input
                                    type="datetime-local"
                                    value={formData.publishedAt}
                                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                                />
                            </div>

                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                                    />
                                    <span className="text-sm text-slate-700">Publier immédiatement</span>
                                </label>
                            </div>
                        </div>

                        {formData.importance === 'URGENT' && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.sendNotification}
                                    onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                                />
                                <span className="text-sm text-slate-700">Envoyer une notification push</span>
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
                            className="px-5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="px-5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            Prévisualiser
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
            )}

            {/* Modal de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Confirmer la suppression</h3>
                        <p className="text-slate-600 text-sm mb-6">
                            Êtes-vous sûr de vouloir supprimer l&apos;actualité &laquo;&nbsp;{selectedNews?.title}&nbsp;&raquo; ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de prévisualisation */}
            {showPreview && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Prévisualisation</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <article className="max-w-none">
                            <h1 className="text-2xl font-bold text-slate-900 mb-3">{formData.title}</h1>
                            {formData.summary && (
                                <p className="text-base text-slate-600 mb-5">{formData.summary}</p>
                            )}
                            {formData.imageUrl && (
                                <img
                                    src={formData.imageUrl}
                                    alt={formData.title}
                                    className="w-full max-h-80 object-cover rounded-lg mb-5 border border-slate-200"
                                />
                            )}
                            <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">{formData.content}</div>
                            {formData.tags.length > 0 && (
                                <div className="flex gap-2 mt-6 flex-wrap">
                                    {formData.tags.map((tag: string, index: number) => (
                                        <span key={index} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </article>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNewsView;
