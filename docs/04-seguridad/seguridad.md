# Seguridad

## Controles Implementados

- hash de contrasenas
- autenticacion por sesion con token
- rate limiting en login
- `step-up` para operaciones sensibles
- cifrado `AES-256-GCM` para PDFs
- auditoria de eventos relevantes

## Observaciones Del Estado Actual

- la autenticacion observada es propia del sistema, no basada en Sanctum
- el `step-up` se usa para descargas sensibles de `adjuntos` y `libros`
- los roles activos observados son `admin`, `operador` y `consulta`
