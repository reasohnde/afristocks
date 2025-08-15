#!/bin/bash

# Extraire les sections principales
echo "Extraction des écrans depuis App.tsx.complete..."

# 1. Extraire les styles (lignes ~652 jusqu'à la fin)
sed -n '652,$p' mobile-old/App.tsx.complete > mobile/src/styles/styles.ts

# 2. Extraire les données mockées
sed -n '60,134p' mobile-old/App.tsx.complete > mobile/src/data/mockData.ts

echo "Extraction terminée !"
echo "Fichiers créés :"
echo "- styles/styles.ts"
echo "- data/mockData.ts"
