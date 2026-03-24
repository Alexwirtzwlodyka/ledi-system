# RUELL System

[![CI](https://github.com/Alexwirtzwlodyka/ruell-system/actions/workflows/ci.yml/badge.svg)](https://github.com/Alexwirtzwlodyka/ruell-system/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

RUELL es un sistema web para la gestion de usuarios, escribanos, libros PDF, adjuntos PDF y auditoria operativa.

## Estado Actual

Estado relevado sobre el repositorio local al `24/03/2026`.

- Frontend con rutas activas para `Dashboard`, `Escribanos`, `Usuarios`, `Libros`, `Adjuntos` y `Auditoria`
- API disponible bajo `/api/v1` con endpoints para autenticacion, usuarios, escribanos, libros, adjuntos y auditoria
- Persistencia en PostgreSQL con esquema configurable por `DB_SCHEMA`
- Cifrado de PDFs con `AES-256-GCM`
- Autenticacion por sesion con token propio, rate limiting y step-up para descargas sensibles

Validacion realizada en este entorno:

- `node frontend-react/tests/project_contracts.test.mjs`: OK
- `node frontend-react/tests/smoke.test.mjs`: OK
- Backend no verificado por ejecucion local porque `php` no esta disponible en el `PATH`
- Docker no verificado por ejecucion local porque `docker` no esta disponible en el `PATH`

## Repositorio

- GitHub: `https://github.com/Alexwirtzwlodyka/ruell-system`
- Rama principal: `main`

## Stack

- `PHP >= 8.1`
- `React`
- `TypeScript`
- `Vite`
- `PostgreSQL 16`
- `Nginx`
- `Docker Compose`

## Funcionalidades Implementadas

- autenticacion con login, logout y consulta de sesiones activas
- gestion de usuarios con roles `admin`, `operador` y `consulta`
- vinculacion opcional de usuarios con escribanos
- gestion de escribanos con alta, listado, busqueda y edicion
- carga, edicion y descarga de adjuntos PDF por escribano
- carga y descarga de libros PDF vinculados por registro
- auditoria de eventos sensibles

## Arquitectura Real Del Repositorio

- `frontend-react/`: SPA React consumiendo la API de RUELL
- `backend-laravel/`: backend PHP liviano con autoload propio y controladores API
- `ops/`: despliegue productivo, Nginx y scripts operativos
- `docs/`: documentacion funcional, tecnica y operativa

## Ejecucion En Desarrollo

Desde la raiz del proyecto:

```bash
docker compose up --build
```

URLs esperadas:

- Frontend directo: `http://localhost:5173`
- App por Nginx: `http://localhost:8080`
- API: `http://127.0.0.1:8080/api/v1`

Variables principales del stack local:

- base de datos: `ruell`
- usuario PostgreSQL: `ruell`
- esquema: `ruell_app`

## Ejecucion En Servidor Ubuntu

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

URL por defecto:

```text
http://IP_DEL_SERVIDOR:8081
```

## Credenciales Demo

- `admin / Admin.1234`
- `operador1 / Operador.1234`

## Backup Y Restore

Backup:

```bash
bash ops/backup-ruell.sh
```

Restore:

```bash
bash ops/restore-ruell.sh /ruta/al/backup/ruell.dump
```

## Documentacion

- [Documentacion general](docs/README.md)
- [Guia rapida para el equipo](docs/09-onboarding/guia-equipo.md)
- [Arquitectura](docs/01-arquitectura/arquitectura.md)
- [Modelo de datos](docs/03-datos/modelo-datos.md)
- [Seguridad](docs/04-seguridad/seguridad.md)
- [Despliegue](docs/06-despliegue/despliegue.md)
- [Manual de mantenimiento](docs/08-manual-mantenimiento/manual-mantenimiento.md)
- [Guia de entrega para profesor](ENTREGA-PROFESOR.md)

## Pruebas

Backend:

```bash
php backend-laravel/tests/run_project_tests.php
php backend-laravel/tests/run_http_router_tests.php
```

Frontend:

```bash
node frontend-react/tests/project_contracts.test.mjs
node frontend-react/tests/smoke.test.mjs
```
