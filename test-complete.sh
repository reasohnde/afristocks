#!/bin/bash

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Test complet du backend AfriStocks${NC}"
echo "======================================="

# Variables
BASE_URL="http://localhost:3000"
EMAIL="test$(date +%s)@example.com"
PASSWORD="Test123!"

# 1. Test de santé
echo -e "\n${BLUE}1. Health Check${NC}"
curl -s "$BASE_URL/health" | jq '.'

# 2. Documentation
echo -e "\n${BLUE}2. Documentation API${NC}"
curl -s "$BASE_URL/docs" | jq '.'

# 3. Inscription
echo -e "\n${BLUE}3. Inscription${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"Test User\",
    \"role\": \"USER\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

# Extraire les tokens
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken // empty')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.refreshToken // empty')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Erreur: Pas de token d'accès${NC}"
  exit 1
fi

# 4. Connexion
echo -e "\n${BLUE}4. Connexion${NC}"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq '.'

# 5. Balance du wallet
echo -e "\n${BLUE}5. Balance du wallet${NC}"
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

# 6. Dépôt
echo -e "\n${BLUE}6. Dépôt de fonds${NC}"
curl -s -X POST "$BASE_URL/wallet/deposit" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "paymentMethod": "MOBILE_MONEY"
  }' | jq '.'

# 7. Balance après dépôt
echo -e "\n${BLUE}7. Balance après dépôt${NC}"
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

# 8. Historique des transactions
echo -e "\n${BLUE}8. Historique des transactions${NC}"
curl -s "$BASE_URL/wallet/transactions" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

# 9. Test de rate limiting
echo -e "\n${BLUE}9. Test de rate limiting (6 tentatives)${NC}"
for i in {1..6}; do
  echo -n "Tentative $i: "
  curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "wrong@example.com",
      "password": "wrong"
    }' | jq -r '.message'
done

echo -e "\n${GREEN}✅ Tests terminés!${NC}"
