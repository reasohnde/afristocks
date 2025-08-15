# Déploiement backend (monorepo GitLab)

## Prérequis
- Monorepo avec `backend/` et `frontend/` poussé sur GitLab (branche par défaut `main`).
- Runner GitLab avec Docker-in-Docker (images `docker:27` + service `docker:27-dind`).
- Serveur Linux avec Docker + docker compose.
- Fichier `.env` sur le serveur: `/srv/afristocks/.env` (ne jamais le committer).

## Variables CI/CD (GitLab → Settings → CI/CD → Variables)
Créer ces variables (Masked + Protected si prod):
- `SSH_PRIVATE_KEY`: clé privée OpenSSH du compte de déploiement.
- `REMOTE_HOST`: FQDN/IP du serveur.
- `REMOTE_USER`: utilisateur SSH (ex: `deploy`).
- `COMPOSE_FILE`: chemin compose sur le serveur (ex: `/srv/afristocks/docker-compose.yml`).
- `COMPOSE_PROJECT`: nom de projet compose (ex: `afristocks`).
- `PM_PORT`: port HTTP pour `/health` (ex: `5001`).

Variables fournies automatiquement par GitLab Registry: `CI_REGISTRY`, `CI_REGISTRY_IMAGE`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`.

## Premier déploiement
1. Copier l'exemple `server/docker-compose.example.yml` sur le serveur en `/srv/afristocks/docker-compose.yml` et adapter `<GROUP_PATH>/<PROJECT_NAME>` et les ports.
2. Créer `/srv/afristocks/.env` avec vos secrets (DATABASE_URL, JWT_SECRET, etc.).
3. Merger sur `main` un commit modifiant `backend/**`.
4. Le pipeline exécute: test → build & push image → deploy via SSH (compose pull + up -d).
5. Vérification:
   ```bash
   curl -fsS http://<REMOTE_HOST>:<PM_PORT>/health
   ```
   En cas d'échec, les logs s'affichent automatiquement (`docker compose ... logs --tail=200`).

## Rollback (image taggée par SHA)
```bash
# Sur le serveur
docker pull registry.gitlab.com/<GROUP_PATH>/<PROJECT_NAME>/backend:<SHA7>
docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" up -d
```
Ou revert la MR précédente (publiera un nouveau `latest`).

## Bonnes pratiques
- Aucun secret en clair; utiliser les variables GitLab et le `.env` serveur.
- Protéger `main` (Protected Branch) + MR obligatoires.
- Ajouter un job `deploy:staging` (variables dédiées) si besoin.
- Logs rapides:
  ```bash
  docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" logs --tail=200
  ```

## Séparation en 2 dépôts (historique conservé)
### Option simple (git subtree)
```bash
# Backend
git subtree split --prefix=backend -b backend-split
git remote add gitlab_backend <URL_repo_backend>
git push gitlab_backend backend-split:main

# Frontend
git subtree split --prefix=frontend -b frontend-split
git remote add gitlab_frontend <URL_repo_frontend>
git push gitlab_frontend frontend-split:main
```

### Option propre (git filter-repo)
```bash
# Backend
git clone --no-local . ../afristocks-backend-extract
cd ../afristocks-backend-extract
git filter-repo --path backend --path-rename backend:
git remote add origin <URL_repo_backend>
git push -u origin main

# Frontend
git clone --no-local . ../afristocks-frontend-extract
cd ../afristocks-frontend-extract
git filter-repo --path frontend --path-rename frontend:
git remote add origin <URL_repo_frontend>
git push -u origin main
```

Après séparation : copier le CI/README adéquats et recréer les variables CI/CD dans chaque dépôt.
