#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_ROOT="${ROOT_DIR}/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET_DIR="${BACKUP_ROOT}/${STAMP}"
SUDO=""

if [[ "${EUID}" -ne 0 ]]; then
  SUDO="sudo"
fi

mkdir -p "${TARGET_DIR}"

cd "${ROOT_DIR}"

${SUDO} docker compose -f docker-compose.prod.yml up -d postgres >/dev/null

${SUDO} docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U ledi -d ledi -Fc > "${TARGET_DIR}/ledi.dump"

${SUDO} docker compose -f docker-compose.prod.yml ps > "${TARGET_DIR}/compose-ps.txt"

tar -czf "${TARGET_DIR}/deploy-configs.tar.gz" \
  docker-compose.prod.yml \
  backend-laravel/Dockerfile.prod \
  backend-laravel/bin/seed.php \
  ops/nginx/Dockerfile.prod \
  ops/nginx/ledi.prod.conf

cat <<EOF
Backup creado en:
  ${TARGET_DIR}

Archivos:
  ledi.dump
  compose-ps.txt
  deploy-configs.tar.gz
EOF
