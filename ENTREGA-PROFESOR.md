# Entrega Profesor

Esta version esta preparada para desplegarse en un servidor Ubuntu con Docker y actualmente expone funcionalidades de usuarios, escribanos, libros, adjuntos y auditoria.

## Contenido Importante

- `docker-compose.prod.yml`: stack de produccion
- `backend-laravel/Dockerfile.prod`: backend PHP
- `ops/nginx/Dockerfile.prod`: build del frontend + Nginx
- `ops/nginx/ruell.prod.conf`: Nginx para produccion
- `ops/backup-ruell.sh`: backup de la base
- `ops/restore-ruell.sh`: restore de la base

## Requisitos Del Servidor

- Ubuntu 22.04 o similar
- Docker instalado
- Docker Compose v2 instalado

## Despliegue Rapido

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

## Credenciales Demo

- `admin / Admin.1234`
- `operador1 / Operador.1234`

## Notas

- el puerto publicado por defecto es `8081`
- PostgreSQL queda interno al stack
- el backend corre migracion y seed al iniciar
- la API publica rutas para `auth`, `users`, `escribanos`, `libros`, `adjuntos` y `audit`

## Estado Verificado En Este Workspace

Relevamiento local del `24/03/2026`:

- frontend validado con pruebas locales disponibles
- backend no ejecutado localmente por falta de `php`
- docker no ejecutado localmente por falta de `docker`

## Backup Y Restore

Backup:

```bash
bash ops/backup-ruell.sh
```

Restore:

```bash
bash ops/restore-ruell.sh /ruta/al/backup/ruell.dump
```
