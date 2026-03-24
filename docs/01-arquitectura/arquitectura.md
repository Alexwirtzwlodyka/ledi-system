# Arquitectura

## Vista General

RUELL esta compuesto por una SPA React y una API PHP con almacenamiento en PostgreSQL.

- `frontend-react`: interfaz web React + TypeScript + Vite
- `backend-laravel`: API PHP organizada por dominios y controladores
- `postgres`: persistencia relacional
- `nginx`: publicacion del frontend y proxy hacia la API

## Backend Real

El backend no depende de Laravel completo ni de Sanctum.

La implementacion actual usa:

- `bootstrap.php` con carga de variables de entorno y autoload propio
- controladores en `app/Http/Controllers/Api/V1`
- servicios y repositorios por dominio en `app/Domain`
- `AppFactory` para cablear dependencias
- `Database` como capa de acceso a PostgreSQL y provision de tablas

## Dominios Implementados

- `Auth`
- `User`
- `Escribano`
- `Adjunto`
- `Libro`
- `Common` para respuestas, router y auditoria

## Frontend Real

La SPA expone las siguientes pantallas:

- `Login`
- `Dashboard`
- `Escribanos`
- `Usuarios`
- `Libros`
- `Adjuntos`
- `Auditoria`

## Despliegue

Desarrollo con `docker-compose.yml`:

- `postgres`
- `backend`
- `frontend`
- `nginx`

Produccion con `docker-compose.prod.yml`:

- `postgres`
- `backend`
- `nginx`
