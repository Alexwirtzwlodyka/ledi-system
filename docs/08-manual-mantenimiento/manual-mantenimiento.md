# Manual De Mantenimiento

## Objetivo

Este documento describe como desplegar, operar, respaldar y mantener RUELL en un servidor Ubuntu.

## Arquitectura Operativa

El despliegue de produccion usa:

- `nginx`
- `backend` PHP
- `postgres`
- `docker compose`

Archivo principal:

- `docker-compose.prod.yml`

Repositorio esperado:

- `https://github.com/Alexwirtzwlodyka/ruell-system`

## Requisitos

- Ubuntu 22.04 o compatible
- Docker instalado
- Docker Compose v2 instalado

## Despliegue Inicial

1. Clonar o copiar el proyecto en el servidor.
2. Entrar a la carpeta raiz.
3. Ejecutar:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

4. Verificar:

```bash
docker compose -f docker-compose.prod.yml ps
```

5. Acceder desde navegador:

```text
http://IP_DEL_SERVIDOR:8081
```

## Servicios Del Stack

- `postgres`: base de datos PostgreSQL
- `backend`: API del sistema
- `nginx`: frontend compilado y proxy hacia la API

## Parametros Operativos Por Defecto

- base de datos: `ruell`
- usuario PostgreSQL: `ruell`
- esquema principal: `ruell_app`
- volumen persistente: `ruell_postgres_data`

## Credenciales Iniciales

- `admin / Admin.1234`
- `operador1 / Operador.1234`

Se recomienda cambiarlas despues del primer uso.

## Operacion Basica

Levantar servicios:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Detener servicios:

```bash
docker compose -f docker-compose.prod.yml down
```

Reconstruir imagenes:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ver estado:

```bash
docker compose -f docker-compose.prod.yml ps
```

Ver logs:

```bash
docker compose -f docker-compose.prod.yml logs --tail=100 backend
docker compose -f docker-compose.prod.yml logs --tail=100 nginx
docker compose -f docker-compose.prod.yml logs --tail=100 postgres
```

## Seed De Datos Demo

El backend ejecuta migracion y seed al iniciar.

Tambien se puede correr manualmente:

```bash
docker compose -f docker-compose.prod.yml exec -T backend php bin/seed.php
```

El seed es idempotente para:

- usuario `admin`
- usuario `operador1`
- escribanos demo por `DNI`

## Base De Datos

La base usa PostgreSQL y el esquema principal por defecto es:

```text
ruell_app
```

El backend crea y ajusta tablas al iniciar mediante su capa `Database`.

Tablas principales:

- `users`
- `sessions`
- `step_up_tokens`
- `audit_logs`
- `escribanos`
- `adjuntos`
- `libros`

Consulta util:

```bash
docker compose -f docker-compose.prod.yml exec -T postgres psql -U ruell -d ruell
```

## Backup

Script incluido:

```bash
bash ops/backup-ruell.sh
```

Resultado:

- dump PostgreSQL en formato custom
- estado de contenedores
- configuraciones del despliegue

Ubicacion:

```text
backups/YYYYMMDD-HHMMSS/
```

## Restore

Script incluido:

```bash
bash ops/restore-ruell.sh /ruta/al/backup/ruell.dump
```

El restore:

- levanta el stack necesario
- recrea el esquema `ruell_app`
- restaura el dump

## Actualizacion Del Sistema

1. Actualizar el working tree desde `main` o desplegar una nueva version del repositorio.
2. Reconstruir:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

3. Verificar:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

## Seguridad Operativa

- cambiar contrasenas demo en ambientes reales
- limitar acceso de red al puerto publicado
- usar HTTPS si el sistema se expone fuera de red interna
- revisar periodicamente la tabla de auditoria
- proteger los backups

## Troubleshooting

`La aplicacion no abre`

- revisar `docker compose ... ps`
- verificar que `nginx` este `Up`
- comprobar que el puerto `8081` este libre

`El login falla`

- revisar logs del backend
- verificar que el seed haya corrido
- comprobar existencia del usuario en PostgreSQL

`No sube adjuntos o libros`

- verificar extension o contenido esperado
- revisar logs de `nginx` y `backend`

`El backend arranca pero no responde`

- confirmar que `postgres` este `healthy`
- revisar credenciales de BD en `docker-compose.prod.yml`

`El restore falla`

- verificar que el dump exista
- ejecutar el script desde la raiz del proyecto
- revisar permisos de Docker y espacio en disco

## Estado De Verificacion De Esta Documentacion

Relevado sobre el workspace actual al `24/03/2026`.

- frontend validado con pruebas locales
- backend sin ejecucion local por falta de `php` en el entorno
- docker sin ejecucion local por falta de `docker` en el entorno
