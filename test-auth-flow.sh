#!/bin/bash

echo "🧪 Test complet du flux d'authentification"
echo "=========================================="

# Générer un email unique
EMAIL="test$(date +%s)@example.com"

# 1. Register
echo -e "\n1️⃣ INSCRIPTION"
echo "Email: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test123!\",
    \"name\": \"Test User\",
    \"role\": \"USER\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

# Extraire les tokens
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken // empty')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.refreshToken // empty')

# 2. Login
echo -e "\n2️⃣ CONNEXION"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test123!\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

# 3. Refresh Token (si disponible)
if [ ! -z "$REFRESH_TOKEN" ]; then
  echo -e "\n3️⃣ REFRESH TOKEN"
  curl -s -X POST http://localhost:3000/auth/refresh-token \
    -H "Content-Type: application/json" \
    -d "{
      \"refreshToken\": \"$REFRESH_TOKEN\"
    }" | jq '.'
fi

echo -e "\n✅ Test terminé!"
