# LeDi System

Repositorio base del proyecto LeDi con una implementacion MVP orientada a Laravel + React + PostgreSQL.

## Incluye
- Backend PHP orientado a API con auth, usuarios, escribanos y adjuntos cifrados.
- Frontend React con pantallas base del sistema.
- Documentacion del proyecto.
- Utilidades de migracion inicial.

## Levantar con Docker
1. Instalar y abrir Docker Desktop.
2. Pararse en la carpeta raiz del proyecto.
3. Ejecutar:

```bash
docker compose up --build

El backend ahora persiste en PostgreSQL dentro del contenedor `postgres`. Compose espera a que la base este saludable antes de arrancar PHP-FPM y ejecuta `migrate` + `seed` al iniciar.
```

## URLs
- Frontend directo: `http://localhost:5173`
- App via nginx: `http://localhost:8080`
- API: `http://127.0.0.1:8080/api/v1`

## Credenciales demo
- admin / Admin.1234
- operador1 / Operador.1234

## Ejecutar pruebas
```bash
php backend-laravel/tests/run_project_tests.php
node frontend-react/tests/project_contracts.test.mjs
```
