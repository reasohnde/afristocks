#!/usr/bin/env bash
set -euo pipefail

echo "Docker login to GitLab Registry..."
echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"

echo "Deploying via SSH to $REMOTE_USER@$REMOTE_HOST ..."
ssh "$REMOTE_USER@$REMOTE_HOST" bash -s << 'EOSSH'
set -euo pipefail
echo "Pulling images and updating services..."
docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" pull
docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" up -d
docker image prune -f || true

if [ -n "${PM_PORT:-}" ]; then
  echo "Healthcheck on http://127.0.0.1:${PM_PORT}/health"
  curl -fsS "http://127.0.0.1:${PM_PORT}/health" || { docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" logs --no-color --tail=200; exit 1; }
else
  echo "PM_PORT not set; showing docker ps"
  docker ps
fi
EOSSH

echo "Deployment completed."


