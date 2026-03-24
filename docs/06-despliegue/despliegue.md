# Despliegue

## Desarrollo

Stack definido en `docker-compose.yml`:

- `postgres`
- `backend`
- `frontend`
- `nginx`

Comando:

```bash
docker compose up --build
```

URLs esperadas:

- `http://localhost:5173`
- `http://localhost:8080`
- `http://127.0.0.1:8080/api/v1`

Variables tecnicas observadas:

- `POSTGRES_DB=ruell`
- `POSTGRES_USER=ruell`
- `POSTGRES_PASSWORD=ruell_secret`
- `DB_SCHEMA=ruell_app`

## Produccion En Ubuntu

Stack definido en `docker-compose.prod.yml`:

- `postgres`
- `backend`
- `nginx`

Comando:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

URL publicada por defecto:

```text
http://IP_DEL_SERVIDOR:8081
```

Artefactos operativos asociados:

- `ops/nginx/ruell.prod.conf`
- `ops/backup-ruell.sh`
- `ops/restore-ruell.sh`

## Repositorio

- remoto esperado: `https://github.com/Alexwirtzwlodyka/ruell-system.git`

## Verificacion En Este Entorno

- despliegue Docker no verificado localmente por ausencia de `docker` en el `PATH`
