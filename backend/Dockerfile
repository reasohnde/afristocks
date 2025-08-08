# backend/Dockerfile
FROM node:18-alpine AS builder

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++ 

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer toutes les dépendances (dev + prod pour build)
RUN npm ci

# Copier le schéma Prisma
COPY prisma ./prisma/

# Générer le client Prisma
RUN npx prisma generate

# Copier tout le code source
COPY src ./src

# Compiler TypeScript
RUN npm run build

# Stage 2 : Production
FROM node:18-alpine AS production

# Installer uniquement les outils nécessaires
RUN apk add --no-cache openssl

WORKDIR /app

# Copier package.json pour les dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copier le schéma Prisma pour les migrations
COPY prisma ./prisma/

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Changer le propriétaire des fichiers
RUN chown -R nodejs:nodejs /app

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 5001

# Script de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]