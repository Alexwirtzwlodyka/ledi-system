# Manual De Usuario

## Objetivo

RUELL permite gestionar usuarios, escribanos, libros PDF, adjuntos PDF y auditoria de operaciones sensibles.

## Acceso Al Sistema

URL de ejemplo:

```text
http://IP_DEL_SERVIDOR:8081
```

Usuarios demo:

- `admin / Admin.1234`
- `operador1 / Operador.1234`

## Inicio De Sesion

1. Abrir la URL del sistema.
2. Ingresar usuario y contrasena.
3. Presionar `Entrar`.
4. Si las credenciales son correctas, el sistema redirige al `Dashboard`.

## Dashboard

El panel principal muestra accesos directos a:

- `Dashboard`
- `Escribanos`
- `Usuarios`
- `Libros`
- `Adjuntos`
- `Auditoria`

Tambien muestra el usuario autenticado, su rol y el resumen operativo del sistema.

## Gestion De Usuarios

Pantalla: `Usuarios`

Permite:

- crear usuarios
- asignar rol
- vincular un usuario con un escribano
- consultar usuarios existentes

Roles disponibles:

- `admin`
- `operador`
- `consulta`

Regla importante:

- solo el rol `admin` puede dar de alta o administrar usuarios

## Gestion De Escribanos

Pantalla: `Escribanos`

Permite:

- registrar nuevos escribanos
- listar escribanos existentes
- buscar por apellido, nombre, DNI o matricula
- editar datos del escribano cuando el rol lo permite

Reglas importantes:

- `admin` y `operador` pueden crear escribanos
- solo `admin` puede editarlos

## Gestion De Libros

Pantalla: `Libros`

Permite:

- seleccionar un registro
- cargar un PDF asociado al registro
- listar libros cargados
- descargar libros existentes

Regla importante:

- las descargas sensibles para `admin` pueden solicitar confirmacion adicional

## Gestion De Adjuntos

Pantalla: `Adjuntos`

Permite:

- seleccionar un escribano
- subir un archivo PDF
- listar adjuntos cargados
- editar nombre o contenido del adjunto
- descargar adjuntos

## Descarga Con Step-Up

Cuando un usuario `admin` realiza una descarga sensible, el sistema puede solicitar nuevamente la contrasena para confirmar la operacion.

Flujo:

1. Presionar `Descargar`.
2. Ingresar contrasena en la ventana emergente.
3. Confirmar.
4. El sistema devuelve el contenido del PDF.

## Auditoria

Pantalla: `Auditoria`

Permite consultar eventos relevantes del sistema:

- inicios de sesion exitosos
- intentos fallidos de login
- altas de usuarios
- altas o cambios de escribanos
- cargas y descargas sensibles de documentos

## Buenas Practicas De Uso

- usar usuarios personales y no compartir credenciales
- revisar la auditoria ante operaciones sensibles
- mantener actualizada la informacion de escribanos
- verificar el nombre del PDF antes de subirlo

## Errores Frecuentes

`Credenciales invalidas`

- revisar usuario y contrasena

`No autenticado`

- volver a iniciar sesion

`No se pudo subir adjunto o libro`

- verificar que el archivo corresponda a un PDF
- comprobar conectividad con el servidor

`Step-up requerido o invalido`

- volver a intentar la descarga e ingresar la contrasena correcta
