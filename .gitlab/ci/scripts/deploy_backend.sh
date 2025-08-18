#!/usr/bin/env bash
set -euo pipefail

echo "Docker login to GitLab Registry..."
echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"

REMOTE_HOST_FALLBACK=${REMOTE_HOST:-${IP_ADRESS:-}}
REMOTE_USER_FALLBACK=${REMOTE_USER:-${SSH_USER:-root}}

if [ -z "$REMOTE_HOST_FALLBACK" ]; then
  echo "ERROR: REMOTE_HOST/IP_ADRESS not set" >&2
  exit 1
fi

echo "Deploying via SSH to ${REMOTE_USER_FALLBACK}@${REMOTE_HOST_FALLBACK} ..."
ssh "${REMOTE_USER_FALLBACK}@${REMOTE_HOST_FALLBACK}" bash -s << 'EOSSH'
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



