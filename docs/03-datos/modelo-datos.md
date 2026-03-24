# Modelo De Datos

## Configuracion Base

- motor: `PostgreSQL 16`
- base de datos por defecto: `ruell`
- esquema principal por defecto: `ruell_app`

## Tablas Observadas En La Implementacion Actual

- `users`
- `sessions`
- `step_up_tokens`
- `audit_logs`
- `escribanos`
- `adjuntos`
- `libros`

## Descripcion Resumida

`users`

- credenciales, rol, estado y datos de contacto
- permite vinculacion opcional con un escribano mediante `escribano_id_vinculado`

`sessions`

- sesiones activas e historicas con token, IP y user agent

`step_up_tokens`

- tokens temporales para confirmar descargas sensibles

`audit_logs`

- eventos auditables con actor, accion, destino y metadatos

`escribanos`

- datos personales, matricula, registro, estado y direcciones separadas

`adjuntos`

- PDFs cifrados asociados a un escribano

`libros`

- PDFs cifrados asociados a un registro
