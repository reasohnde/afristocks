# 🚀 Déploiement Frontend sur Vercel

## 📋 Prérequis

1. **Compte Vercel** : Créez un compte sur [vercel.com](https://vercel.com)
2. **GitHub Repository** : Votre code doit être sur GitHub
3. **Backend déployé** : Votre API backend doit être accessible

## 🔧 Configuration

### 1. Variables d'environnement

Dans Vercel Dashboard, ajoutez ces variables :

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 2. Configuration Next.js

Le fichier `next.config.js` est déjà configuré avec :
- ✅ Images externes (Cloudinary)
- ✅ Headers de sécurité
- ✅ Variables d'environnement
- ✅ Redirects API

### 3. Configuration Vercel

Le fichier `vercel.json` est configuré avec :
- ✅ Build configuration
- ✅ Headers de sécurité
- ✅ Rewrites API

## 🚀 Déploiement

### Option 1 : Via Vercel Dashboard

1. **Connectez votre repo GitHub** à Vercel
2. **Importez le projet** frontend
3. **Configurez les variables d'environnement**
4. **Déployez** !

### Option 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
cd /Users/cyrilsohnde/afristocks/frontend
vercel

# Pour la production
vercel --prod
```

## 🔍 Vérification

Après le déploiement, vérifiez :

1. **Page d'accueil** : `https://your-app.vercel.app`
2. **API calls** : Vérifiez que les appels API fonctionnent
3. **Images** : Vérifiez que les images Cloudinary s'affichent
4. **Authentification** : Testez login/logout

## 🛠️ Troubleshooting

### Problème : API calls échouent
**Solution** : Vérifiez `NEXT_PUBLIC_API_URL` dans Vercel

### Problème : Images ne s'affichent pas
**Solution** : Vérifiez les domaines dans `next.config.js`

### Problème : Build échoue
**Solution** : Vérifiez les logs dans Vercel Dashboard

## 📝 Notes importantes

- **CORS** : Assurez-vous que votre backend autorise les requêtes depuis votre domaine Vercel
- **HTTPS** : Vercel force HTTPS, assurez-vous que votre backend supporte HTTPS
- **Variables d'environnement** : Toutes les variables `NEXT_PUBLIC_*` sont publiques

## 🔄 Mise à jour automatique

Vercel se met à jour automatiquement quand vous poussez sur GitHub !

```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel déploie automatiquement !
``` 