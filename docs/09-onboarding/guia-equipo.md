# Guia Rapida Para El Equipo

## Objetivo

Esta guia sirve para que cualquier integrante del equipo pueda clonar RUELL, levantarlo en local y validar que el entorno minimo funciona.

## Requisitos

- `git`
- `Docker Desktop` o Docker Engine con Compose v2

## Clonado

```bash
git clone https://github.com/Alexwirtzwlodyka/ruell-system.git
cd ruell-system
```

## Arranque En Desarrollo

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Servicios esperados:

- frontend Vite en `http://localhost:5173`
- app por Nginx en `http://localhost:8080`
- API en `http://127.0.0.1:8080/api/v1`

## Credenciales Demo

- `admin / Admin.1234`
- `operador1 / Operador.1234`

## Verificacion Rapida

1. Abrir `http://localhost:8080`
2. Iniciar sesion con `admin`
3. Confirmar acceso a `Dashboard`, `Escribanos`, `Usuarios`, `Libros`, `Adjuntos` y `Auditoria`

## Comandos Utiles

Detener el stack:

```bash
docker compose down
```

Recrear imagenes:

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs --tail=100 nginx
docker compose logs --tail=100 postgres
```

## Si Algo Falla

- revisar que Docker este iniciado
- comprobar que los puertos `5173`, `8080` y `5432` no esten ocupados
- volver a ejecutar `docker compose up --build`
- revisar [despliegue.md](f:/AI%20para%20programadores%20UTN/CLASE%204/Desafio/REINGENIERIA%20-%20LEDI/Implemntacion/LeDi%20System%20Specification%20v1.1/ledi-system-implementacion-real%20actualizado%202/ledi-system/docs/06-despliegue/despliegue.md)
- revisar [manual-mantenimiento.md](f:/AI%20para%20programadores%20UTN/CLASE%204/Desafio/REINGENIERIA%20-%20LEDI/Implemntacion/LeDi%20System%20Specification%20v1.1/ledi-system-implementacion-real%20actualizado%202/ledi-system/docs/08-manual-mantenimiento/manual-mantenimiento.md)
