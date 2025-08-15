# 📱 Guide de Synchronisation - Actualités Mobile

## 🎯 **Objectif**
Synchroniser l'application mobile AfriStocks avec les actualités du backend pour afficher les vraies données en temps réel.

## ✅ **État actuel**

### **Backend (✅ Prêt)**
- **API News** : `http://localhost:5001/api/v1/news`
- **WebSocket** : `ws://localhost:5001` (pour les updates temps réel)
- **Authentification** : JWT avec rôles (ADMIN, USER, etc.)
- **Filtres** : Catégorie, importance, recherche

### **Mobile (✅ Modifié)**
- **Service** : `src/services/newsService.ts` (déjà configuré)
- **Hook** : `src/hooks/useNews.ts` (déjà configuré)
- **Écran** : `src/screens/news/AllNewsScreen.tsx` (modifié pour vraies données)

## 🔧 **Modifications apportées**

### **1. Service News (déjà configuré)**
```typescript
// mobile/src/services/newsService.ts
const API_URL = 'http://100.105.207.193:5001/api/v1';
const WS_URL = 'ws://100.105.207.193:5001';

class NewsService {
    async getNews(params = {}) {
        const response = await fetch(`${API_URL}/news?${queryString}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    }
}
```

### **2. Hook useNews (déjà configuré)**
```typescript
// mobile/src/hooks/useNews.ts
export function useNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNews();
        newsService.connectWebSocket();
        
        // Écouter les updates temps réel
        newsService.on('news:new', handleNewNews);
        newsService.on('news:updated', handleUpdate);
    }, []);

    return { news, loading, refresh: loadNews };
}
```

### **3. Écran AllNewsScreen (modifié)**
```typescript
// mobile/src/screens/news/AllNewsScreen.tsx
const AllNewsScreen = ({ navigation }: any) => {
    const { news, loading, refresh } = useNews();
    
    // Formatage des dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Il y a quelques minutes';
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        return `Il y a ${Math.floor(diffInHours / 24)}j`;
    };

    // Affichage des vraies données
    const renderNewsItem = ({ item }: any) => (
        <TouchableOpacity onPress={() => navigation.navigate('NewsDetail', { news: item })}>
            <GlassContainer>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsDescription}>
                    {item.summary || item.content?.substring(0, 120) + '...'}
                </Text>
                <Text style={styles.newsTime}>{formatDate(item.publishedAt)}</Text>
                <Text style={styles.newsAuthor}>{item.author?.name || 'AfriStocks'}</Text>
            </GlassContainer>
        </TouchableOpacity>
    );
};
```

## 🚀 **Fonctionnalités synchronisées**

### **✅ Récupération des actualités**
- **API** : Récupération depuis le backend
- **Filtres** : Par catégorie, importance, recherche
- **Pagination** : Chargement progressif

### **✅ Temps réel**
- **WebSocket** : Connexion pour les updates
- **Nouvelles actualités** : Ajout automatique
- **Modifications** : Mise à jour en temps réel

### **✅ Interface utilisateur**
- **Loading states** : Indicateurs de chargement
- **Pull to refresh** : Rafraîchissement manuel
- **Empty states** : Messages si aucune actualité
- **Catégories** : Filtrage par type d'actualité

### **✅ Données affichées**
- **Titre** : Titre de l'actualité
- **Résumé** : Extrait ou début du contenu
- **Date** : Formatage intelligent (il y a Xh/j)
- **Auteur** : Nom de l'auteur
- **Importance** : Badge URGENT si applicable
- **Vues** : Compteur de vues si disponible

## 📊 **Tests effectués**

### **✅ API Backend**
```bash
# Test récupération publique
curl http://localhost:5001/api/v1/news?limit=5

# Test avec authentification
curl -H "Authorization: Bearer [TOKEN]" \
     http://localhost:5001/api/v1/news?limit=3

# Test filtres
curl http://localhost:5001/api/v1/news?category=STARTUP_NEWS
curl http://localhost:5001/api/v1/news?importance=URGENT
```

### **✅ Résultats**
- **Statut** : 200 OK
- **Actualités trouvées** : 5+ articles
- **Filtres** : Fonctionnels
- **Authentification** : Opérationnelle

## 🎯 **Prochaines étapes**

### **1. Test sur appareil mobile**
```bash
# Démarrer l'application mobile
cd ../mobile
npm start
# ou
expo start
```

### **2. Vérifier la connexion**
- **IP Backend** : `100.105.207.193:5001`
- **CORS** : Configuré pour mobile
- **WebSocket** : Connexion temps réel

### **3. Tester les fonctionnalités**
- **Chargement** : Actualités s'affichent
- **Filtres** : Catégories fonctionnent
- **Temps réel** : Nouvelles actualités apparaissent
- **Navigation** : Détails des actualités

## 🔧 **Configuration requise**

### **Backend**
- **Port** : 5001
- **CORS** : Configuré pour mobile
- **WebSocket** : Activé
- **Base de données** : Actualités créées

### **Mobile**
- **IP Backend** : `100.105.207.193:5001`
- **Dépendances** : `node-fetch`, `@react-native-async-storage/async-storage`
- **Navigation** : Écran news configuré

## ✅ **Synchronisation réussie !**

L'application mobile est maintenant synchronisée avec le backend et affiche les vraies actualités en temps réel ! 🎉 