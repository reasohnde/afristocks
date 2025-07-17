#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
EMAIL="test$(date +%s)@example.com"

echo -e "${BLUE}🧪 Test rapide AfriStocks${NC}\n"

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl -s "$BASE_URL/health" | jq '.'

# 2. Inscription
echo -e "\n${BLUE}2. Inscription (email: $EMAIL)${NC}"
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test123!\",
    \"name\": \"Test User\",
    \"role\": \"USER\"
  }")

echo "$REGISTER" | jq '.'

# Extraire le token
TOKEN=$(echo "$REGISTER" | jq -r '.data.accessToken // empty')

if [ -z "$TOKEN" ]; then
  echo -e "\n❌ Erreur: Pas de token reçu"
  exit 1
fi

echo -e "\n${GREEN}✅ Token reçu${NC}"

# 3. Connexion
echo -e "\n${BLUE}3. Test de connexion${NC}"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test123!\"
  }")

echo "$LOGIN" | jq '.'

# 4. Balance du wallet
echo -e "\n${BLUE}4. Balance du wallet${NC}"
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 5. Dépôt
echo -e "\n${BLUE}5. Dépôt de 50,000 XOF${NC}"
curl -s -X POST "$BASE_URL/wallet/deposit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "paymentMethod": "MOBILE_MONEY"
  }' | jq '.'

# 6. Balance après dépôt
echo -e "\n${BLUE}6. Balance après dépôt${NC}"
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 7. Transactions
echo -e "\n${BLUE}7. Historique des transactions${NC}"
curl -s "$BASE_URL/wallet/transactions" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n${GREEN}✅ Tests terminés!${NC}"
