# 📱 Guide de Test - Expo Go

## 🎯 **Objectif**
Tester l'application mobile AfriStocks sur Expo Go avec les actualités synchronisées.

## ✅ **Prérequis**

### **1. Installation Expo Go**
- **iOS** : [Expo Go sur App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android** : [Expo Go sur Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### **2. Backend démarré**
```bash
# Vérifier que le backend fonctionne
curl "http://localhost:5001/api/v1/news?limit=1"
```

### **3. Réseau local**
- **IP Backend** : `100.105.207.193:5001`
- **CORS** : Configuré pour mobile
- **WebSocket** : Activé

## 🚀 **Démarrage de l'application**

### **1. Démarrer Expo**
```bash
cd /Users/cyrilsohnde/afristocks/mobile
npm start
```

### **2. QR Code**
- **Scanner** : Le QR code apparaîtra dans le terminal
- **Expo Go** : Ouvrir l'app et scanner le QR code
- **Connexion** : L'app se chargera automatiquement

## 📱 **Test des fonctionnalités**

### **1. Navigation**
- **Accueil** : Page d'accueil avec aperçu des actualités
- **Menu** : Navigation vers "Actualités"
- **Détails** : Cliquer sur une actualité pour voir les détails

### **2. Section Actualités**
- **Chargement** : Les actualités doivent s'afficher
- **Filtres** : Tester les catégories (Toutes, Startup, Marché, etc.)
- **Pull to refresh** : Tirer vers le bas pour rafraîchir
- **Temps réel** : Nouvelles actualités apparaissent automatiquement

### **3. Données affichées**
- **Titre** : Titre de l'actualité
- **Résumé** : Extrait du contenu
- **Date** : "Il y a Xh/j"
- **Auteur** : Nom de l'auteur
- **Importance** : Badge URGENT si applicable
- **Catégorie** : Emoji selon le type

## 🔧 **Dépannage**

### **Problème de connexion**
```bash
# Vérifier l'IP du backend
ifconfig | grep "inet " | grep -v 127.0.0.1

# Tester la connexion
curl "http://100.105.207.193:5001/api/v1/news?limit=1"
```

### **Actualités ne s'affichent pas**
1. **Vérifier la console** : Logs d'erreur
2. **Tester l'API** : `curl "http://100.105.207.193:5001/api/v1/news"`
3. **Vérifier CORS** : Backend configuré pour mobile
4. **Redémarrer** : `npm start` puis recharger

### **Erreur de réseau**
- **Vérifier WiFi** : Même réseau que le backend
- **IP Backend** : `100.105.207.193:5001`
- **Port** : 5001 accessible

## 📊 **Tests à effectuer**

### **✅ Chargement initial**
- [ ] L'application se charge sans erreur
- [ ] La page d'accueil s'affiche
- [ ] Les actualités apparaissent

### **✅ Navigation**
- [ ] Menu fonctionne
- [ ] Section "Actualités" accessible
- [ ] Détails des actualités s'ouvrent

### **✅ Données**
- [ ] Titres des actualités corrects
- [ ] Dates formatées correctement
- [ ] Auteurs affichés
- [ ] Catégories avec emojis

### **✅ Fonctionnalités**
- [ ] Filtres par catégorie
- [ ] Pull to refresh
- [ ] Loading states
- [ ] Empty states

### **✅ Temps réel**
- [ ] WebSocket connecté
- [ ] Nouvelles actualités apparaissent
- [ ] Modifications en temps réel

## 🎯 **Résultats attendus**

### **Interface**
- **Design** : Interface moderne avec glassmorphism
- **Performance** : Chargement rapide
- **Responsive** : Adaptation à la taille d'écran

### **Données**
- **Actualités** : 5+ articles affichés
- **Filtres** : Fonctionnels
- **Temps réel** : Updates automatiques

### **Fonctionnalités**
- **Navigation** : Fluide
- **Rafraîchissement** : Manuel et automatique
- **États** : Loading, empty, error

## ✅ **Succès !**

Si tous les tests passent, l'application mobile est parfaitement synchronisée avec le backend et fonctionne sur Expo Go ! 🎉

**Prochaines étapes :**
1. **Tester sur appareil physique**
2. **Vérifier les performances**
3. **Tester les cas d'erreur**
4. **Optimiser l'expérience utilisateur** 