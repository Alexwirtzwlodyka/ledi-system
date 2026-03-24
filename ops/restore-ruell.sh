#!/usr/bin/env bash
set -euo pipefail

SUDO=""

if [[ "${EUID}" -ne 0 ]]; then
  SUDO="sudo"
fi

if [[ $# -ne 1 ]]; then
  echo "Uso: $0 /ruta/al/backup/ruell.dump" >&2
  exit 1
fi

DUMP_FILE="$1"
if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "No existe el archivo: ${DUMP_FILE}" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

${SUDO} docker compose -f docker-compose.prod.yml up -d postgres backend nginx

${SUDO} docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U ruell -d ruell -c "DROP SCHEMA IF EXISTS ruell_app CASCADE; CREATE SCHEMA ruell_app;"

cat "${DUMP_FILE}" | ${SUDO} docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U ruell -d ruell --clean --if-exists --no-owner --no-privileges

echo "Restore completado desde ${DUMP_FILE}"
