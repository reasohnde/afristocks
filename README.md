# AfriStocks — Plateforme d'investissement dans les startups africaines

Plateforme permettant au grand public ouest-africain d'investir dans des startups, avec
portefeuille en **XOF**, dépôt/retrait par mobile money (prévu), authentification JWT + 2FA.

- **Backend** : Node.js 20 · Express · TypeScript · Prisma · PostgreSQL · Redis · Socket.io
- **Frontend web** : Next.js 15 · React 19 · Tailwind
- **Mobile** : React Native 0.80
- **Infra** : Docker · Kubernetes · CI GitHub Actions

> 📋 Plan complet d'industrialisation : voir [`FEUILLE_DE_ROUTE.md`](./FEUILLE_DE_ROUTE.md).

---

## Structure du dépôt

```
.                  # Backend (API Express/Prisma) — racine
├── src/           #   routes · controllers · services · middleware · validators
├── prisma/        #   schema.prisma · migrations · seed
├── frontend/      # Application web Next.js
├── mobile/        # Application mobile React Native
├── k8s/ charts/   # Déploiement Kubernetes / Helm
├── Dockerfile     # Image backend (dev)
├── Dockerfile.prod# Image backend (production, multi-stage, non-root)
└── .github/workflows/ci.yml  # Intégration continue
```

## Prérequis

- Node.js 20+
- PostgreSQL 16 (ou le PostgreSQL embarqué fourni en dev)
- Redis 7 (optionnel en dev — l'app fonctionne sans cache)

## Configuration

Copier le modèle d'environnement et renseigner les valeurs :

```bash
cp env.example .env            # backend (dev)
# production : voir .env.production.example (à injecter via un gestionnaire de secrets)
```

Variables clés (backend) : `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`ENCRYPTION_KEY`, `REDIS_HOST/PORT/PASSWORD`, `FRONTEND_URL`, `CORS_ORIGINS`, `PORT`.

> ⚠️ **Ne jamais committer de secret.** Les fichiers `.env*` sont ignorés par git
> (sauf les `*.example`). Les secrets de production doivent vivre dans un gestionnaire
> de secrets / des Secrets Kubernetes, pas dans le dépôt.

## Démarrage — Backend (racine)

```bash
npm install
npx prisma generate          # génère le client Prisma
npx prisma migrate dev       # applique les migrations (BDD locale)
npm run seed                 # (optionnel) données de démo
npm run dev                  # démarre l'API en mode dev (http://localhost:5002)
```

- **Documentation interactive de l'API** : http://localhost:5002/api/docs (Swagger)
- **Santé** : http://localhost:5002/api/health

## Démarrage — Frontend web

```bash
cd frontend
npm install
# .env.local : NEXT_PUBLIC_API_URL=http://localhost:5002
npm run dev                  # http://localhost:3001
```

## Démarrage — Mobile

```bash
cd mobile
npm install
# définir API_URL (émulateur Android: http://10.0.2.2:5002 ; iOS sim: http://localhost:5002)
npm run ios     # ou: npm run android
```

## Scripts utiles (backend)

| Commande | Rôle |
|----------|------|
| `npm run dev` | API en développement (rechargement à chaud) |
| `npm run build` | Compilation TypeScript → `dist/` |
| `npm start` | Démarre l'API compilée (`dist/server.js`) |
| `npm test` | Suite de tests (Jest) |
| `npm run seed` | Données de démonstration |

## Tests

```bash
npm test
```

Couverture initiale des **chemins critiques** : génération/validation des tokens,
contrôle d'accès (RBAC) et logique du portefeuille (solde, frais, verrouillage).
Les tests s'exécutent sans base de données (Prisma est mocké) et sont vérifiés en CI.

## Docker (production)

```bash
docker build -f Dockerfile.prod -t afristocks-backend:prod .
docker run --env-file .env.production -p 3000:3000 afristocks-backend:prod
```

## Intégration continue

À chaque push / pull request (`.github/workflows/ci.yml`) :
- **Backend** (bloquant) : `prisma generate` → typecheck → tests → build.
- **Frontend** (informatif) : lint + build.

## Sécurité

- Authentification JWT (access + refresh à **secrets séparés**) ; 2FA TOTP.
- Contrôle d'accès par rôle (RBAC) sur les routes d'administration.
- CORS restreint par liste blanche ; en-têtes durcis (helmet) ; rate-limiting.
- Connexions Socket.io authentifiées (chaque utilisateur n'accède qu'à sa propre room).
- Validation systématique des entrées (express-validator).

Signaler toute vulnérabilité en privé au mainteneur.
