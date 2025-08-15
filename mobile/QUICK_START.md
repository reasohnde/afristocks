# 🚀 Démarrage Rapide - Expo Go

## 📱 **Étapes pour tester l'application**

### **1. Préparer l'environnement**
```bash
# Vérifier que le backend fonctionne
curl "http://localhost:5001/api/v1/news?limit=1"

# Aller dans le dossier mobile
cd /Users/cyrilsohnde/afristocks/mobile
```

### **2. Démarrer l'application**
```bash
# Démarrer Expo
npm start
```

### **3. Scanner le QR Code**
- **Ouvrir Expo Go** sur votre téléphone
- **Scanner le QR code** qui apparaît dans le terminal
- **Attendre** que l'application se charge

## 🧪 **Tests à effectuer**

### **✅ Test de connexion**
1. **Ouvrir** la section "Actualités"
2. **Appuyer** sur l'icône WiFi (🌐) en haut à droite
3. **Vérifier** l'alerte de connexion

### **✅ Test des actualités**
1. **Vérifier** que les actualités s'affichent
2. **Tester** les filtres (Toutes, Startup, Marché, etc.)
3. **Tirer vers le bas** pour rafraîchir
4. **Cliquer** sur une actualité pour voir les détails

### **✅ Test des données**
- [ ] **Titres** : Affichés correctement
- [ ] **Dates** : Format "Il y a Xh/j"
- [ ] **Auteurs** : Noms affichés
- [ ] **Catégories** : Emojis selon le type
- [ ] **Importance** : Badge URGENT si applicable

## 🔧 **Dépannage**

### **Problème de connexion**
```bash
# Vérifier l'IP du backend
ifconfig | grep "inet " | grep -v 127.0.0.1

# Tester depuis le mobile
curl "http://100.105.207.193:5001/api/v1/news?limit=1"
```

### **Actualités ne s'affichent pas**
1. **Appuyer** sur l'icône WiFi pour tester la connexion
2. **Vérifier** les logs dans la console
3. **Redémarrer** l'application si nécessaire

### **Erreur de réseau**
- **Vérifier** que le téléphone et l'ordinateur sont sur le même WiFi
- **Vérifier** que l'IP `100.105.207.193` est accessible
- **Redémarrer** Expo si nécessaire

## 📊 **Résultats attendus**

### **Interface**
- **Design** : Interface moderne avec glassmorphism
- **Performance** : Chargement rapide des actualités
- **Responsive** : Adaptation à la taille d'écran

### **Données**
- **Actualités** : 5+ articles affichés
- **Filtres** : Fonctionnels
- **Temps réel** : Updates automatiques

### **Fonctionnalités**
- **Navigation** : Fluide entre les sections
- **Rafraîchissement** : Pull to refresh fonctionne
- **États** : Loading, empty, error gérés

## ✅ **Succès !**

Si tous les tests passent, l'application mobile est parfaitement synchronisée avec le backend et fonctionne sur Expo Go ! 🎉

**Prochaines étapes :**
1. **Tester sur différents appareils**
2. **Vérifier les performances**
3. **Tester les cas d'erreur**
4. **Optimiser l'expérience utilisateur** 