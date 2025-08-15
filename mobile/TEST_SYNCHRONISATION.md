# 🧪 Guide de Test - Synchronisation des Actualités

## 📱 Test de l'Application Mobile

### 1. **Démarrer l'application**
```bash
cd /Users/cyrilsohnde/afristocks/mobile
npm start
```

### 2. **Scanner le QR code avec Expo Go**

### 3. **Naviguer vers l'écran des actualités**

### 4. **Utiliser les boutons de debug**
- **🐛 (bug)** : Test complet de l'API et WebSocket
- **📶 (wifi)** : Test de connexion basique

## 🔍 Vérification des Logs

### Dans le terminal Expo, cherchez ces logs :

#### ✅ Logs de succès :
```
🔌 Connexion Socket.io...
✅ Socket.io connecté
📰 Nouvelle actualité reçue via WebSocket: {...}
📝 Actualité mise à jour via WebSocket: {...}
```

#### ❌ Logs d'erreur :
```
❌ Erreur connexion Socket.io: ...
❌ Socket.io error: ...
🔌 Socket.io déconnecté: ...
```

## 🧪 Test de Création d'Actualité

### Via l'interface admin (frontend) :
1. Aller sur `http://localhost:3000`
2. Se connecter en tant qu'admin
3. Créer une nouvelle actualité
4. Vérifier qu'elle apparaît sur mobile

### Via API directe :
```bash
# Login admin
curl -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afristocks.com","password":"Admin123!"}'

# Créer actualité
curl -X POST "http://localhost:5001/api/v1/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ICI" \
  -d '{
    "title": "Test Synchronisation Mobile",
    "content": "Cette actualité teste la synchronisation avec l'app mobile",
    "category": "MARKET_UPDATE",
    "importance": "NORMAL",
    "isActive": true
  }'
```

## 🔧 Diagnostic des Problèmes

### Problème 1: Pas de connexion Socket.io
**Symptômes :** Pas de logs "Socket.io connecté"
**Solutions :**
- Vérifier que le backend tourne sur le port 5001
- Vérifier l'IP dans `constants.ts`
- Redémarrer l'app mobile

### Problème 2: Pas de notifications
**Symptômes :** Connexion OK mais pas de nouvelles actualités
**Solutions :**
- Vérifier les logs backend pour les notifications WebSocket
- Vérifier que les routes utilisent bien `broadcastNews`

### Problème 3: Erreurs réseau
**Symptômes :** Erreurs de connexion dans les logs
**Solutions :**
- Vérifier que le téléphone et l'ordinateur sont sur le même réseau
- Tester avec l'IP locale si nécessaire

## 📊 Vérification des Données

### Compter les actualités :
```bash
curl "http://localhost:5001/api/v1/news" | jq '.data | length'
```

### Vérifier une actualité spécifique :
```bash
curl "http://localhost:5001/api/v1/news" | jq '.data[0] | {id, title, publishedAt}'
```

## 🚀 Test Rapide

1. **Ouvrir l'app mobile**
2. **Aller dans les actualités**
3. **Appuyer sur 🐛 (bug)**
4. **Vérifier l'alerte affichée**
5. **Créer une actualité via l'API**
6. **Vérifier qu'elle apparaît automatiquement**

## 📝 Notes Importantes

- L'app mobile utilise Socket.io pour les mises à jour en temps réel
- Les actualités sont chargées via API REST au démarrage
- Les nouvelles actualités arrivent via WebSocket
- Le pull-to-refresh recharge les données depuis l'API 