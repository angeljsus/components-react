# Login

## Descripción

El módulo permite consultar el estado de la conexion a internet y el acceso a la dirección.

## Requerimientos

- Asignar el archivo al servidor para hacer el ping, para validar el acceso al archivo con la URL.
- **linea 9**: modificar con la ruta del archivo PHP.

## Resultados

- La variable `online` almacena el valor del estado de internet: `false` si no tiene acceso y `true` si es que lo tiene.
- La variable `statusAccessURL` almacena el valor del estado de acceso a la URL: si no tiene acceso y `true` si es que lo tiene.
- Los mensajes que apareceran en el componente:

```js
- online : Si tiene acceso a la URL 
- online : NO tienes acceso a la URL
```

