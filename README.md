# LeDi System

LeDi es un sistema web para la gestion de usuarios, escribanos, adjuntos PDF y auditoria operativa.

El proyecto incluye:

- backend PHP orientado a API
- frontend React
- persistencia en PostgreSQL
- despliegue con Docker Compose
- documentacion funcional y tecnica

## Stack

- `PHP 8.3`
- `React`
- `Vite`
- `PostgreSQL 16`
- `Nginx`
- `Docker Compose`

## Funcionalidades

- autenticacion de usuarios
- gestion de usuarios y roles
- gestion de escribanos
- carga y descarga de adjuntos PDF
- auditoria de eventos sensibles
- despliegue portable para Ubuntu

## Ejecucion En Desarrollo

Desde la raiz del proyecto:

```bash
docker compose up --build
```

URLs:

- Frontend directo: `http://localhost:5173`
- App por Nginx: `http://localhost:8080`
- API: `http://127.0.0.1:8080/api/v1`

## Ejecucion En Servidor Ubuntu

Esta version incluye despliegue productivo:

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
bash ops/backup-ledi.sh
```

Restore:

```bash
bash ops/restore-ledi.sh /ruta/al/backup/ledi.dump
```

## Documentacion

- [Documentacion general](docs/README.md)
- [Manual de usuario](docs/07-manual-usuario/manual-usuario.md)
- [Manual de mantenimiento](docs/08-manual-mantenimiento/manual-mantenimiento.md)
- [Guia de entrega para profesor](ENTREGA-PROFESOR.md)

## Pruebas

Backend:

```bash
php backend-laravel/tests/run_project_tests.php
```

Frontend:

```bash
node frontend-react/tests/project_contracts.test.mjs
```

## Estado Del Repositorio

El repositorio ya incluye:

- despliegue productivo para Ubuntu
- scripts de backup y restore
- seed idempotente de datos demo
- documentacion para usuario final y mantenimiento
