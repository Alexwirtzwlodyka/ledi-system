# Casos De Uso

## Alcance Funcional Actual

El sistema implementa los siguientes casos de uso principales:

- iniciar sesion y cerrar sesion
- consultar usuarios y escribanos actualmente activos
- administrar usuarios
- administrar escribanos
- cargar, editar y descargar adjuntos PDF por escribano
- cargar y descargar libros PDF por registro
- consultar auditoria operativa

## Reglas De Negocio Relevantes

- solo `admin` puede crear y administrar usuarios
- `admin` y `operador` pueden crear escribanos
- solo `admin` puede editar escribanos
- `admin` y `operador` pueden cargar adjuntos y libros
- la descarga sensible para `admin` exige `step-up`
- los eventos relevantes se registran en auditoria
