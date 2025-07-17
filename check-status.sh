#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Vérification de l'état du projet AfriStocks${NC}\n"

# Fonction pour vérifier l'existence d'un fichier
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Fonction pour vérifier l'existence d'un dossier
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Fonction pour vérifier si une route fonctionne
check_route() {
    response=$(curl -s -o /dev/null -w "%{http_code}" "$1")
    if [ "$response" != "404" ]; then
        echo -e "${GREEN}✅ Route $2 existe (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ Route $2 n'existe pas${NC}"
        return 1
    fi
}

echo -e "${YELLOW}📁 Structure des dossiers :${NC}"
check_dir "src/validators" "Dossier validators"
check_dir "src/middleware" "Dossier middleware"
check_dir "src/services" "Dossier services"
check_dir "src/routes" "Dossier routes"
check_dir "src/config" "Dossier config"

echo -e "\n${YELLOW}📄 Fichiers de validation :${NC}"
check_file "src/validators/auth.validator.ts" "auth.validator.ts"
check_file "src/validators/wallet.validator.ts" "wallet.validator.ts"

echo -e "\n${YELLOW}🛡️ Fichiers middleware :${NC}"
check_file "src/middleware/auth.middleware.ts" "auth.middleware.ts"
check_file "src/middleware/validation.middleware.ts" "validation.middleware.ts"
check_file "src/middleware/rateLimit.middleware.ts" "rateLimit.middleware.ts"
check_file "src/middleware/rbac.middleware.ts" "rbac.middleware.ts"

echo -e "\n${YELLOW}⚙️ Fichiers services :${NC}"
check_file "src/services/auth.service.ts" "auth.service.ts"
check_file "src/services/wallet.service.ts" "wallet.service.ts"
check_file "src/services/investment.service.ts" "investment.service.ts"

echo -e "\n${YELLOW}🛣️ Fichiers routes :${NC}"
check_file "src/routes/auth.routes.ts" "auth.routes.ts"
check_file "src/routes/wallet.routes.ts" "wallet.routes.ts"
check_file "src/routes/investment.routes.ts" "investment.routes.ts"
check_file "src/routes/index.ts" "index.ts"

echo -e "\n${YELLOW}🌱 Fichiers Prisma :${NC}"
check_file "prisma/schema.prisma" "schema.prisma"
check_file "prisma/seed.ts" "seed.ts"

echo -e "\n${YELLOW}🧪 Scripts de test :${NC}"
check_file "quick-test.sh" "quick-test.sh"
check_file "test-final.sh" "test-final.sh"

# Vérifier si le serveur tourne
echo -e "\n${YELLOW}🚀 État du serveur :${NC}"
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Serveur en cours d'exécution sur le port 3000${NC}"
    
    echo -e "\n${YELLOW}🌐 Test des routes API :${NC}"
    check_route "http://localhost:3000/health" "/health"
    check_route "http://localhost:3000/docs" "/docs"
    check_route "http://localhost:3000/auth/test" "/auth/test"
    check_route "http://localhost:3000/investments/startups" "/investments/startups"
else
    echo -e "${RED}❌ Serveur non démarré${NC}"
fi

# Vérifier les dépendances npm
echo -e "\n${YELLOW}📦 Dépendances importantes :${NC}"
if grep -q "express-validator" package.json; then
    echo -e "${GREEN}✅ express-validator installé${NC}"
else
    echo -e "${RED}❌ express-validator non installé${NC}"
fi

if grep -q "express-rate-limit" package.json; then
    echo -e "${GREEN}✅ express-rate-limit installé${NC}"
else
    echo -e "${RED}❌ express-rate-limit non installé${NC}"
fi

if grep -q "swagger-jsdoc" package.json; then
    echo -e "${GREEN}✅ swagger-jsdoc installé${NC}"
else
    echo -e "${RED}❌ swagger-jsdoc non installé${NC}"
fi

# Vérifier le contenu de certains fichiers clés
echo -e "\n${YELLOW}🔍 Vérification du contenu des fichiers :${NC}"

# Vérifier si wallet.service.ts contient les méthodes withdraw et getTransactionHistory
if [ -f "src/services/wallet.service.ts" ]; then
    if grep -q "withdraw" src/services/wallet.service.ts && grep -q "getTransactionHistory" src/services/wallet.service.ts; then
        echo -e "${GREEN}✅ wallet.service.ts contient withdraw et getTransactionHistory${NC}"
    else
        echo -e "${RED}❌ wallet.service.ts ne contient pas toutes les méthodes${NC}"
    fi
fi

# Vérifier si routes/index.ts inclut les routes d'investissement
if [ -f "src/routes/index.ts" ]; then
    if grep -q "investmentRoutes" src/routes/index.ts; then
        echo -e "${GREEN}✅ routes/index.ts inclut les routes d'investissement${NC}"
    else
        echo -e "${RED}❌ routes/index.ts n'inclut pas les routes d'investissement${NC}"
    fi
fi

# Résumé
echo -e "\n${BLUE}📊 Résumé :${NC}"
echo "Exécutez ce script pour voir ce qui manque."
echo "Si vous voyez des ❌, vous devez créer ou corriger ces fichiers."

