#!/bin/bash

echo "Extraction des écrans principaux..."

# Créer les dossiers nécessaires
mkdir -p mobile/src/screens/{explore,portfolio,wallet,profile}
mkdir -p mobile/src/components

# Extraire la section Explore (lignes ~315-373)
sed -n '315,373p' mobile-old/App.tsx.complete > mobile/src/screens/explore/ExploreScreen.raw.tsx

# Extraire la section Portfolio (lignes ~374-432)
sed -n '374,432p' mobile-old/App.tsx.complete > mobile/src/screens/portfolio/PortfolioScreen.raw.tsx

# Extraire la section Wallet (lignes ~433-461)
sed -n '433,461p' mobile-old/App.tsx.complete > mobile/src/screens/wallet/WalletScreen.raw.tsx

# Extraire la section Profile (lignes ~462-512)
sed -n '462,512p' mobile-old/App.tsx.complete > mobile/src/screens/profile/ProfileScreen.raw.tsx

echo "Fichiers bruts extraits. Maintenant, créons les composants propres..."
