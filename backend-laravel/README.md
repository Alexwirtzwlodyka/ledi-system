# LeDi Backend ejecutable

Base API ejecutable en PHP sobre PostgreSQL, con estructura Laravel-oriented.

## Qué incluye
- login, logout y sesiones
- usuarios y roles
- escribanos con filtros
- adjuntos PDF cifrados
- auditoría
- step-up para descargas sensibles

## Arranque rápido
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
DB_DATABASE=ledi
DB_USERNAME=ledi
DB_PASSWORD=ledi_secret
DB_SCHEMA=ledi_app
```

## Credenciales demo
- admin / Admin.1234
- operador1 / Operador.1234

## Tests
```bash
php tests/run_project_tests.php
php tests/run_http_router_tests.php
```
