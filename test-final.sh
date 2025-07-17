#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
EMAIL="final-test$(date +%s)@example.com"

echo -e "${BLUE}🧪 Test Final Complet - AfriStocks Backend${NC}\n"

# 1. Documentation
echo -e "${YELLOW}📚 1. Documentation API${NC}"
curl -s "$BASE_URL/docs" | jq '.'

# 2. Inscription
echo -e "\n${YELLOW}👤 2. Création de compte${NC}"
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test123!\",
    \"name\": \"Investisseur Test\",
    \"phoneNumber\": \"+225 01 02 03 04 05\",
    \"role\": \"USER\"
  }")

echo "$REGISTER" | jq '.'
TOKEN=$(echo "$REGISTER" | jq -r '.data.accessToken')

# 3. Dépôt initial
echo -e "\n${YELLOW}💰 3. Dépôt initial de 1,000,000 XOF${NC}"
curl -s -X POST "$BASE_URL/wallet/deposit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000000,
    "paymentMethod": "MOBILE_MONEY"
  }' | jq '.'

# 4. Balance
echo -e "\n${YELLOW}💳 4. Vérification du solde${NC}"
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 5. Liste des startups
echo -e "\n${YELLOW}🚀 5. Liste des startups disponibles${NC}"
STARTUPS=$(curl -s "$BASE_URL/investments/startups")
echo "$STARTUPS" | jq '.'

# Extraire l'ID de la première startup
STARTUP_ID=$(echo "$STARTUPS" | jq -r '.data.startups[0].id // empty')

if [ ! -z "$STARTUP_ID" ]; then
  # 6. Détails de la startup
  echo -e "\n${YELLOW}📊 6. Détails de la startup${NC}"
  curl -s "$BASE_URL/investments/startups/$STARTUP_ID" | jq '.'

  # 7. Investir
  echo -e "\n${YELLOW}💸 7. Investissement de 100,000 XOF${NC}"
  curl -s -X POST "$BASE_URL/investments/invest/$STARTUP_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "amount": 100000
    }' | jq '.'
fi

# 8. Mes investissements
echo -e "\n${YELLOW}📈 8. Mes investissements${NC}"
curl -s "$BASE_URL/investments/my-investments" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 9. Historique des transactions
echo -e "\n${YELLOW}📋 9. Historique des transactions${NC}"
curl -s "$BASE_URL/wallet/transactions" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 10. Balance finale
echo -e "\n${YELLOW}💰 10. Balance finale${NC}"
curl -s "$BASE_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n${GREEN}✅ Test final terminé avec succès!${NC}"
echo -e "\n${BLUE}📊 Vérifiez les données dans Prisma Studio: npx prisma studio${NC}"
