# Entrega Profesor

Esta version esta preparada para desplegarse en un servidor Ubuntu con Docker.

## Contenido importante

- `docker-compose.prod.yml`: stack de produccion
- `backend-laravel/Dockerfile.prod`: backend PHP-FPM
- `ops/nginx/Dockerfile.prod`: build del frontend + Nginx
- `ops/nginx/ledi.prod.conf`: Nginx para produccion
- `ops/backup-ledi.sh`: backup de la base
- `ops/restore-ledi.sh`: restore de la base

## Requisitos del servidor

- Ubuntu 22.04 o similar
- Docker instalado
- Docker Compose v2 instalado

## Despliegue rapido

1. Descomprimir el proyecto en el servidor.
2. Entrar en la carpeta raiz del proyecto.
3. Ejecutar:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

4. Abrir en navegador:

```text
http://IP_DEL_SERVIDOR:8081
```

## Credenciales demo

- `admin / Admin.1234`
- `operador1 / Operador.1234`

## Notas

- El puerto publicado por defecto es `8081` para evitar conflictos con servidores que ya usen `80`.
- PostgreSQL queda interno al stack.
- El seed crea usuarios demo y escribanos demo si no existen.

## Backup y restore

Backup:

```bash
bash ops/backup-ledi.sh
```

Restore:

```bash
bash ops/restore-ledi.sh /ruta/al/backup/ledi.dump
```
