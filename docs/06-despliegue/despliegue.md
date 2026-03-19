# Despliegue

Nginx + PHP-FPM + PostgreSQL + frontend Vite compilado.

## Produccion en Ubuntu

- Stack: `docker compose -f docker-compose.prod.yml up -d --build`
- URL publicada por defecto: `http://<host>:8081`
- Backup: `bash ops/backup-ledi.sh`
- Restore: `bash ops/restore-ledi.sh /ruta/al/backup/ledi.dump`
