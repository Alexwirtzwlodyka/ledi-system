# Manual De Usuario

## Objetivo

LeDi es un sistema para gestionar usuarios, escribanos, adjuntos PDF y auditoria de operaciones sensibles.

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
- `Adjuntos`
- `Auditoria`

Tambien muestra el usuario autenticado y su rol.

## Gestion De Usuarios

Pantalla: `Usuarios`

Permite:

- crear usuarios
- asignar rol
- consultar usuarios existentes

Campos del alta:

- `Username`
- `Email`
- `Contrasena`
- `Rol`

Roles disponibles:

- `admin`
- `operador`
- `consulta`

Uso basico:

1. Completar el formulario.
2. Presionar `Crear usuario`.
3. Verificar que el usuario aparezca en la tabla.

## Gestion De Escribanos

Pantalla: `Escribanos`

Permite:

- registrar nuevos escribanos
- listar escribanos existentes
- buscar por apellido, nombre, DNI o matricula

Campos principales:

- `Apellido`
- `Nombre`
- `DNI`
- `Matricula`
- `Localidad`

Uso basico:

1. Completar el formulario.
2. Presionar `Crear escribano`.
3. Usar el cuadro de busqueda para filtrar resultados.

## Gestion De Adjuntos

Pantalla: `Adjuntos`

Permite:

- seleccionar un escribano
- subir un archivo PDF logico
- listar adjuntos cargados
- descargar adjuntos

Campos de carga:

- `Escribano`
- `Nombre de archivo`
- `Contenido`

## Descarga Con Step-Up

Cuando un usuario `admin` descarga un adjunto, el sistema solicita nuevamente la contrasena para confirmar la operacion.

Flujo:

1. Presionar `Descargar`.
2. Ingresar contrasena en la ventana emergente.
3. Confirmar.
4. El sistema devuelve el contenido del adjunto.

## Auditoria

Pantalla: `Auditoria`

Permite consultar eventos relevantes del sistema:

- inicio de sesion exitoso
- intentos fallidos de login
- altas de usuarios
- altas de escribanos
- cargas de adjuntos

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

`No se pudo subir adjunto`

- verificar que el nombre termine en `.pdf`
- comprobar conectividad con el servidor

`Step-up requerido o invalido`

- volver a intentar la descarga e ingresar la contrasena correcta
