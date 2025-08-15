#!/bin/bash
set -e

echo "🚀 Déploiement AfriStocks sur AWS..."

# Variables
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="771237845610"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Connexion à ECR
echo "🔐 Connexion à ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Frontend
echo "📦 Build et push du frontend..."
cd frontend
docker build -t afristocks-frontend .
docker tag afristocks-frontend:latest ${ECR_REGISTRY}/afristocks-frontend:latest
docker push ${ECR_REGISTRY}/afristocks-frontend:latest
cd ..

# Backend
echo "📦 Build et push du backend..."
cd backend
npx prisma format
docker build -t afristocks-backend .
docker tag afristocks-backend:latest ${ECR_REGISTRY}/afristocks-backend:latest
docker push ${ECR_REGISTRY}/afristocks-backend:latest
cd ..

echo "✅ Images poussées vers ECR!"

# Optionnel : Mettre à jour les services ECS si déjà créés
read -p "Voulez-vous mettre à jour les services ECS? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🔄 Mise à jour des services ECS..."
    aws ecs update-service --cluster afristocks-cluster --service afristocks-frontend --force-new-deployment --region ${AWS_REGION}
    aws ecs update-service --cluster afristocks-cluster --service afristocks-backend --force-new-deployment --region ${AWS_REGION}
    echo "✅ Services ECS mis à jour!"
fi