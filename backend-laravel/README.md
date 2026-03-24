# RUELL Backend ejecutable

Base API ejecutable en PHP sobre PostgreSQL, con estructura Laravel-oriented liviana.

## Que Incluye

- login, logout y sesiones
- usuarios y roles
- escribanos con filtros
- adjuntos PDF cifrados
- libros PDF por registro
- auditoria
- step-up para descargas sensibles

## Arranque Rapido

```bash
php bin/migrate.php
php bin/seed.php
php -S 127.0.0.1:8080 public/index.php
```

Variables de entorno esperadas:

```bash
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ruell
DB_USERNAME=ruell
DB_PASSWORD=ruell_secret
DB_SCHEMA=ruell_app
```

## Credenciales Demo

- `admin / Admin.1234`
- `operador1 / Operador.1234`

## Tests

```bash
php tests/run_project_tests.php
php tests/run_http_router_tests.php
```
