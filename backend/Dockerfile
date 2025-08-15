# backend/Dockerfile (mode simplifié pour démarrer server.js)
FROM node:18-alpine

WORKDIR /app

# Installer dépendances prod uniquement
COPY package*.json ./
RUN npm ci --only=production

# Copier les fichiers nécessaires au serveur JS
COPY server.js ./
COPY routes ./routes
COPY middleware ./middleware
COPY model ./model
COPY config ./config

# Port d'écoute
ENV PORT=5001
EXPOSE 5001

# Démarrer le serveur Express simple (pas de build TypeScript)
CMD ["node", "server.js"]