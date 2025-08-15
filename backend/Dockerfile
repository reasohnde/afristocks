# backend/Dockerfile (mode simplifié pour démarrer server.js)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

# Port d'écoute
ENV PORT=5001
EXPOSE 5001

# Démarrer le serveur TypeScript compilé
CMD ["node", "dist/index.js"]